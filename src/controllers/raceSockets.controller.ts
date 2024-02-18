import {
	MessageResponse,
} from "../services/commonTypes.service";
import {RacesServiceType} from "../services/races.service";


const { v4: uuidv4 } = require("uuid");
const { serverError } = require("../utils/errors.util");

const paragraphsService = require("../services/paragraphs.service");
const raceService = require("../services/races.service");
const scoreService = require("../services/scores.service");
const { randomInteger } = require("../utils/common.util");
const {
	rooms,
	join: joinRoom,
	leave: leaveRoom,
} = require("../socketRooms");

enum SocketAction {
	STATUS = "status",
	COUNTDOWN = "countdown",
}

interface MessageStatus {
	userId: number | string,
	speed: number,
	position: number,
	timings: number,
	done: boolean,
}

interface Message {
	roomId: string,
	action: SocketAction,
	message: MessageStatus,
}

const getRandomParagraphId = async (next): Promise<number> => {
	// Ищем случайный параграф для гонки
	const paragraphIds = await paragraphsService.getMany({
		returning: ["id"],
	});
	if (!paragraphIds) {
		return next(serverError("Error creating a race"));
	}
	const randomParagraphId = paragraphIds[randomInteger(0, paragraphIds.length - 1)].id;

	return randomParagraphId;
};

const findSocketRace = async (req, res, next): MessageResponse => {
	const isPersonal: boolean = req.query.personal === "true";
	let races: RacesServiceType[] = [];
	let raceId: number | null = null;
	let raceUuid: string | null = null;

	/*
	 Ищем существующую race только, если не personal.
	 race не найдена - создаём новую - отправляем её id, uuid
	 race personal - создаём новую - отправляем её id, uuid
	 race найдена и не personal - отправляем её id, uuid
	*/

	if (!isPersonal) {
		races = await raceService.getMany({
			filter: {
				queueable: "true",
				personal: "false",
			},
			order: {
				direction: "desc",
				field: "created_at",
			},
			returning: ["id", "uuid"],
		});

		const race = races?.[0];
		raceId = race?.id;
		raceUuid = race?.uuid;
	}

	if (!raceId) {
		const randomParagraphId = await getRandomParagraphId(next);

		const raceNew = await raceService.create({
			paragraph_id: randomParagraphId,
			active: false,
			queueable: true,
			personal: !!isPersonal,
		});
		const raceNewData = raceNew?.data;
		const raceNewId = raceNewData?.id;
		const raceNewUuid = raceNewData?.uuid;

		if (!raceNew) {
			return next(serverError("Error creating a new race"));
		}

		return res.json({
			message: "A new race created",
			data: {
				id: raceNewId,
				uuid: raceNewUuid,
			},
		});
	} else {
		return res.json({
			message: "Race found",
			data: {
				id: raceId,
				uuid: raceUuid,
			},
		});
	}
};

const heartbeat = (ws) => {
	ws.isAlive = true;
};

const kick = (roomUuid, ws) => {
	leaveRoom(roomUuid, ws.clientId);
	ws.terminate();
};

const runCountdown = (secondsFrom: 3 | 10, roomId: string, clients, closeQueueCb) => {
	return new Promise((resolve, reject) => {
		let timeLeft = secondsFrom * 1000;
		let secondsToMillisDelay: number | null = null;

		/*
			If cooldown is 3 seconds, then tick every 3 seconds
			If 10 seconds, tick every 2.5 seconds
			3 seconds CD for personal mode and 10 seconds for a normal queue
		*/
		if (secondsFrom === 3) {
			secondsToMillisDelay = 3000;
		} else if (secondsFrom === 10) {
			secondsToMillisDelay = 2500;
		}

		const sendCountdownTick = () => {
			console.log(`Launched countdown (${timeLeft})`);
			// Send every tick to all users withing a room (race)
			clients.forEach((client) => {
				client.send(JSON.stringify({
					roomId,
					action: SocketAction.COUNTDOWN,
					message: {
						timeLeft,
					},
				}));
			});

			if (timeLeft === 5000) {
				// Run unqueue callback to set queueable to false
				closeQueueCb();
			} else if (timeLeft === 0) {
				// Cooldown ended
				clearInterval(countdownInterval);
				resolve(null);
			}

			timeLeft -= secondsToMillisDelay;
		};

		sendCountdownTick();
		const countdownInterval = setInterval(sendCountdownTick, secondsToMillisDelay);
	});
};

const joinSocketRace = (WS) => (ws, req) => {
	const { uuid: roomUuid } = req.params;
	const namedUserId = req.user?.id;
	const userId = namedUserId as number || uuidv4() as string;

	ws.clientId = userId;
	ws.isGuest = !namedUserId;

	joinRoom(roomUuid, userId, ws); // roomId === race uuid

	// Get the data needed for the race that we just joined
	raceService.getMany({
		filter: {
			uuid: roomUuid,
		},
		returning: ["id", "personal", "paragraph_id"],
	})
		.then(async ([race]) => {
			const usersCountInRace = Object.keys(rooms[roomUuid]).length;

			console.log("users in room", usersCountInRace);
			if (race.personal || usersCountInRace > 1) {
				runCountdown(
					race.personal ? 3 : 10,
					roomUuid,
					Object.values(rooms[roomUuid]),
					async () => {
						/*
							We need to block the queue for this race earlier so that people
							don't get in when there's 1 second left
					 	*/
						try {
							await raceService.update(race.id, {
								queueable: false,
								active: true,
							});
							console.log("changed race to queueable = false");
						} catch(err) {
							console.log("Error updating a race status");
							return kick(roomUuid, ws);
						}
					},
				).then(async () => {
					try {
						const paragraphs = await paragraphsService.getMany({
							filter: {
								id: String(race.paragraph_id),
							},
						});

						if (!paragraphs?.[0]) {
							throw new Error("Paragraph does not exist");
						}

						// Timing after which the race will be closed
						// Detecting based on how many symbols a paragraph contains
						// TODO: Calculate based on user's average typing speed
						const ms = paragraphs[0].text.length * 1000 * 2;

						console.log("setting timeout");
						setTimeout(() => {
							// Close the race after the delay
							raceService.update(race.id, {
								active: false,
								queueable: false,
							});
							console.log("updated race to active: false, queueable: false");
						}, ms);
					} catch (err) {
						console.log("Error closing a race", err);
					}
				});
			}
		});

	ws.on("pong", () => heartbeat(ws));
	ws.on("close", () => {
		leaveRoom(roomUuid, userId);
		console.log("Disconnected");
	});
	ws.on("message", (msg) => {
		try {
			const { roomId, action, message }: Message = JSON.parse(msg);

			if (action === SocketAction.STATUS) {
				const statusOutput: Message = {
					roomId,
					action: SocketAction.STATUS,
					message: {
						speed: message.speed,
						position: message.position,
						done: message.done,
						timings: message.timings,
						userId: ws.clientId,
					},
				};

				Object.values(rooms[roomId]).forEach((client: typeof ws) => {
					if (ws.clientId !== client.clientId) {
						client.send(JSON.stringify(statusOutput));
					}
				});

				if (!ws.isGuest && message.done) {
					raceService.getMany({
						filter: {
							uuid: roomUuid,
						},
						returning: ["id", "paragraph_id"],
					}).then((races) => {
						const race = races[0];
						scoreService.create({
							race_id: race.id,
							paragraph_id: race.paragraph_id,
							user_id: ws.clientId,
							speed: message.speed,
							timings: message.timings,
						});
					});
				}
			}

		} catch(err) {
			console.log("Error during a socket message exchange");
			console.log(err);
			kick(roomUuid, ws);
		}
	});
};

module.exports = {
	findSocketRace,
	joinSocketRace,
};

export {};

import {
	MessageResponse,
} from "../services/commonTypes.service";


const { v4: uuidv4 } = require("uuid");
const { serverError } = require("../utils/errors.util");

const paragraphsService = require("../services/paragraphs.service");
const raceService = require("../services/races.service");
const { randomInteger } = require("../utils/common.util");
const {
	rooms,
	join: joinRoom,
	leave: leaveRoom,
} = require("../socketRooms");

enum SocketAction {
	STATUS = "status",
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

const findSocketRace = async (req, res, next): MessageResponse => {
	const races = await raceService.getMany({
		filter: {
			queueable: "true",
		},
		order: {
			direction: "desc",
			field: "created_at",
		},
		returning: ["id", "uuid"],
	});

	const race = races?.[0];
	const raceId = race?.id;
	const raceUuid = race?.uuid;

	if (!raceId) {
		const paragraphIds = await paragraphsService.getMany({
			returning: ["id"],
		});
		if (!paragraphIds) {
			return next(serverError("Error creating a race"));
		}
		const randomParagraphId = paragraphIds[randomInteger(0, paragraphIds.length - 1)].id;

		const raceNew = await raceService.create({
			paragraph_id: randomParagraphId,
			active: false,
			queueable: true,
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
		res.json({ message: "Found a race", data: { id: raceId, uuid: raceUuid }});
	}
};

const heartbeat = (ws) => {
	ws.isAlive = true;
};

const kick = (roomUuid, ws) => {
	leaveRoom(roomUuid, ws.clientId);
	ws.terminate();
};

const joinSocketRace = (WS) => (ws, req) => {
	const { uuid: roomUuid } = req.params;
	const userId = req.user?.id as number || uuidv4() as string;
	ws.clientId = userId;

	joinRoom(roomUuid, userId, ws); // roomId === race uuid

	ws.on("pong", () => heartbeat(ws));
	ws.on("close", () => {
		leaveRoom(roomUuid, userId);
		console.log("Disconnected");
	});
	ws.on("message", (msg) => {
		try {
			const { roomId, action, message }: Message = JSON.parse(msg);

			if (action === SocketAction.STATUS) {
				Object.values(rooms[roomId]).forEach((client: typeof ws) => {
					if (ws.clientId !== client.clientId) {
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
						// TODO: Save to "scores" table if message.done === true
						client.send(JSON.stringify(statusOutput));
					}
				});
			}

		} catch(err) {
			console.log("Invalid message");
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

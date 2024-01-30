import {
	MessageResponse,
} from "../services/commonTypes.service";

const { serverError } = require("../utils/errors.util");

const paragraphsService = require("../services/paragraphs.service");
const raceService = require("../services/races.service");
const { randomInteger } = require("../utils/common.utils");

const findSocketRace = async (req, res, next): MessageResponse => {
	const races = await raceService.getMany({ filter: { queueable: "true" }});
	const race = races?.[0];
	const raceId = race?.id;
	const raceUuid = race?.uuid;
	console.log("existing queueable race", race);

	if (!raceId) {
		const paragraphIds = await paragraphsService.getMany({ returning: ["id"]});
		if (!paragraphIds) {
			return next(serverError("Error creating a race"));
		}
		const randomParagraphId = paragraphIds[randomInteger(0, paragraphIds.length - 1)].id;

		const raceNew = await raceService.create({
			paragraph_id: randomParagraphId,
			active: false,
			queueable: true,
		});
		const raceNewId = raceNew?.data?.id;
		const raceNewUuid = raceNew?.data?.uuid;
		console.log("new race", raceNew);

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

module.exports = {
	findSocketRace,
};

export {};

const { check } = require("express-validator");
const service = require("../services/races.service");
const userRaceService = require("../services/user_race.service");
const { getControllerToServiceFilter } = require("../utils/controller.util");
const error = require("../utils/errors.util");

const paragraphIdCheck = check("paragraph_id")
	.isNumeric().withMessage("Paragraph id should be a number");
const userIdsCheck = check("user_ids")
	.isArray().withMessage("User ids should be an array of numbers")
	.custom((value) => {
		if (!value?.length) throw new Error("User ids should not be an empty array");
		if (!value?.every(Number.isInteger)) throw new Error("User ids should be an array of numbers");
		return true;
	});

const createValidators = [
	paragraphIdCheck,
	userIdsCheck,
];
const editValidators = createValidators.map(item => item.optional());

const get = async (req, res, next) => {
	try {
		res.json(await service.getMany(getControllerToServiceFilter(req.query)));
	} catch (err) {
		console.log("Error while getting a race", err);
		next(err);
	}
};

const create = async (req, res, next) => {
	try {
		const { paragraph_id, user_ids } = req.body;

		const race = await service.create({
			paragraph_id,
		});

		if (!race?.data?.id) {
			return next(error.serverError("Error while creating a race"));
		}

		await Promise.all(
			user_ids.map(user_id =>
				userRaceService.create({
					user_id,
					race_id: race?.data?.id,
				}),
			),
		);

		res.json({ message: race.message });
	} catch (err) {
		console.log("Error while creating a race", err);
		next(err);
	}
};

const update = async (req, res, next) => {
	try {
		res.json(await service.update(req.params.id, req.body));
	} catch (err) {
		console.log("Error while updating a race", err);
		next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		res.json(await service.remove(req.params.id));
	} catch (err) {
		console.log("Error while deleting a race", err);
		next(err);
	}
};

module.exports = {
	get,
	create,
	update,
	remove,
	createValidators,
	editValidators,
};

export {};

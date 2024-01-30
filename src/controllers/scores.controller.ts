const { check } = require("express-validator");
const service = require("../services/scores.service");
const { getControllerToServiceFilter } = require("../utils/controller.util");

const paragraphIdCheck = check("paragraph_id")
	.isNumeric().withMessage("Paragraph id should be a number");
const userIdCheck = check("user_id")
	.isNumeric().withMessage("User id should be a number");
const raceIdCheck = check("race_id")
	.isNumeric().withMessage("Race id should be a number");
const speedCheck = check("speed")
	.isInt({ gt: -1, lt: 10000 }).withMessage("Speed should be an integer from 0 to 10000");
const timingsCheck = check("timings")
	.isArray().withMessage("Timings should be an array")
	.custom(value => {
		if (!value?.every(Number.isInteger)) throw new Error("Timings array should only contain numbers");
		return true;
	});

const createValidators = [
	paragraphIdCheck,
	userIdCheck,
	raceIdCheck,
	speedCheck,
	timingsCheck,
];
const editValidators = createValidators.map(item => item.optional());

const get = async (req, res, next) => {
	try {
		res.json(await service.getMany(getControllerToServiceFilter(req.query)));
	} catch (err) {
		console.log("Error while getting a score", err);
		next(err);
	}
};

const create = async (req, res, next) => {
	try {
		res.json(await service.create(req.body));
	} catch (err) {
		console.log("Error while creating a score", err);
		next(err);
	}
};

const update = async (req, res, next) => {
	try {
		res.json(await service.update(req.params.id, req.body));
	} catch (err) {
		console.log("Error while updating a score", err);
		next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		res.json(await service.remove(req.params.id));
	} catch (err) {
		console.log("Error while deleting a score", err);
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

const { check } = require("express-validator");
const service = require("../services/langs.service");
const { getControllerToServiceFilter } = require("../utils/controller.util");

const nameCheck = check("name")
	.isLength({ min: 3, max: 20 }).withMessage("Language name should be between 3 and 20 characters long")
	.isString().withMessage("Language name should be a string")
	.isAlpha().withMessage("Language name should only contain alphabetic letters");
const imgUrlCheck = check("img")
	.isLength({ min: 1, max: 400 }).withMessage("Image url should be between 1 and 400 characters")
	.isURL().withMessage("Image url should have a valid URL format");

const createValidators = [
	nameCheck,
	imgUrlCheck.optional(),
];

const editValidators = [
	nameCheck.optional(),
	imgUrlCheck.optional({ checkFalsy: true }),
];

const get = async (req, res, next) => {
	try {
		res.json(await service.getMany(getControllerToServiceFilter(req.query)));
	} catch (err) {
		console.log("Error while getting langs", err);
		next(err);
	}
};

const create = async (req, res, next) => {
	try {
		res.json(await service.create(req.body));
	} catch (err) {
		console.log("Error while creating a lang", err);
		next(err);
	}
};

const update = async (req, res, next) => {
	try {
		res.json(await service.update(req.params.id, req.body));
	} catch (err) {
		console.log("Error while updating a lang", err);
		next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		res.json(await service.remove(req.params.id));
	} catch (err) {
		console.log("Error while deleting a lang", err);
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

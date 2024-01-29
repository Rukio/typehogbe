import {check} from "express-validator";

const service = require("../services/sources.service");
const { getControllerToServiceFilter } = require("../utils/controller.util");

const nameCheck = check("title")
	.isLength({ min: 3, max: 100 }).withMessage("Source title should be between 3 and 100 characters long")
	.isString().withMessage("Source title should be a string");
const authorCheck = check("author")
	.isLength({ min: 3, max: 100 }).withMessage("Author should be between 3 and 100 characters long")
	.isString().withMessage("Author should be a string");
const imgUrlCheck = check("img")
	.isLength({ min: 1, max: 400 }).withMessage("Image url should be between 1 and 400 characters")
	.isURL().withMessage("Image url should have a valid URL format");

const createValidators = [
	nameCheck,
	authorCheck.optional(),
	imgUrlCheck.optional(),
];

const editValidators = [
	nameCheck.optional(),
	authorCheck.optional({ checkFalsy: true }),
	imgUrlCheck.optional({ checkFalsy: true }),
];

const get = async (req, res, next) => {
	try {
		res.json(await service.getMany(getControllerToServiceFilter(req.query)));
	} catch (err) {
		console.log("Error while getting sources", err);
		next(err);
	}
};

const create = async (req, res, next) => {
	try {
		res.json(await service.create(req.body));
	} catch (err) {
		console.log("Error while creating a source", err);
		next(err);
	}
};

const update = async (req, res, next) => {
	try {
		res.json(await service.update(req.params.id, req.body));
	} catch (err) {
		console.log("Error while updating a source", err);
		next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		res.json(await service.remove(req.params.id));
	} catch (err) {
		console.log("Error while deleting a source", err);
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

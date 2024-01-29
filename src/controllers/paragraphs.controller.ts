const { check } = require("express-validator");
const service = require("../services/paragraphs.service");
const { getControllerToServiceFilter } = require("../utils/controller.util");

const titleCheck = check("title")
	.isLength({ min: 3, max: 100 }).withMessage("Paragraph title should be between 3 and 20 characters long")
	.isString().withMessage("Paragraph title should be a string");
const textCheck = check("text")
	.isLength({ min: 10, max: 3000 }).withMessage("Paragraph text should be between 10 and 3000 characters long")
	.isString().withMessage("Paragraph text should be a string");
const imgUrlCheck = check("img")
	.isLength({ min: 1, max: 400 }).withMessage("Image url should be between 1 and 400 characters")
	.isURL().withMessage("Image url should have a valid URL format");
const sourceIdCheck = check("source_id")
	.isNumeric().withMessage("Source id should be a number");
const langIdCheck = check("lang_id")
	.isNumeric().withMessage("Lang id should be a number");

const createValidators = [
	titleCheck,
	textCheck,
	sourceIdCheck,
	langIdCheck,
	imgUrlCheck.optional(),
];

const editValidators = [
	titleCheck.optional(),
	textCheck.optional(),
	sourceIdCheck.optional(),
	langIdCheck.optional(),
	imgUrlCheck.optional({ checkFalsy: true }),
];

const get = async (req, res, next) => {
	try {
		res.json(await service.getMany(getControllerToServiceFilter(req.query)));
	} catch (err) {
		console.log("Error while getting paragraphs", err);
		next(err);
	}
};

const create = async (req, res, next) => {
	try {
		res.json(await service.create(req.body));
	} catch (err) {
		console.log("Error while creating a paragraph", err);
		next(err);
	}
};

const update = async (req, res, next) => {
	try {
		res.json(await service.update(req.params.id, req.body));
	} catch (err) {
		console.log("Error while updating a paragraph", err);
		next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		res.json(await service.remove(req.params.id));
	} catch (err) {
		console.log("Error while deleting a paragraph", err);
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

import {check} from "express-validator";

const service = require("../services/roles.service");
const { getControllerToServiceFilter } = require("../utils/controller.util");

const nameCheck = check("name")
	.isLength({ min: 3, max: 20 }).withMessage("Role name should be between 3 and 20 characters long")
	.isString().withMessage("Role name should be a string")
	.isAlpha().withMessage("Role name should only contain alphabetic letters");
const rightCheck = (rightField: string) =>
	check(rightField)
		.isBoolean().withMessage("Role right should be a boolean type");

const createValidators = [
	nameCheck,
	rightCheck("can_edit_paragraphs"),
	rightCheck("can_delete_paragraphs"),
	rightCheck("can_edit_scores"),
	rightCheck("can_delete_scores"),
	rightCheck("can_edit_sources"),
	rightCheck("can_delete_sources"),
	rightCheck("can_view_roles"),
	rightCheck("can_edit_roles"),
	rightCheck("can_delete_roles"),
	rightCheck("can_view_users"),
	rightCheck("can_edit_users"),
	rightCheck("can_delete_users"),
	rightCheck("can_edit_races"),
	rightCheck("can_delete_races"),
	rightCheck("can_edit_langs"),
	rightCheck("can_delete_langs"),
	rightCheck("can_edit_user_race"),
	rightCheck("can_delete_user_race"),
];

const editValidators = createValidators.map(item => item.optional());

const get = async (req, res, next) => {
	try {
		res.json(await service.getMany(getControllerToServiceFilter(req.query)));
	} catch (err) {
		console.log("Error while getting roles", err);
		next(err);
	}
};

const create = async (req, res, next) => {
	try {
		res.json(await service.create(req.body));
	} catch (err) {
		console.log("Error while creating a role", err);
		next(err);
	}
};

const update = async (req, res, next) => {
	try {
		res.json(await service.update(req.params.id, req.body));
	} catch (err) {
		console.log("Error while updating a role", err);
		next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		res.json(await service.remove(req.params.id));
	} catch (err) {
		console.log("Error while deleting a role", err);
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

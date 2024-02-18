import {UsersServiceType} from "../services/users.service";
import {RolesServiceType} from "../services/roles.service";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { check } = require("express-validator");
const { ACCESS_TOKEN_SECRET } = require("../configs/db.config");
const service = require("../services/users.service");
const rolesService = require("../services/roles.service");
const error = require("../utils/errors.util");
const { getControllerToServiceFilter } = require("../utils/controller.util");

const passwordCheck = check("password", "Password length should be from 6 to 20 characters long")
	.isLength({ min: 6, max: 20 });
const emailCheck = check("email", "Email should have a correct format")
	.isEmail();
const nameCheck = check("name")
	.isLength({ min: 3, max: 20 }).withMessage("Name should be between 3 and 20 characters long")
	.isString().withMessage("Name should be a string")
	.isAlpha().withMessage("Name should only contain alphabetic letters");
const countryCheck = check("country", "Country name should be from 1 to 30 characters long")
	.isLength({ min: 1, max: 30 });
const imgUrlCheck = check("img")
	.isLength({ min: 1, max: 400 }).withMessage("Image url should be between 1 and 400 characters")
	.isURL().withMessage("Image url should have a valid URL format");

const registrationValidators = [
	nameCheck,
	emailCheck,
	passwordCheck,
];

const loginValidators = [
	emailCheck,
	passwordCheck,
];

const userEditValidators = [
	nameCheck.optional(),
	emailCheck.optional(),
	countryCheck.optional({ checkFalsy: true }),
	imgUrlCheck.optional({ checkFalsy: true }),
];

type UserAuthResponseType = Pick<UsersServiceType, "id" | "name" | "email">
	& {
		role: RolesServiceType;
		token: string;
	};

const getUserResponseByData = (
	user: Pick<UserAuthResponseType, "id" | "name" | "email">,
	userRole: RolesServiceType,
): UserAuthResponseType => {
	const userJwtObj: Pick<UserAuthResponseType, "id" | "name" | "email" | "role"> = {
		id: user.id,
		name: user.name,
		email: user.email,
		role: userRole,
	};
	const token: string = jwt.sign(userJwtObj, ACCESS_TOKEN_SECRET, { expiresIn: "24h" });

	return {
		...userJwtObj,
		token,
	};
};

const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const invalidCredsMessage = "Invalid email or password";

		const user = await service.getOneBy("email", email);
		if (!user) {
			return next(error.badRequest(invalidCredsMessage));
		}

		const userRole = await rolesService.getOneById(user.role_id);
		if (!userRole) {
			return next(error.serverError("Server error"));
		}

		const validPassword = bcrypt.compareSync(password, user.password);
		if (!validPassword) {
			return next(error.badRequest(invalidCredsMessage));
		}

		const { token } = getUserResponseByData(user, userRole);

		res.json({ token });
	} catch (err) {
		console.log("Login error");
		next(err);
	}
};

const registration = async (req, res, next) => {
	const { name, email, password } = req.body;

	try {
		const userByName = await service.getOneBy("name", name);
		const userByEmail = await service.getOneBy("email", email);

		if (userByName) {
			return next(error.badRequest("User with this name already exist"));
		} else if (userByEmail) {
			return next(error.badRequest("User with this email already exist"));
		}

		const userRoles = await rolesService.getMany({ filter: { name: "user" }});
		const userRole = userRoles?.[0];
		const userRoleId = userRole?.id;

		if (!userRoleId) {
			return next(error.badRequest("Server error"));
		}

		const passwordHash = bcrypt.hashSync(password, 8);

		await service.create({
			name,
			email,
			password: passwordHash,
			role_id: userRoleId,
			regdate: Date.now(),
		});
		const newUser = await service.getOneBy("email", email);

		const resultData = getUserResponseByData(newUser, userRole);

		res.json(resultData);

	} catch (err) {
		console.log("Registration error");
		next(err);
	}
};

const getProfile = async (req, res, next) => {
	try {
		const user = req.user;

		if (!user?.id) {
			return next(error.unauthorized("Not authorized"));
		}

		const userActual = await service.getOneBy("id", user.id);

		if (!userActual.id) {
			return next(error.unauthorized("Not authorized"));
		}

		res.json({
			name: userActual.name,
			email: userActual.email,
			country: userActual.country,
			img: userActual.img,
			regdate: userActual.regdate,
		});
	} catch (err) {
		console.log("Error while getting a user profile", err);
		next(err);
	}
};

const get = async (req, res, next) => {
	try {
		res.json(await service.getMany(getControllerToServiceFilter(req.query)));
	} catch (err) {
		console.log("Error while getting users", err);
		next(err);
	}
};

const create = async (req, res, next) => {
	try {
		res.json(await service.create(req.body));
	} catch (err) {
		console.log("Error while creating a user", err);
		next(err);
	}
};

const update = async (req, res, next) => {
	try {
		res.json(await service.update(req.params.id, req.body));
	} catch (err) {
		console.log("Error while updating a user", err);
		next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		res.json(await service.remove(req.params.id));
	} catch (err) {
		console.log("Error while deleting a user", err);
		next(err);
	}
};

module.exports = {
	login,
	registration,
	getProfile,
	get,
	create,
	update,
	remove,
	registrationValidators,
	loginValidators,
	userEditValidators,
};

export {};

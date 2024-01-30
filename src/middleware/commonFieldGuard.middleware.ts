const { badRequest } = require("../utils/errors.util");

module.exports = (req, res, next) => {
	const body = req.body;

	if (
		"created_at" in body ||
    "updated_at" in body ||
		"id" in body ||
		"uuid" in body
	) {
		return next(badRequest("Can't modify system properties"));
	}

	if ((req.method === "PUT" || req.method === "POST") && !Object.keys(body)?.length) {
		return next(badRequest("The request body is empty"));
	}

	return next();
};

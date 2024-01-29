const { checkFormErrors } = require("../utils/controller.util");

module.exports = (message: string) => (req, res, next) => {
	const nextWithErrors = checkFormErrors(message, req, next);
	if (nextWithErrors) {
		return nextWithErrors();
	}
	next();
};

export {};

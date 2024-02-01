const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require("../configs/db.config");

module.exports = async (req, res, next) => {
	if (req.method === "OPTIONS") {
		return next();
	}

	try {
		const token = req.headers.authorization.split(" ")[1];

		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
		if (decoded?.id) {
			req.user = decoded;
		}

		next();
	} catch (err) {
		next();
	}
};

export {};

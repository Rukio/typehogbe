const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require("../configs/db.config");

module.exports = async (req, res, next) => {
	if (req.method === "OPTIONS") {
		return next();
	}

	const notAllowedResponse = () => res.status(403).json({
		message: "Not allowed",
	});

	try {
		const token = req.headers.authorization.split(" ")[1];

		if (!token) {
			return notAllowedResponse();
		}

		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
		req.user = decoded;

		next();
	} catch(err) {
		console.log(req);
		console.log("Not allowed res");
		return notAllowedResponse();
	}
};

export {};

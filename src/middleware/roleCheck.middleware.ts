const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require("../configs/db.config");
const { getOneBy: getUserBy } = require("../services/users.service");
const { getOneById: getRoleById } = require("../services/roles.service");

module.exports = (rightsRequired: string[]) => {
	return async (req, res, next) => {
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

			const userActual = await getUserBy("id", req.user.id);
			if (!userActual) {
				return notAllowedResponse();
			}

			let role = req.user.role;
			const roleIdActual = userActual.role_id;
			if (role.id !== roleIdActual) {
				// If a role has been changed since token has been generated,
				// get the new user's role data

				role = await getRoleById(roleIdActual);
			}

			let clear = true;

			rightsRequired.forEach(right => {
				if (!role?.[right]) {
					clear = false;
				}
			});

			if (clear) {
				next();
			} else {
				return notAllowedResponse();
			}
		} catch(err) {
			return notAllowedResponse();
		}
	};
};

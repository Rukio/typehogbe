import { ErrorUtilValue } from "../utils/errors.util";

module.exports = ({ code, message, info }: ErrorUtilValue, req, res, _next) => {
	return res.status(code).json({ message: message, info });
};

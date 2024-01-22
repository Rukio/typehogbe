import { ErrorUtilValue } from "../utils/errors.util";

module.exports = ({ code, message }: ErrorUtilValue, req, res, next) => {
  return res.status(code).json({ message: message });
};

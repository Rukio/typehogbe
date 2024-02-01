const exp = require("express");
const router = exp.Router();
const controller = require("../controllers/raceSockets.controller");
const authAssignMiddleware = require("../middleware/authAssign.middleware");

module.exports = (WS) => {
	router.get("/race/find", controller.findSocketRace);
	router.use("/race/:uuid", authAssignMiddleware);
	router.ws("/race/:uuid", controller.joinSocketRace(WS));
	return router;
};

export {};

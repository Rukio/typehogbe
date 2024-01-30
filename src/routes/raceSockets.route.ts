const exp = require("express");
const router = exp.Router();
const controller = require("../controllers/raceSockets.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/race/find", authMiddleware, controller.findSocketRace);
router.use("/race/:id", authMiddleware);
router.ws("/race/:id", (ws, req) => {
	console.log("Connection established");
	ws.send("You are connected to WS!");
	ws.on("message", (msg) => {
		console.log(`A nice message: ${msg}`);
	});
});

module.exports = router;

export {};

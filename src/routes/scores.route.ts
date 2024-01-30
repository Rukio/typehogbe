const exp = require("express");
const router = exp.Router();

const controller = require("../controllers/scores.controller");
const {
	CAN_EDIT_SCORES,
	CAN_DELETE_SCORES,
} = require("../configs/roleRights.config");

const roleCheckMiddleware = require("../middleware/roleCheck.middleware");
const formErrorHandlerMiddleware = require("../middleware/formErrorHandler.middleware");

const formErrorMessage = "Invalid score format";

router.ws("/race", (ws, req) => {
	console.log("Connection established");
	ws.send("You are connected to WS!");
	ws.on("message", (msg) => {
		console.log(`A nice message: ${msg}`);
	});
});
router.get("/", controller.get);
router.post("/",
	roleCheckMiddleware([CAN_EDIT_SCORES]),
	controller.createValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.create,
);
router.put("/:id",
	roleCheckMiddleware([CAN_EDIT_SCORES]),
	controller.editValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.update,
);
router.delete("/:id", roleCheckMiddleware([CAN_DELETE_SCORES]), controller.remove);

module.exports = router;

export {};

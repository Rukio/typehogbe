const exp = require("express");
const router = exp.Router();

const controller = require("../controllers/races.controller");
const {
	CAN_EDIT_RACES,
	CAN_DELETE_RACES,
} = require("../configs/roleRights.config");

const roleCheckMiddleware = require("../middleware/roleCheck.middleware");
const formErrorHandlerMiddleware = require("../middleware/formErrorHandler.middleware");

const formErrorMessage = "Invalid race format";

router.get("/", controller.get);
router.post("/",
	roleCheckMiddleware([CAN_EDIT_RACES]),
	controller.createValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.create,
);
router.put("/:id",
	roleCheckMiddleware([CAN_EDIT_RACES]),
	controller.editValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.update,
);
router.delete("/:id",roleCheckMiddleware([CAN_DELETE_RACES]), controller.remove);

module.exports = router;

export {};

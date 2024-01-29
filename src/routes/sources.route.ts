const exp = require("express");
const router = exp.Router();

const controller = require("../controllers/sources.controller");
const {
	CAN_EDIT_SOURCES,
	CAN_DELETE_SOURCES,
} = require("../configs/roleRights.config");

const roleCheckMiddleware = require("../middleware/roleCheck.middleware");
const formErrorHandlerMiddleware = require("../middleware/formErrorHandler.middleware");

const formErrorMessage = "Invalid source format";

router.get("/", controller.get);
router.post("/",
	roleCheckMiddleware([CAN_EDIT_SOURCES]),
	controller.createValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.create,
);
router.put("/:id",
	roleCheckMiddleware([CAN_EDIT_SOURCES]),
	controller.editValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.update,
);
router.delete("/:id", roleCheckMiddleware([CAN_DELETE_SOURCES]), controller.remove);

module.exports = router;

export {};

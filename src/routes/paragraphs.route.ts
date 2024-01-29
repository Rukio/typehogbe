const exp = require("express");
const router = exp.Router();

const controller = require("../controllers/paragraphs.controller");
const {
	CAN_EDIT_PARAGRAPHS,
	CAN_DELETE_PARAGRAPHS,
} = require("../configs/roleRights.config");

const roleCheckMiddleware = require("../middleware/roleCheck.middleware");
const formErrorHandlerMiddleware = require("../middleware/formErrorHandler.middleware");

const formErrorMessage = "Invalid paragraph format";

router.get("/", controller.get);
router.post("/",
	roleCheckMiddleware([CAN_EDIT_PARAGRAPHS]),
	controller.createValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.create,
);
router.put("/:id",
	roleCheckMiddleware([CAN_EDIT_PARAGRAPHS]),
	controller.editValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.update,
);
router.delete("/:id",roleCheckMiddleware([CAN_DELETE_PARAGRAPHS]), controller.remove);

module.exports = router;

export {};

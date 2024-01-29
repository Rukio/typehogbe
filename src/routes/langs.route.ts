const exp = require("express");
const router = exp.Router();

const controller = require("../controllers/langs.controller");
const {
	CAN_EDIT_LANGS,
	CAN_DELETE_LANGS,
} = require("../configs/roleRights.config");

const roleCheckMiddleware = require("../middleware/roleCheck.middleware");
const formErrorHandlerMiddleware = require("../middleware/formErrorHandler.middleware");

const formErrorMessage = "Invalid language format";

router.get("/", controller.get);
router.post("/",
	roleCheckMiddleware([CAN_EDIT_LANGS]),
	controller.createValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.create,
);
router.put("/:id",
	roleCheckMiddleware([CAN_EDIT_LANGS]),
	controller.editValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.update,
);
router.delete("/:id",roleCheckMiddleware([CAN_DELETE_LANGS]), controller.remove);

module.exports = router;

export {};

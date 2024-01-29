const exp = require("express");
const router = exp.Router();

const controller = require("../controllers/users.controller");
const {
	CAN_VIEW_USERS,
	CAN_EDIT_USERS,
	CAN_DELETE_USERS,
} = require("../configs/roleRights.config");

const authMiddleware = require("../middleware/auth.middleware");
const roleCheckMiddleware = require("../middleware/roleCheck.middleware");
const formErrorHandlerMiddleware = require("../middleware/formErrorHandler.middleware");

router.get("/profile", authMiddleware, controller.getProfile);
router.get("/", roleCheckMiddleware([CAN_VIEW_USERS]), controller.get);
router.post("/", roleCheckMiddleware([CAN_EDIT_USERS]), controller.create);
router.post("/registration",
	controller.registrationValidators,
	formErrorHandlerMiddleware("Invalid registration format"), // should always go after "controller.***Validators"
	controller.registration,
);
router.post("/login",
	controller.loginValidators,
	formErrorHandlerMiddleware("Invalid login format"),
	controller.login,
);
router.put(
	"/:id",
	roleCheckMiddleware([CAN_EDIT_USERS]),
	controller.userEditValidators,
	formErrorHandlerMiddleware("Invalid user format"),
	controller.update,
);
router.delete("/:id",
	roleCheckMiddleware([CAN_DELETE_USERS]),
	controller.remove
);

module.exports = router;

export {};

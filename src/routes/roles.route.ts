const exp = require("express");
const router = exp.Router();

const rolesController = require("../controllers/roles.controller");

router.get("/", rolesController.get);
router.post("/", rolesController.create);
router.put("/:id", rolesController.update);
router.delete("/:id", rolesController.remove);

module.exports = router;

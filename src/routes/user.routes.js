const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

router.use(requireAdmin);

router.get("/", controller.getUsers);
router.post("/", controller.createUser);
router.put("/:id", controller.updateUser);

module.exports = router;

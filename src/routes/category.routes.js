const express = require("express");
const router = express.Router();
const controller = require("../controllers/category.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

router.get("/", controller.getCategories);
router.post("/", requireAdmin, controller.createCategory);
router.put("/:id", requireAdmin, controller.updateCategory);
router.delete("/:id", requireAdmin, controller.deleteCategory);

module.exports = router;

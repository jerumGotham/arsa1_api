const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middlewares/auth.middleware");
const controller = require("../controllers/product.controller");

router.post("/", requireAdmin, controller.createProduct);
router.get("/", controller.getProducts);
router.get("/:id", controller.getProductById);
router.put("/:id", requireAdmin, controller.updateProduct);
router.delete("/:id", requireAdmin, controller.deleteProduct);

module.exports = router;

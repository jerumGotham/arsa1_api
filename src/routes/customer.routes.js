const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middlewares/auth.middleware");
const controller = require("../controllers/customer.controller");

router.post("/", controller.createCustomer);
router.get("/", controller.getCustomers);
router.get("/:id/prices", controller.getCustomerPrices);
router.get("/:id", controller.getCustomerById);
router.put("/:id", requireAdmin, controller.updateCustomer);
router.delete("/:id", requireAdmin, controller.deleteCustomer);

module.exports = router;

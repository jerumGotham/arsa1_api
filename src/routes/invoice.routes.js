const express = require("express");
const InvoiceController = require("../controllers/invoice.controller");

const router = express.Router();

router.get("/latest", InvoiceController.getLatestInvoice);
router.get("/order/:orderId", InvoiceController.getInvoiceByOrderId);

module.exports = router;

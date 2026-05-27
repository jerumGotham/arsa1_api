const express = require("express");
const router = express.Router();
const controller = require("../controllers/report.controller");

router.get("/orders/excel", controller.downloadOrdersExcel);

module.exports = router;

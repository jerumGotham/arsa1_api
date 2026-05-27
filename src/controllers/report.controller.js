const ReportService = require("../services/report.service");

exports.downloadOrdersExcel = async (req, res, next) => {
  try {
    await ReportService.generateOrdersExcel(req.query, res);
  } catch (error) {
    next(error);
  }
};

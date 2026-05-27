const DashboardService = require("../services/dashboard.service");

exports.getSummary = async (req, res, next) => {
  try {
    const summary = await DashboardService.getSummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

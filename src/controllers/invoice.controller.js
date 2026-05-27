const InvoiceService = require("../services/invoice.service");

exports.getLatestInvoice = async (req, res, next) => {
  try {
    const invoice = await InvoiceService.getLatestInvoice();

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

exports.getInvoiceByOrderId = async (req, res, next) => {
  try {
    const invoice = await InvoiceService.getInvoiceByOrderId(
      req.params.orderId,
    );

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

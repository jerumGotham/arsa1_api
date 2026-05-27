const OrderService = require("../services/order.service");

exports.createOrder = async (req, res, next) => {
  try {
    const order = await OrderService.createOrder(req.body);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await OrderService.getOrders(req.query);

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await OrderService.getOrderById(req.params.id);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

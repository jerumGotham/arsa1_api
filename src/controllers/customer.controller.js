const CustomerService = require("../services/customer.service");

exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await CustomerService.createCustomer(req.body);

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await CustomerService.getCustomers(req.query.search);

    res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerById = async (req, res, next) => {
  console.log("Fetching customer with ID:", req.params.id); // Debug log
  try {
    const customer = await CustomerService.getCustomerById(req.params.id);

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await CustomerService.updateCustomer(
      req.params.id,
      req.body,
    );

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    await CustomerService.deleteCustomer(req.params.id);

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

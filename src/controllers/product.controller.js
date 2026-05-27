const ProductService = require("../services/product.service");

exports.createProduct = async (req, res, next) => {
  try {
    const product = await ProductService.createProduct(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await ProductService.getProducts(req.query.search);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await ProductService.getProductById(req.params.id);

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await ProductService.deleteProduct(req.params.id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

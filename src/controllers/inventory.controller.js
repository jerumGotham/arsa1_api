const InventoryService = require("../services/inventory.service");

exports.getInventory = async (req, res, next) => {
  try {
    const inventory = await InventoryService.getInventory(req.query);

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

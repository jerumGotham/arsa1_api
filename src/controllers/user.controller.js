const UserService = require("../services/user.service");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await UserService.getUsers();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const user = await UserService.createUser(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await UserService.updateUser(
      req.params.id,
      req.body,
      req.user,
    );

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

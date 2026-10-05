const AuthService = require("../services/auth.service");

exports.login = async (req, res, next) => {
  try {
    const result = await AuthService.login(
      req.body.username,
      req.body.password,
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
};

exports.changePassword = async (req, res, next) => {
  try {
    await AuthService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword,
    );

    res.json({
      success: true,
      message: "Password updated",
    });
  } catch (error) {
    next(error);
  }
};

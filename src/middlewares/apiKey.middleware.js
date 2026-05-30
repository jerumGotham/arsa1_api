function apiKeyMiddleware(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.APP_API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  next();
}

module.exports = { apiKeyMiddleware };

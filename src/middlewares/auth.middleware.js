const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Please log in" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res
        .status(401)
        .json({ success: false, message: "Session expired, please log in again" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, username: true, role: true, active: true },
    });

    if (!user || !user.active) {
      return res
        .status(401)
        .json({ success: false, message: "Account is disabled" });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this feature",
      });
    }

    next();
  };
}

const requireAdmin = requireRole("ADMIN");

module.exports = { requireAuth, requireRole, requireAdmin };

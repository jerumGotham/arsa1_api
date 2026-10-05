const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const { HttpError } = require("../utils/httpError");

const TOKEN_TTL = process.env.JWT_EXPIRES_IN || "30d";

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

class AuthService {
  static hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  static async login(username, password) {
    if (!username || !password) {
      throw new HttpError(400, "Username and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { username: String(username).trim().toLowerCase() },
    });

    const valid = user && (await bcrypt.compare(password, user.passwordHash));

    if (!valid) {
      throw new HttpError(401, "Invalid username or password");
    }

    if (!user.active) {
      throw new HttpError(403, "Account is disabled. Please contact the admin.");
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_TTL },
    );

    return { token, user: publicUser(user) };
  }

  static async changePassword(userId, currentPassword, newPassword) {
    if (!newPassword || String(newPassword).length < 6) {
      throw new HttpError(400, "New password must be at least 6 characters");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (
      !user ||
      !(await bcrypt.compare(currentPassword || "", user.passwordHash))
    ) {
      throw new HttpError(400, "Current password is incorrect");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await AuthService.hashPassword(newPassword) },
    });
  }
}

module.exports = AuthService;

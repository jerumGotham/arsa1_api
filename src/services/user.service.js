const prisma = require("../prisma");
const AuthService = require("./auth.service");
const { HttpError } = require("../utils/httpError");

const ROLES = ["ADMIN", "AGENT"];

const userSelect = {
  id: true,
  name: true,
  username: true,
  role: true,
  active: true,
  createdAt: true,
  _count: { select: { orders: true } },
};

class UserService {
  static async getUsers() {
    return prisma.user.findMany({
      select: userSelect,
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });
  }

  static async createUser(data) {
    const { name, username, password, role = "AGENT" } = data;

    if (!name?.trim() || !username?.trim()) {
      throw new HttpError(400, "Name and username are required");
    }

    if (!password || String(password).length < 6) {
      throw new HttpError(400, "Password must be at least 6 characters");
    }

    if (!ROLES.includes(role)) {
      throw new HttpError(400, "Invalid role");
    }

    return prisma.user.create({
      data: {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        passwordHash: await AuthService.hashPassword(password),
        role,
      },
      select: userSelect,
    });
  }

  static async updateUser(id, data, currentUser) {
    const { name, role, active, password } = data;
    const update = {};

    if (name !== undefined) update.name = String(name).trim();

    if (role !== undefined) {
      if (!ROLES.includes(role)) throw new HttpError(400, "Invalid role");
      update.role = role;
    }

    if (active !== undefined) update.active = Boolean(active);

    if (password) {
      if (String(password).length < 6) {
        throw new HttpError(400, "Password must be at least 6 characters");
      }
      update.passwordHash = await AuthService.hashPassword(password);
    }

    // An admin must not lock themselves out.
    if (
      id === currentUser.id &&
      (update.active === false || update.role === "AGENT")
    ) {
      throw new HttpError(400, "You cannot disable or demote your own account");
    }

    return prisma.user.update({
      where: { id },
      data: update,
      select: userSelect,
    });
  }
}

module.exports = UserService;

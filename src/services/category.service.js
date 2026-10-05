const prisma = require("../prisma");
const { HttpError } = require("../utils/httpError");

class CategoryService {
  static async getCategories() {
    return prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  }

  static async createCategory(data) {
    const name = String(data.name || "").trim();

    if (!name) {
      throw new HttpError(400, "Category name is required");
    }

    return prisma.category.create({ data: { name } });
  }

  static async updateCategory(id, data) {
    const name = String(data.name || "").trim();

    if (!name) {
      throw new HttpError(400, "Category name is required");
    }

    return prisma.category.update({ where: { id }, data: { name } });
  }

  // Products in this category become uncategorized (onDelete: SetNull).
  static async deleteCategory(id) {
    return prisma.category.delete({ where: { id } });
  }
}

module.exports = CategoryService;

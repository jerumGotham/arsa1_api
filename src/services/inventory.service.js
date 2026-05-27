const prisma = require("../prisma");

class InventoryService {
  static async getInventory(query) {
    const { search } = query;

    return prisma.inventory.findMany({
      where: search
        ? {
            product: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
              ],
            },
          }
        : {},
      include: {
        product: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }
}

module.exports = InventoryService;

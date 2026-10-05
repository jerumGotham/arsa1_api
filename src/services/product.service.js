const prisma = require("../prisma");

const productInclude = {
  inventory: true,
  category: true,
};

// Only these fields may be written from the client.
function pickProductData(data) {
  const out = {};

  if (data.name !== undefined) out.name = String(data.name).trim();
  if (data.sku !== undefined) out.sku = data.sku ? String(data.sku).trim() : null;
  if (data.price !== undefined) out.price = data.price;
  if (data.description !== undefined) out.description = data.description;
  if (data.categoryId !== undefined) out.categoryId = data.categoryId || null;

  return out;
}

class ProductService {
  static async createProduct(data) {
    const { originalQuantity, remainingQuantity } = data;
    const quantity = Number(originalQuantity ?? remainingQuantity ?? 0);

    return prisma.product.create({
      data: {
        ...pickProductData(data),
        inventory: {
          create: {
            originalQuantity: quantity,
            soldQuantity: 0,
            remainingQuantity: quantity,
          },
        },
      },
      include: productInclude,
    });
  }

  // categoryId: a category id, "none" for uncategorized, or empty for all
  static async getProducts({ search, categoryId } = {}) {
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (categoryId === "none") {
      where.categoryId = null;
    } else if (categoryId) {
      where.categoryId = categoryId;
    }

    return prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getProductById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
  }

  static async updateProduct(id, data) {
    const { remainingQuantity } = data;

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: pickProductData(data),
        include: {
          inventory: true,
        },
      });

      if (remainingQuantity !== undefined && remainingQuantity !== null) {
        const newRemaining = Number(remainingQuantity);

        await tx.inventory.upsert({
          where: {
            productId: id,
          },
          update: {
            remainingQuantity: newRemaining,
            originalQuantity:
              newRemaining + Number(product.inventory?.soldQuantity || 0),
          },
          create: {
            productId: id,
            originalQuantity: newRemaining,
            soldQuantity: 0,
            remainingQuantity: newRemaining,
          },
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: productInclude,
      });
    });
  }

  static async deleteProduct(id) {
    return prisma.$transaction(async (tx) => {
      await tx.inventory.deleteMany({
        where: { productId: id },
      });

      return tx.product.delete({
        where: { id },
      });
    });
  }
}

module.exports = ProductService;

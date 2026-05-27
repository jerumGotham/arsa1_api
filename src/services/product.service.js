const prisma = require("../prisma");

class ProductService {
  static async createProduct(data) {
    const {
      name,
      sku,
      price,
      category,
      description,
      originalQuantity = 0,
    } = data;

    return prisma.product.create({
      data: {
        name,
        sku,
        price,
        category,
        description,
        inventory: {
          create: {
            originalQuantity: Number(originalQuantity),
            soldQuantity: 0,
            remainingQuantity: Number(originalQuantity),
          },
        },
      },
      include: {
        inventory: true,
      },
    });
  }

  static async getProducts(search) {
    return prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        inventory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getProductById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        inventory: true,
      },
    });
  }

  static async updateProduct(id, data) {
    const { originalQuantity, remainingQuantity, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: productData,
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
        include: {
          inventory: true,
        },
      });
    });
  }
}

module.exports = ProductService;

const prisma = require("../prisma");

class OrderService {
  static async createOrder(data) {
    const {
      customerId,
      customerName,
      customerAddress,
      messengerName,
      deliveryDate,
      items,
    } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Order items are required");
    }

    return prisma.$transaction(async (tx) => {
      let finalCustomerId = customerId;

      if (!finalCustomerId) {
        const customer = await tx.customer.create({
          data: {
            name: customerName || "Walk-in Customer",
            address: customerAddress || "",
          },
        });

        finalCustomerId = customer.id;
      } else {
        const customer = await tx.customer.findUnique({
          where: { id: finalCustomerId },
        });

        if (!customer) {
          throw new Error("Customer not found");
        }
      }

      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const quantity = Number(item.quantity);

        if (!item.productId) {
          throw new Error("Product is required");
        }

        if (!quantity || quantity <= 0) {
          throw new Error("Quantity must be greater than zero");
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            inventory: true,
          },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        if (!product.inventory) {
          throw new Error(`Inventory not found for ${product.name}`);
        }

        if (product.inventory.remainingQuantity < quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const price = Number(product.price);
        const subtotal = price * quantity;

        totalAmount += subtotal;

        orderItemsData.push({
          productId: product.id,
          quantity,
          price,
          subtotal,
        });

        await tx.inventory.update({
          where: {
            productId: product.id,
          },
          data: {
            soldQuantity: {
              increment: quantity,
            },
            remainingQuantity: {
              decrement: quantity,
            },
          },
        });
      }

      return tx.order.create({
        data: {
          customerId: finalCustomerId,
          totalAmount,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  static async getOrders(query) {
    const { date, from, to } = query;

    const where = {};

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      where.orderDate = {
        gte: start,
        lte: end,
      };
    }

    if (from && to) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);

      const end = new Date(to);
      end.setHours(23, 59, 59, 999);

      where.orderDate = {
        gte: start,
        lte: end,
      };
    }

    return prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        orderDate: "desc",
      },
    });
  }

  static async getOrderById(id) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }
}

module.exports = OrderService;

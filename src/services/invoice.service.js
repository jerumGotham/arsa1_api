const prisma = require("../prisma");

class InvoiceService {
  static async getLatestInvoice() {
    const order = await prisma.order.findFirst({
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

    if (!order) {
      throw new Error("No invoice found");
    }

    return order;
  }

  static async getInvoiceByOrderId(orderId) {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
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

    if (!order) {
      throw new Error("Invoice not found");
    }

    return order;
  }
}

module.exports = InvoiceService;

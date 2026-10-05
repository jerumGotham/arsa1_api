const prisma = require("../prisma");
const { HttpError } = require("../utils/httpError");
const { orderScope, orderInclude } = require("../utils/scope");

class InvoiceService {
  static async getLatestInvoice(user) {
    const order = await prisma.order.findFirst({
      where: orderScope(user),
      include: orderInclude,
      orderBy: {
        orderDate: "desc",
      },
    });

    if (!order) {
      throw new HttpError(404, "No invoice found");
    }

    return order;
  }

  static async getInvoiceByOrderId(orderId, user) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        ...orderScope(user),
      },
      include: orderInclude,
    });

    if (!order) {
      throw new HttpError(404, "Invoice not found");
    }

    return order;
  }
}

module.exports = InvoiceService;

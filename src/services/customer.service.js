const prisma = require("../prisma");
const { HttpError } = require("../utils/httpError");
const { orderScope, orderInclude } = require("../utils/scope");

class CustomerService {
  static async createCustomer(data) {
    return prisma.customer.create({ data });
  }

  static async getCustomers(search) {
    return prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { createdAt: "desc" },
    });
  }

  static async getCustomerById(id, user) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          where: orderScope(user),
          orderBy: {
            orderDate: "desc",
          },
          include: {
            agent: orderInclude.agent,
            items: orderInclude.items,
          },
        },
      },
    });

    if (!customer) {
      throw new HttpError(404, "Customer not found");
    }

    return customer;
  }

  // Last price this customer paid for each product (most recent order wins).
  // Used by the POS to default to the customer's usual price instead of the
  // master list price.
  static async getCustomerPrices(id) {
    const items = await prisma.orderItem.findMany({
      where: { order: { customerId: id } },
      orderBy: { order: { orderDate: "desc" } },
      distinct: ["productId"],
      select: {
        productId: true,
        price: true,
        order: { select: { orderDate: true } },
      },
    });

    const prices = {};

    for (const item of items) {
      prices[item.productId] = {
        price: Number(item.price),
        orderDate: item.order.orderDate,
      };
    }

    return prices;
  }

  static async updateCustomer(id, data) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  static async deleteCustomer(id) {
    return prisma.customer.delete({
      where: { id },
    });
  }
}

module.exports = CustomerService;

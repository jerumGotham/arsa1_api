const prisma = require("../prisma");

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

  static async getCustomerById(id) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
    return customer;
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

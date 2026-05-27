const prisma = require("../prisma");

class DashboardService {
  static async getSummary() {
    const today = new Date();

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: true,
      },
    });

    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );

    const totalOrders = orders.length;

    const totalItemsSold = orders.reduce((sum, order) => {
      return (
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
      );
    }, 0);

    return {
      totalSales,
      totalOrders,
      totalItemsSold,
    };
  }
}

module.exports = DashboardService;

const prisma = require("../prisma");
const { orderScope } = require("../utils/scope");

class DashboardService {
  static async getSummary(user) {
    const today = new Date();

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        ...orderScope(user),
        orderDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: true,
        agent: { select: { id: true, name: true } },
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

    const summary = {
      totalSales,
      totalOrders,
      totalItemsSold,
    };

    // Admins also get today's sales per agent.
    if (user?.role === "ADMIN") {
      const byAgent = {};

      for (const order of orders) {
        const key = order.agent?.id || "unassigned";

        if (!byAgent[key]) {
          byAgent[key] = {
            agentId: order.agent?.id || null,
            name: order.agent?.name || "Unassigned",
            totalSales: 0,
            totalOrders: 0,
          };
        }

        byAgent[key].totalSales += Number(order.totalAmount);
        byAgent[key].totalOrders += 1;
      }

      summary.byAgent = Object.values(byAgent).sort(
        (a, b) => b.totalSales - a.totalSales,
      );
    }

    return summary;
  }
}

module.exports = DashboardService;

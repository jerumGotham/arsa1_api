// Agents only ever see the orders they booked; admins see everything.
function orderScope(user) {
  return user?.role === "AGENT" ? { agentId: user.id } : {};
}

const orderInclude = {
  customer: true,
  agent: { select: { id: true, name: true } },
  items: {
    include: {
      product: true,
    },
  },
};

module.exports = { orderScope, orderInclude };

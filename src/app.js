const express = require("express");
const cors = require("cors");

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const reportRoutes = require("./routes/report.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");

const { notFoundHandler } = require("./middlewares/notFound.middleware");
const { errorHandler } = require("./middlewares/error.middleware");

const { apiKeyMiddleware } = require("./middlewares/apiKey.middleware");
const {
  requireAuth,
  requireAdmin,
} = require("./middlewares/auth.middleware");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TindaHub API is running",
  });
});

// protect all API routes below
app.use("/api", apiKeyMiddleware);

// login is the only route that does not need a signed-in user
app.use("/api/auth", authRoutes);

app.use("/api", requireAuth);

// shared by admins and agents (agents only see their own orders)
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/invoices", invoiceRoutes);

// admin only
app.use("/api/users", userRoutes);
app.use("/api/inventory", requireAdmin, inventoryRoutes);
app.use("/api/reports", requireAdmin, reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

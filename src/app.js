const express = require("express");
const cors = require("cors");

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const reportRoutes = require("./routes/report.routes");
const invoiceRoutes = require("./routes/invoice.routes");

const { notFoundHandler } = require("./middlewares/notFound.middleware");
const { errorHandler } = require("./middlewares/error.middleware");

const { apiKeyMiddleware } = require("./middlewares/apiKey.middleware");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ARSA 1 API is running",
  });
});

// protect all API routes below
app.use("/api", apiKeyMiddleware);

app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/invoices", invoiceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

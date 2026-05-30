const ExcelJS = require("exceljs");
const prisma = require("../prisma");

class ReportService {
  static async generateOrdersExcel(query, res) {
    const date = query.date ? new Date(query.date) : new Date();

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: start,
          lte: end,
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
      orderBy: {
        orderDate: "asc",
      },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ARSA 1";
    workbook.created = new Date();

    const fileDate = date.toISOString().split("T")[0];

    // =========================
    // DAILY SUMMARY SHEET
    // =========================
    const summarySheet = workbook.addWorksheet("Daily Summary");

    summarySheet.mergeCells("A1:D1");
    summarySheet.getCell("A1").value = "ARSA 1 DAILY SUMMARY";
    summarySheet.getCell("A1").font = { bold: true, size: 14 };
    summarySheet.getCell("A1").alignment = { horizontal: "center" };

    summarySheet.mergeCells("A2:D2");
    summarySheet.getCell("A2").value = `Date: ${fileDate}`;
    summarySheet.getCell("A2").font = { bold: true };
    summarySheet.getCell("A2").alignment = { horizontal: "center" };

    summarySheet.columns = [
      { header: "Product", key: "product", width: 30 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Price", key: "price", width: 15 },
      { header: "Subtotal", key: "subtotal", width: 15 },
    ];

    summarySheet.getRow(3).values = [
      "Product",
      "Quantity",
      "Price",
      "Subtotal",
    ];
    summarySheet.getRow(3).font = { bold: true };

    const groupedProducts = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productName =
          item.product?.name || item.name || "Unknown Product";
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const subtotal = Number(item.subtotal || quantity * price);

        if (!groupedProducts[productName]) {
          groupedProducts[productName] = {
            product: productName,
            quantity: 0,
            price,
            subtotal: 0,
          };
        }

        groupedProducts[productName].quantity += quantity;
        groupedProducts[productName].subtotal += subtotal;
      });
    });

    let grandTotalQty = 0;
    let grandTotalSales = 0;

    Object.values(groupedProducts).forEach((product) => {
      grandTotalQty += product.quantity;
      grandTotalSales += product.subtotal;

      summarySheet.addRow(product);
    });

    summarySheet.addRow({});

    const totalRow = summarySheet.addRow({
      product: "DAILY TOTAL",
      quantity: grandTotalQty,
      price: "",
      subtotal: grandTotalSales,
    });

    totalRow.font = { bold: true };

    summarySheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      });
    });

    summarySheet.getColumn("price").numFmt = "₱#,##0.00";
    summarySheet.getColumn("subtotal").numFmt = "₱#,##0.00";

    // =========================
    // GROUP BY CUSTOMER SHEETS
    // =========================
    const groupedByCustomer = {};

    orders.forEach((order) => {
      const customerName = order.customer?.name || "Unknown Customer";

      if (!groupedByCustomer[customerName]) {
        groupedByCustomer[customerName] = [];
      }

      groupedByCustomer[customerName].push(order);
    });

    Object.keys(groupedByCustomer).forEach((customerName) => {
      const safeSheetName = customerName
        .replace(/[\\/*?:[\]]/g, "")
        .substring(0, 25);

      const sheet = workbook.addWorksheet(safeSheetName || "Customer");

      sheet.columns = [
        { header: "Product", key: "product", width: 30 },
        { header: "Quantity", key: "quantity", width: 15 },
        { header: "Price", key: "price", width: 15 },
        { header: "Subtotal", key: "subtotal", width: 15 },
        { header: "Order Date", key: "orderDate", width: 25 },
      ];

      sheet.getRow(1).font = { bold: true };

      let customerTotalQty = 0;
      let customerTotalSales = 0;

      groupedByCustomer[customerName].forEach((order) => {
        order.items.forEach((item) => {
          const quantity = Number(item.quantity || 0);
          const price = Number(item.price || 0);
          const subtotal = Number(item.subtotal || quantity * price);

          customerTotalQty += quantity;
          customerTotalSales += subtotal;

          sheet.addRow({
            product: item.product?.name || item.name || "Unknown Product",
            quantity,
            price,
            subtotal,
            orderDate: order.orderDate,
          });
        });
      });

      sheet.addRow({});
      const totalRow = sheet.addRow({
        product: "TOTAL",
        quantity: customerTotalQty,
        price: "",
        subtotal: customerTotalSales,
        orderDate: "",
      });

      totalRow.font = { bold: true };

      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        });
      });

      sheet.getColumn("price").numFmt = "₱#,##0.00";
      sheet.getColumn("subtotal").numFmt = "₱#,##0.00";
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=arsa1-orders-${fileDate}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}

module.exports = ReportService;

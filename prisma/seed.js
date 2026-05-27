require("dotenv").config();

const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const prisma = require("../src/prisma");

const DEFAULT_STOCK = 100;

function cleanName(value) {
  return String(value || "")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanPrice(value) {
  if (value === null || value === undefined || value === "") return null;

  const price = Number(String(value).replace(/,/g, "").trim());

  if (isNaN(price)) return null;

  return price;
}

async function readProductsFromExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet("Sheet1") || workbook.worksheets[0];

  if (!sheet) {
    throw new Error("No worksheet found in Excel file.");
  }

  const products = [];

  sheet.eachRow((row, rowNumber) => {
    const name = cleanName(row.getCell(1).value);
    const price = cleanPrice(row.getCell(2).value);

    if (!name || price === null) return;

    // skip possible header rows
    if (
      name.toLowerCase() === "product" ||
      name.toLowerCase() === "name" ||
      name.toLowerCase() === "item"
    ) {
      return;
    }

    products.push({
      name,
      price,
      category: "General",
      description: "Imported from ARSA 1 updated price list",
      originalQuantity: DEFAULT_STOCK,
    });
  });

  return removeDuplicates(products);
}

function removeDuplicates(products) {
  const seen = new Set();
  const unique = [];

  for (const product of products) {
    const key = product.name.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(product);
    }
  }

  return unique;
}

async function seedProducts(products) {
  await prisma.product.deleteMany({}); // Clear existing products and inventory

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of products) {
    try {
      const existing = await prisma.product.findFirst({
        where: {
          name: {
            equals: item.name,
            mode: "insensitive",
          },
        },
        include: {
          inventory: true,
        },
      });

      if (existing) {
        await prisma.product.update({
          where: {
            id: existing.id,
          },
          data: {
            price: item.price,
            category: existing.category || item.category,
            description: existing.description || item.description,
          },
        });

        if (!existing.inventory) {
          await prisma.inventory.create({
            data: {
              productId: existing.id,
              originalQuantity: item.originalQuantity,
              soldQuantity: 0,
              remainingQuantity: item.originalQuantity,
            },
          });
        }

        updated++;
        console.log(`Updated: ${item.name}`);
        continue;
      }

      await prisma.product.create({
        data: {
          name: item.name,
          price: item.price,
          category: item.category,
          description: item.description,
          inventory: {
            create: {
              originalQuantity: item.originalQuantity,
              soldQuantity: 0,
              remainingQuantity: item.originalQuantity,
            },
          },
        },
      });

      created++;
      console.log(`Created: ${item.name}`);
    } catch (error) {
      skipped++;
      console.error(`Failed: ${item.name}`);
      console.error(error.message);
    }
  }

  return {
    created,
    updated,
    skipped,
  };
}

async function main() {
  try {
    const filePath = path.join(__dirname, "../Pricelist1_UPDATED.xlsx");

    if (!fs.existsSync(filePath)) {
      throw new Error(`Excel file not found: ${filePath}`);
    }

    console.log("Reading Excel file...");

    const products = await readProductsFromExcel(filePath);

    console.log(`Found ${products.length} products`);

    const result = await seedProducts(products);

    console.log("Seeder completed successfully");
    console.log(result);
  } catch (error) {
    console.error("Seeder failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

// Creates (or resets) the first admin account.
//   ADMIN_USERNAME=admin ADMIN_PASSWORD=secret123 ADMIN_NAME="Owner" npm run seed:admin
require("dotenv").config();

const prisma = require("../src/prisma");
const AuthService = require("../src/services/auth.service");

async function main() {
  const username = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Administrator";

  if (!password || password.length < 6) {
    throw new Error("Set ADMIN_PASSWORD (at least 6 characters).");
  }

  const passwordHash = await AuthService.hashPassword(password);

  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash, role: "ADMIN", active: true },
    create: { username, name, passwordHash, role: "ADMIN" },
  });

  console.log(`Admin ready: ${user.username}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

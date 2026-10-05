require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set. Add it to your .env file.");
  process.exit(1);
}

const app = require("./app");
const prisma = require("./prisma");
const AuthService = require("./services/auth.service");

const PORT = process.env.PORT || 5000;

// First deploy: create the admin from ADMIN_USERNAME / ADMIN_PASSWORD.
// Does nothing once any user exists, so it never resets a password.
async function bootstrapAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return;

  if ((await prisma.user.count()) > 0) return;

  const username = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();

  await prisma.user.create({
    data: {
      username,
      name: process.env.ADMIN_NAME || "Administrator",
      passwordHash: await AuthService.hashPassword(password),
      role: "ADMIN",
    },
  });

  console.log(`Created first admin account: ${username}`);
}

bootstrapAdmin()
  .catch((error) => console.error("Admin bootstrap failed:", error.message))
  .finally(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`TindaHub API running on port ${PORT}`);
    });
  });

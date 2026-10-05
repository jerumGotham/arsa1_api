// Creates login accounts from prisma/users.local.json (not committed — this
// repo is public, so passwords must never be in git).
//
//   npm run seed:users            create missing users, leave existing ones alone
//   npm run seed:users -- --reset also reset passwords/roles of existing users
//
// The file can also be passed as an env var (e.g. in the Coolify terminal):
//   SEED_USERS='[{"username":"juan","password":"secret1","role":"AGENT"}]'
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const prisma = require("../src/prisma");
const AuthService = require("../src/services/auth.service");

const FILE = path.join(__dirname, "users.local.json");
const ROLES = ["ADMIN", "AGENT"];

function loadUsers() {
  if (process.env.SEED_USERS) return JSON.parse(process.env.SEED_USERS);

  if (!fs.existsSync(FILE)) {
    throw new Error(
      `No users to seed. Copy prisma/users.example.json to prisma/users.local.json and fill it in.`,
    );
  }

  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

async function main() {
  const reset = process.argv.includes("--reset");
  const users = loadUsers();

  for (const entry of users) {
    const username = String(entry.username || "").trim().toLowerCase();
    const role = entry.role || "AGENT";

    if (!username || !entry.password || String(entry.password).length < 6) {
      console.log(`Skipped "${entry.username}": username and a 6+ character password are required`);
      continue;
    }

    if (!ROLES.includes(role)) {
      console.log(`Skipped ${username}: invalid role "${role}"`);
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { username } });

    if (existing && !reset) {
      console.log(`Exists:  ${username} (unchanged)`);
      continue;
    }

    const data = {
      name: entry.name || username.charAt(0).toUpperCase() + username.slice(1),
      role,
      active: true,
      passwordHash: await AuthService.hashPassword(entry.password),
    };

    if (existing) {
      await prisma.user.update({ where: { username }, data });
      console.log(`Reset:   ${username} (${role})`);
    } else {
      await prisma.user.create({ data: { ...data, username } });
      console.log(`Created: ${username} (${role})`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

/**
 * One-shot seed against Atlas (creates khareedo DB + collections).
 * Usage: node server/scripts/seed-atlas.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

process.env.ALLOW_MEMORY_DB = "false";
process.env.FORCE_DEMO_SEED = "true";

async function main() {
  const connectToDB = require("../src/config/db");
  const ensureAdminSeed = require("../src/Seeder/ensureAdmin");
  const ensureDefaultCategories = require("../src/Seeder/ensureCategories");
  const ensureDemoCatalog = require("../src/Seeder/ensureDemoCatalog");

  console.log("Connecting:", (process.env.MONGO_DB_URL || "").replace(/:([^:@]+)@/, ":****@"));
  await connectToDB();
  await ensureAdminSeed();
  await ensureDefaultCategories();
  await ensureDemoCatalog();
  console.log("DONE — check Atlas Data Explorer for database: khareedo");
  process.exit(0);
}

main().catch((err) => {
  console.error("SEED FAILED:", err.message);
  process.exit(1);
});

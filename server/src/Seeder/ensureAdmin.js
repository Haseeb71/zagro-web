const bcrypt = require("bcryptjs");
const users = require("../models/user.model.js");
const roleSchema = require("../models/role.model");
const permissionSchema = require("../models/permission.model");
const { USER_TYPES } = require("../constants/enums.js");

const ADMIN_EMAIL = "admin@zagro.com";
const ADMIN_PASSWORD = "admin@123";

const BASE_PERMISSIONS = [
  { name: "User", slug: "user", description: "General user access" },
  { name: "Product", slug: "product", description: "Product management" },
  { name: "Category", slug: "category", description: "Category management" },
];

async function ensureAdminSeed() {
  const existingAdmin = await users.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    return;
  }

  for (const permission of BASE_PERMISSIONS) {
    await permissionSchema.findOneAndUpdate(
      { slug: permission.slug },
      { $setOnInsert: permission },
      { upsert: true, new: true }
    );
  }

  const permissions = await permissionSchema.find().select("_id");
  const permissionIds = permissions.map((permission) => permission._id);
  const role = await roleSchema.findOneAndUpdate(
    { slug: "admin" },
    {
      $setOnInsert: { name: "Admin", slug: "admin" },
      $set: { permissions: permissionIds },
    },
    { new: true, upsert: true }
  );

  const hashPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await users.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      $set: {
        name: "Admin",
        email: ADMIN_EMAIL,
        password: hashPassword,
        type: USER_TYPES.ADMIN,
        role: role._id,
        isActive: true,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true, new: true }
  );

  console.log(`Admin seeded: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

module.exports = ensureAdminSeed;

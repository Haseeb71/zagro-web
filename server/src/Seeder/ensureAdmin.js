const bcrypt = require("bcryptjs");
const users = require("../models/user.model.js");
const roleSchema = require("../models/role.model");
const permissionSchema = require("../models/permission.model");
const { USER_TYPES } = require("../constants/enums.js");

const ADMIN_EMAIL = "admin@khareedo.com";
const ADMIN_PASSWORD = "khareedo@123";
const LEGACY_ADMIN_EMAIL = "admin@zagro.com";

const BASE_PERMISSIONS = [
  { name: "User", slug: "user", description: "General user access" },
  { name: "Product", slug: "product", description: "Product management" },
  { name: "Category", slug: "category", description: "Category management" },
];

async function ensureAdminSeed() {
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

  // Migrate legacy Zagro admin → Khareedo
  const legacy = await users.findOne({ email: LEGACY_ADMIN_EMAIL });
  if (legacy) {
    legacy.email = ADMIN_EMAIL;
    legacy.name = "Khareedo Admin";
    legacy.password = hashPassword;
    legacy.type = USER_TYPES.ADMIN;
    legacy.role = role._id;
    legacy.isActive = true;
    legacy.updatedAt = new Date();
    await legacy.save();
    console.log(`Admin migrated: ${LEGACY_ADMIN_EMAIL} → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    return;
  }

  await users.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      $set: {
        name: "Khareedo Admin",
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

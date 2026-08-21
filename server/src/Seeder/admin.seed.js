const mongoose = require("mongoose");
const users = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const connectToDB = require("../config/db.js");
const { USER_TYPES } = require("../constants/enums.js");
const roleSchema = require("../models/role.model");
const permissionSchema = require("../models/permission.model");

const ADMIN_EMAIL = "admin@zagro.com";
const ADMIN_PASSWORD = "admin@123";

async function seedingAdmin() {
    await connectToDB();

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
    const admin = await users.findOneAndUpdate(
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
        { new: true, upsert: true }
    );

    console.log(`Admin ready: ${admin.email}`);
    await mongoose.disconnect();
}

seedingAdmin()
    .then(() => process.exit(0))
    .catch(async (error) => {
        console.error(error);
        await mongoose.disconnect().catch(() => {});
        process.exit(1);
    });

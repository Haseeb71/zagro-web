const users = require("../models/user.model.js");
const UserPermissions = require("../models/userPermissions.model");
const permissionSchema = require("../models/permission.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { log } = require("../services/activityLog.service");
const { USER_TYPES } = require("../constants/enums");

const attachPermissions = async (user) => {
    const obj = user.toObject ? user.toObject() : { ...user };
    if (obj.type === USER_TYPES.ADMIN || obj.type === "admin") {
        const all = await permissionSchema.find().select("slug");
        obj.allowedPermissions = all.map((p) => p.slug);
        obj.canEditProfile = true;
        return obj;
    }
    const userPerms = await UserPermissions.findOne({ user: obj._id });
    obj.allowedPermissions = userPerms?.allowedPermissions || [];
    obj.canEditProfile = userPerms?.canEditProfile ?? false;
    return obj;
};

const createUser = async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await users.create({ name, email, phone, password: hashPassword }).populate("role");
        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Internal server errors", error });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await users.findOne({ email }).populate({
            path: "role",
            select: "name slug permissions",
            populate: { path: "permissions", select: "name slug" },
        });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        const userWithPerms = await attachPermissions(user);

        log({
            performedBy: user._id,
            performedByName: user.name,
            action: "login",
            module: "auth",
            description: `${user.name} (${user.type}) logged in`,
            ip: req.ip || req.headers?.["x-forwarded-for"] || null,
        });

        res.status(200).json({ message: "User logged in successfully", user: userWithPerms, token });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Internal server errors", error });
    }
};

module.exports = { createUser, loginUser };

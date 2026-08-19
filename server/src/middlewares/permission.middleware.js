const jwt = require("jsonwebtoken");
const users = require("../models/user.model");
const UserPermissions = require("../models/userPermissions.model");
const { USER_TYPES } = require("../constants/enums");

require("dotenv").config();

/**
 * Resolve the full user document with role + permissions from the JWT userId.
 * Attaches req.userDoc so downstream middleware/controllers can use it.
 */
const resolveUser = async (req, res, next) => {
  // Accept token from: 1) Authorization header, 2) ?token= query param (for file downloads)
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Authorization header missing or invalid" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const userDoc = await users.findById(decoded.userId).populate({
      path: "role",
      select: "name slug permissions",
      populate: { path: "permissions", select: "name slug" },
    });

    if (!userDoc) return res.status(401).json({ message: "User not found" });
    req.userDoc = userDoc;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/**
 * requirePermission(slug)
 *
 * Returns an Express middleware that:
 * 1. Calls resolveUser to load the full user.
 * 2. Always passes admins through.
 * 3. For workers, checks UserPermissions.allowedPermissions contains `slug`.
 *
 * Usage:
 *   router.post("/", requirePermission("raw-material.incoming.create"), controller)
 */
const requirePermission = (slug) => [
  resolveUser,
  async (req, res, next) => {
    const user = req.userDoc;
    if (user.type === USER_TYPES.ADMIN) return next();

    const userPerms = await UserPermissions.findOne({ user: user._id });
    if (userPerms && userPerms.allowedPermissions.includes(slug)) return next();

    return res.status(403).json({
      success: false,
      message: `Access denied. You do not have the '${slug}' permission.`,
    });
  },
];

/**
 * requireAdmin
 * Simple middleware that ensures the caller is an admin.
 */
const requireAdmin = [
  resolveUser,
  (req, res, next) => {
    if (req.userDoc.type === USER_TYPES.ADMIN) return next();
    return res.status(403).json({ success: false, message: "Admin access required" });
  },
];

/**
 * requireAuth
 * Just verifies JWT and resolves user — no role check.
 */
const requireAuth = [resolveUser, (_req, _res, next) => next()];

module.exports = { resolveUser, requirePermission, requireAdmin, requireAuth };

const users = require("../models/user.model");
const UserPermissions = require("../models/userPermissions.model");
const Notification = require("../models/notification.model");
const bcrypt = require("bcrypt");
const { validateObjectId } = require("../utils/validators");
const { USER_TYPES } = require("../constants/enums");
const { log, fromReq } = require("../services/activityLog.service");

/**
 * GET /api/user/profile
 * Returns the authenticated user's own profile.
 */
const getMyProfile = async (req, res) => {
  try {
    const user = await users
      .findById(req.user.userId)
      .select("-password")
      .populate({ path: "role", select: "name slug permissions", populate: { path: "permissions", select: "name slug" } });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const userPerms = await UserPermissions.findOne({ user: user._id });

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        canEditProfile: user.type === USER_TYPES.ADMIN || (userPerms ? userPerms.canEditProfile : false),
        allowedPermissions: userPerms ? userPerms.allowedPermissions : [],
      },
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    return res.status(500).json({ success: false, message: "Error fetching profile", error: error.message });
  }
};

/**
 * PUT /api/user/profile
 * Allows an employee to update their own profile IF canEditProfile is granted.
 * Admin can always update their own profile.
 * Updatable fields: name, email, phone, password.
 */
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Check edit permission for non-admin users
    if (user.type !== USER_TYPES.ADMIN) {
      const userPerms = await UserPermissions.findOne({ user: userId });
      if (!userPerms || !userPerms.canEditProfile) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to edit your profile. Contact your admin.",
        });
      }
    }

    const { name, email, phone, currentPassword, newPassword } = req.body;
    const updateData = { updatedAt: new Date() };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    if (email && email !== user.email) {
      const emailExists = await users.findOne({ email, _id: { $ne: userId } });
      if (emailExists) return res.status(400).json({ success: false, message: "Email already in use" });
      updateData.email = email;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "currentPassword is required to change password" });
      }
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return res.status(400).json({ success: false, message: "Current password is incorrect" });
      updateData.password = await bcrypt.hash(newPassword, 10);
      updateData.tempPassword = newPassword;
    }

    const updated = await users.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select("-password").populate("role");

    await Notification.create({
      title: "Profile Updated",
      message: `${updated.name} updated their own profile.`,
      type: "info",
      category: "profile",
      recipients: [],
      createdBy: userId,
    });

    return res.status(200).json({ success: true, message: "Profile updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
  }
};

/**
 * GET /api/user/profile/:id  (Admin only)
 * View any employee's profile.
 */
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });

    const user = await users
      .findById(id)
      .select("-password")
      .populate({ path: "role", select: "name slug permissions", populate: { path: "permissions", select: "name slug" } });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const userPerms = await UserPermissions.findOne({ user: id });

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        canEditProfile: userPerms ? userPerms.canEditProfile : false,
        allowedPermissions: userPerms ? userPerms.allowedPermissions : [],
      },
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return res.status(500).json({ success: false, message: "Error fetching user profile", error: error.message });
  }
};

/**
 * PUT /api/user/profile/:id  (Admin only)
 * Admin can update any user's name, email, phone, password, role, isActive.
 */
const adminUpdateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });

    const user = await users.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { name, email, phone, newPassword, role, isActive } = req.body;
    const updateData = { updatedAt: new Date() };

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role !== undefined) updateData.role = role;

    if (email && email !== user.email) {
      const emailExists = await users.findOne({ email, _id: { $ne: id } });
      if (emailExists) return res.status(400).json({ success: false, message: "Email already in use" });
      updateData.email = email;
    }

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
      updateData.tempPassword = newPassword;
    }

    const updated = await users.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select("-password").populate("role");

    await Notification.create({
      title: "Profile Updated by Admin",
      message: `Admin updated profile for ${updated.name}.`,
      type: "info",
      category: "profile",
      recipients: [id],
      createdBy: req.user.userId,
    });

    return res.status(200).json({ success: true, message: "User profile updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ success: false, message: "Error updating user profile", error: error.message });
  }
};

/**
 * GET /api/user/all  (Admin only)
 * List all users (workers + admins).
 */
const getAllUsers = async (req, res) => {
  try {
    const { type, search, page = 1, perPage = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const pageNum = parseInt(page);
    const perPageNum = parseInt(perPage);
    const [userList, total] = await Promise.all([
      users
        .find(query)
        .select("-password")
        .populate({ path: "role", select: "name slug" })
        .skip((pageNum - 1) * perPageNum)
        .limit(perPageNum),
      users.countDocuments(query),
    ]);
    return res.status(200).json({
      success: true,
      data: userList,
      pagination: { currentPage: pageNum, perPage: perPageNum, total, totalPages: Math.ceil(total / perPageNum) },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
  }
};

/**
 * POST /api/user/reset-password/:id  (Admin only)
 * Admin resets any user's password.
 * Body: { newPassword }
 */
const adminResetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!validateObjectId(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "newPassword must be at least 6 characters" });
    }

    const user = await users.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await users.findByIdAndUpdate(id, { password: hashed, tempPassword: newPassword, updatedAt: new Date() });

    await Notification.create({
      title: "Password Reset",
      message: `Your password has been reset by the admin.`,
      type: "warning",
      category: "profile",
      recipients: [id],
      createdBy: req.user.userId,
    });

    log({
      ...fromReq(req),
      action: "password_reset",
      module: "profile",
      description: `Admin reset password for ${user.name} (${user.email})`,
      referenceId: user._id,
      referenceType: "users",
    });

    return res.status(200).json({ success: true, message: `Password reset successfully for ${user.name}` });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ success: false, message: "Error resetting password", error: error.message });
  }
};

module.exports = { getMyProfile, updateMyProfile, getUserProfile, adminUpdateUserProfile, getAllUsers, adminResetPassword };

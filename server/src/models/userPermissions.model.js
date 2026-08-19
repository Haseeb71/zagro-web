const mongoose = require("mongoose");

/**
 * Granular per-user permission overrides.
 * Each entry stores an array of permission slugs explicitly granted to the user.
 * Admin always bypasses this check.
 */
const userPermissionsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    /**
     * Array of permission slugs that are ENABLED for this user.
     * e.g. ["raw-material.incoming.create", "warehouse.outgoing.view"]
     */
    allowedPermissions: [{ type: String }],
    /**
     * Whether this user is allowed to edit their own profile details.
     */
    canEditProfile: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserPermissions", userPermissionsSchema);

const mongoose = require("mongoose");

/**
 * Stores per-user application preferences.
 * One document per user — upserted on save.
 */
const userSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    /**
     * UI theme preference — frontend reads this after login to apply the theme.
     * "light" | "dark" | "system"
     */
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light",
    },
    /**
     * Interface language code (e.g. "en", "ur", "ar")
     */
    language: {
      type: String,
      default: "en",
    },
    /**
     * Whether the user wants in-app notification toasts.
     */
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether the user wants email notifications for key events.
     */
    emailNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    /**
     * Compact table view vs comfortable (affects frontend list density).
     */
    tableView: {
      type: String,
      enum: ["compact", "comfortable"],
      default: "comfortable",
    },
    /**
     * Default items per page for paginated lists.
     */
    defaultPageSize: {
      type: Number,
      default: 20,
      min: 5,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSettings", userSettingsSchema);

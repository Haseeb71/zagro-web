const UserSettings = require("../models/userSettings.model");

/**
 * GET /api/user/settings
 * Returns the authenticated user's settings.
 * Creates defaults if no settings exist yet.
 */
const getMySettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    let settings = await UserSettings.findOne({ user: userId });

    if (!settings) {
      settings = await UserSettings.create({ user: userId });
    }

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({ success: false, message: "Error fetching settings", error: error.message });
  }
};

/**
 * PUT /api/user/settings
 * Update one or more preference fields.
 * Body (all optional):
 *   { theme, language, notificationsEnabled, emailNotificationsEnabled, tableView, defaultPageSize }
 */
const updateMySettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const allowedFields = [
      "theme",
      "language",
      "notificationsEnabled",
      "emailNotificationsEnabled",
      "tableView",
      "defaultPageSize",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided to update" });
    }

    const settings = await UserSettings.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: "Settings updated successfully", data: settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({ success: false, message: "Error updating settings", error: error.message });
  }
};

/**
 * PUT /api/user/settings/theme
 * Shortcut endpoint just for switching dark/light mode.
 * Body: { theme: "dark" | "light" | "system" }
 */
const updateTheme = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { theme } = req.body;

    if (!["light", "dark", "system"].includes(theme)) {
      return res.status(400).json({ success: false, message: "theme must be 'light', 'dark', or 'system'" });
    }

    const settings = await UserSettings.findOneAndUpdate(
      { user: userId },
      { $set: { theme } },
      { new: true, upsert: true }
    );

    return res.status(200).json({ success: true, message: `Theme set to '${theme}'`, data: settings });
  } catch (error) {
    console.error("Error updating theme:", error);
    return res.status(500).json({ success: false, message: "Error updating theme", error: error.message });
  }
};

module.exports = { getMySettings, updateMySettings, updateTheme };

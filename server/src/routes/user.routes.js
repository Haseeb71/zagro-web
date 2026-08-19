const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const profileController = require("../controller/userProfile.controller");
// adminResetPassword is part of profileController
const settingsController = require("../controller/userSettings.controller");
const { requireAuth, requireAdmin } = require("../middlewares/permission.middleware");

router.post("/signup", userController.createUser);
router.post("/login", userController.loginUser);

// Profile routes
router.get("/profile", ...requireAuth, profileController.getMyProfile);
router.put("/profile", ...requireAuth, profileController.updateMyProfile);

// Admin — view/edit any user profile
router.get("/all", ...requireAdmin, profileController.getAllUsers);
router.get("/profile/:id", ...requireAdmin, profileController.getUserProfile);
router.put("/profile/:id", ...requireAdmin, profileController.adminUpdateUserProfile);
router.post("/reset-password/:id", ...requireAdmin, profileController.adminResetPassword);

// User Settings (theme / dark mode / preferences)
router.get("/settings", ...requireAuth, settingsController.getMySettings);
router.put("/settings", ...requireAuth, settingsController.updateMySettings);
router.put("/settings/theme", ...requireAuth, settingsController.updateTheme);

module.exports = router;
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createPromotion, getPromotions, getPromotionById, updatePromotion, deletePromotion, getActivePromotions } = require("../controller/promotion.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const { getUploadsRoot } = require("../../paths");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, getUploadsRoot());
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

/**
 * Public Routes (No authentication required)
 */
router.get("/", getPromotions);
router.get("/active", getActivePromotions);
router.get("/:id", getPromotionById);

/**
 * Admin Routes (Authentication required)
 */
router.post("/create", authMiddleware, upload.single("image"), createPromotion);
router.put("/update/:id", authMiddleware, upload.single("image"), updatePromotion);
router.delete("/delete/:id", authMiddleware, deletePromotion);

module.exports = router;

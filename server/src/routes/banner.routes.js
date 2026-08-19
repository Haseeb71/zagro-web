const express = require("express");
const multer = require("multer");
const { getUploadsRoot } = require("../../paths");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createBanner,
  getBanners,
  getActiveBanners,
  updateBanner,
  deleteBanner,
} = require("../controller/banner.controller");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getUploadsRoot()),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.get("/active", getActiveBanners);
router.get("/", getBanners);
router.post("/create", authMiddleware, upload.single("image"), createBanner);
router.put("/update/:id", authMiddleware, upload.single("image"), updateBanner);
router.delete("/delete/:id", authMiddleware, deleteBanner);

module.exports = router;

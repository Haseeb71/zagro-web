const express = require("express");
const multer = require("multer");
const { getUploadsRoot } = require("../../paths");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require("../controller/brand.controller");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getUploadsRoot()),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.get("/", getBrands);
router.get("/:id", getBrandById);
router.post("/create", authMiddleware, upload.single("logo"), createBrand);
router.put("/update/:id", authMiddleware, upload.single("logo"), updateBrand);
router.delete("/delete/:id", authMiddleware, deleteBrand);

module.exports = router;

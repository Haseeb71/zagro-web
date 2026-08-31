const express = require("express");
const router = express.Router();
const multer = require("multer");
const os = require("os");
const {
  createProduct,
  getProducts,
  getProductById,
  getSimilarProducts,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByType,
  getFilteredProducts,
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoriesByCategory,
  getAllTypesProducts,
} = require("../controller/product.controller");

/** Use /tmp on Lambda/Amplify — public/uploads is not writable there */
const uploadDir = process.env.AWS_EXECUTION_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME
  ? os.tmpdir()
  : require("../../paths").getUploadsRoot();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    if (file.fieldname.startsWith("colorImages_")) {
      const color = file.fieldname.replace("colorImages_", "");
      const safeColor = color.replace(/[^a-zA-Z0-9]/g, "_");
      cb(null, `${safeColor}_${Date.now()}-${file.originalname}`);
    } else {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024, files: 20 },
});

function optionalMultipart(req, res, next) {
  const ct = String(req.headers["content-type"] || "");
  if (ct.includes("multipart/form-data")) {
    return upload.any()(req, res, (err) => {
      if (err) {
        console.error("[product upload]", err.message);
        return res.status(400).json({ message: err.message || "Upload parse failed" });
      }
      return next();
    });
  }
  return next();
}

/**
 * Product Section
 */
router.post("/all-types", getAllTypesProducts);
router.post("/create", optionalMultipart, createProduct);
router.post("/", getProducts);
router.get("/filter", getFilteredProducts);
router.get("/by-category/:category", getProductsByCategory);
router.post("/type", getProductsByType);
router.get("/:id", getProductById);
router.post("/similar/:categoryId", getSimilarProducts);
router.post("/update/:id", optionalMultipart, updateProduct);
router.delete("/delete/:id", deleteProduct);

/**
 * Category Section
 */
router.post("/category/create", upload.single("image"), createCategory);
router.get("/category/all", getCategories);
router.get("/category/:id", getCategoryById);
router.post("/category/update/:id", upload.single("image"), updateCategory);
router.delete("/category/delete/:id", deleteCategory);

/**
 * SubCategory Section
 */
router.post("/sub-category/create", createSubCategory);
router.get("/sub-category/all", getSubCategories);
router.get("/sub-category/:id", getSubCategoryById);
router.post("/sub-category/update/:id", updateSubCategory);
router.delete("/sub-category/delete/:id", deleteSubCategory);
router.get("/sub-category/by-category/:category", getSubCategoriesByCategory);

module.exports = router;

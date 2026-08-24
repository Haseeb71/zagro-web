const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getProductTypes,
  getProductTypesAdmin,
  createProductType,
  updateProductType,
  deleteProductType,
} = require("../controller/productType.controller");

router.get("/", getProductTypes);
router.get("/admin", authMiddleware, getProductTypesAdmin);
router.post("/create", authMiddleware, createProductType);
router.put("/update/:id", authMiddleware, updateProductType);
router.delete("/delete/:id", authMiddleware, deleteProductType);

module.exports = router;

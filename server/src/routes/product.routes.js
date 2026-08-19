const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createProduct,
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
    getAllTypesProducts
 } = require("../controller/product.controller");


    const { getUploadsRoot } = require("../../paths");
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, getUploadsRoot());
        },
        filename: function (req, file, cb) {
            // Handle color-specific images with better naming
            if (file.fieldname.startsWith('colorImages_')) {
                const color = file.fieldname.replace('colorImages_', '');
                const safeColor = color.replace(/[^a-zA-Z0-9]/g, '_'); // Replace special chars with underscore
                cb(null, safeColor + '_' + Date.now() + '-' + file.originalname);
            } else {
                cb(null, Date.now() + '-' + file.originalname);
            }
        }
    });
    
    // Configure multer to accept any field names
    const upload = multer({ 
        storage: storage
    });


/**
 * Product Section 
 */
router.post("/all-types", getAllTypesProducts);
router.post("/create", upload.any(), createProduct);
router.post("/", getProducts);
router.get("/filter", getFilteredProducts);
router.get("/by-category/:category", getProductsByCategory);
router.post("/type", getProductsByType);
router.get("/:id", getProductById);
router.post("/similar/:categoryId", getSimilarProducts);
router.post("/update/:id", upload.any(), updateProduct);
router.delete("/delete/:id", deleteProduct);


/***
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
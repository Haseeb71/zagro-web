const express = require("express");
const router = express.Router();
const { 
    createCoupon, 
    getCoupons, 
    getCouponById, 
    getCouponByCode, 
    updateCoupon, 
    deleteCoupon, 
    getActiveCoupons, 
    validateCoupon 
} = require("../controller/coupon.controller");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * Public Routes (No authentication required)
 */
router.get("/", getCoupons);
router.get("/active", getActiveCoupons);
router.get("/:id", getCouponById);
router.get("/code/:code", getCouponByCode);
router.post("/validate", validateCoupon);

/**
 * Admin Routes (Authentication required)
 */
router.post("/create", authMiddleware, createCoupon);
router.put("/update/:id", authMiddleware, updateCoupon);
router.delete("/delete/:id", authMiddleware, deleteCoupon);

module.exports = router;

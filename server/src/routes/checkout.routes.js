const express = require("express");
const router = express.Router();
const { 
    createCustomer,
    createCheckout,
    getCheckouts,
    getCheckoutById,
    getCheckoutByOrderNumber,
    updateCheckoutStatus,
    getCustomerCheckouts,
    getOrderStats,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    deleteCheckout
} = require("../controller/checkout.controller");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * Public Routes (No authentication required)
 */
router.post("/customer", createCustomer);
router.post("/", createCheckout);
router.get("/customer/:customerId", getCustomerCheckouts);
router.get("/order/:orderNumber", getCheckoutByOrderNumber);

/**
 * Admin Routes (Authentication required)
 */
router.get("/", authMiddleware, getCheckouts);
router.post("/delete/:id", authMiddleware, deleteCheckout);
router.get("/stats", authMiddleware, getOrderStats);



router.get("/customers", authMiddleware, getAllCustomers);
router.get("/customers/:id", authMiddleware, getCustomerById);
router.put("/customers/:id", authMiddleware, updateCustomer);
router.delete("/customers/:id", authMiddleware, deleteCustomer);
router.get("/:id", authMiddleware, getCheckoutById);
router.put("/:id/status", authMiddleware, updateCheckoutStatus);

module.exports = router;

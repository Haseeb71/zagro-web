const checkoutModel = require("../models/checkout.model");
const customerModel = require("../models/customer.model");
const productModel = require("../models/product.model");
const couponModel = require("../models/coupon.model");
const { sendOrderConfirmationEmail, sendAdminOrderNotification } = require("../services/email.service");
const { assertCanPurchase, buildStockDecrement } = require("../utils/inventory");
const { productRequiresSize } = require("../constants/productTypes");

// Generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
};

const createCustomer = async (req, res) => {
    try {
        const { fullName, email, phone, address, userId } = req.body;

        // Validation
        if (!fullName || !email || !phone) {
            return res.status(400).json({ message: "Full name, email, and phone are required" });
        }

        // Check if customer already exists
        let customer = await customerModel.findOne({ email: email.toLowerCase() });
        
        if (customer) {
            // Update existing customer
            customer = await customerModel.findByIdAndUpdate(
                customer._id,
                {
                    fullName,
                    phone,
                    address,
                    userId: userId || customer.userId,
                    updatedAt: new Date()
                },
                { new: true }
            );
        } else {
            // Create new customer
            customer = await customerModel.create({
                fullName,
                email: email.toLowerCase(),
                phone,
                address,
                userId
            });
        }

        res.status(201).json({ customer, message: "Customer created/updated successfully" });
    } catch (error) {
        console.error("Error in createCustomer:", error);
        res.status(500).json({ message: "Error creating customer: " + error.message });
    }
};

const createCheckout = async (req, res) => {
    try {
        const {
            customerId,
            items,
            couponCode,
            paymentMethod,
            shippingAddress,
            billingAddress,
            notes,
            userId
        } = req.body;

        // Validation
        if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Customer ID and items are required" });
        }

        if (!paymentMethod) {
            return res.status(400).json({ message: "Payment method is required" });
        }

        // Get customer
        const customer = await customerModel.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        let subtotal = 0;
        let discountAmount = 0;
        let coupon = null;

        // Process items and calculate totals
        const processedItems = [];
        for (const item of items) {
            const product = await productModel.findById(item.productId).populate('brand', 'name').populate('category', 'name');
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.productId}` });
            }

            const qty = Number(item.quantity) || 0;
            if (qty < 1) {
                return res.status(400).json({ message: `Invalid quantity for ${product.name}` });
            }

            const stockCheck = assertCanPurchase(product, {
                size: item.size,
                quantity: qty,
            });
            if (!stockCheck.ok) {
                return res.status(400).json({ message: stockCheck.message });
            }

            const itemTotal = product.price * qty;
            subtotal += itemTotal;

            processedItems.push({
                product: product._id,
                productName: product.name,
                productPrice: product.price,
                color: item.color || 'Default',
                size: item.size || 'One Size',
                brandName: product.brand?.name || '',
                categoryName: product.category?.name || '',
                quantity: qty,
                totalPrice: itemTotal,
            });
        }

        // Apply coupon if provided
        if (couponCode) {
            coupon = await couponModel.findOne({ code: couponCode.toUpperCase() });
            if (coupon) {
                const now = new Date();
                if (coupon.isActive && 
                    now >= coupon.validFrom && 
                    now <= coupon.validUntil &&
                    (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
                    
                    discountAmount = (subtotal * coupon.discountPercentage) / 100;
                    
                    // Apply maximum discount limit if set
                    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                        discountAmount = coupon.maxDiscountAmount;
                    }
                }
            }
        }

        // Match storefront: free shipping at Rs 15,000+, else Rs 250
        const FREE_SHIPPING_MIN = 15000;
        const SHIPPING_FEE = 250;
        const amountAfterDiscount = subtotal - discountAmount;
        const shippingAmount = amountAfterDiscount >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
        const taxAmount = 0;
        const totalAmount = amountAfterDiscount + shippingAmount + taxAmount;

        // Create checkout/order
        const checkout = await checkoutModel.create({
            orderNumber: generateOrderNumber(),
            customer: customerId,
            userId,
            items: processedItems,
            subtotal,
            discountAmount,
            couponCode: couponCode || null,
            shippingAmount,
            taxAmount,
            totalAmount,
            paymentMethod,
            shippingAddress: shippingAddress || customer.address,
            billingAddress: billingAddress || customer.address,
            notes
        });

        // Update product stock
        for (const item of processedItems) {
            const product = await productModel.findById(item.product);
            if (!product) continue;
            const updatePayload = buildStockDecrement(product, {
                size: item.size === 'One Size' ? undefined : item.size,
                quantity: item.quantity,
            });
            await productModel.findByIdAndUpdate(product._id, updatePayload);
        }

        // Update coupon usage count if applied
        if (coupon) {
            await couponModel.findByIdAndUpdate(coupon._id, {
                $inc: { usedCount: 1 }
            });
        }

        // Populate the checkout with customer details
        const populatedCheckout = await checkoutModel
            .findById(checkout._id)
            .populate('customer', 'fullName email phone address')
            .populate('items.product', 'name price images');

        // Send confirmation email to customer
        const customerEmailData = {
            customerEmail: customer.email,
            customerName: customer.fullName,
            customerPhone: customer.phone,
            orderNumber: checkout.orderNumber,
            orderDate: checkout.createdAt,
            items: processedItems,
            subtotal,
            discountAmount,
            shippingAmount,
            taxAmount,
            totalAmount,
            shippingAddress: checkout.shippingAddress,
            paymentMethod: checkout.paymentMethod,
            paymentStatus: checkout.paymentStatus,
            orderStatus: checkout.orderStatus,
            notes: checkout.notes,
        };

        // Send admin notification email
        const adminEmailData = {
            customerName: customer.fullName,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            orderNumber: checkout.orderNumber,
            orderDate: checkout.createdAt,
            items: processedItems,
            subtotal,
            discountAmount,
            shippingAmount,
            taxAmount,
            totalAmount,
            shippingAddress: checkout.shippingAddress,
            paymentMethod: checkout.paymentMethod,
            paymentStatus: checkout.paymentStatus,
            orderStatus: checkout.orderStatus,
            notes: checkout.notes,
        };

        // Mailtrap free plan rate-limits parallel sends — queue sequentially in background
        setImmediate(async () => {
            try {
                await sendOrderConfirmationEmail(customerEmailData);
            } catch (err) {
                console.error("Failed to send customer confirmation email:", err);
            }
            await new Promise((r) => setTimeout(r, 2000));
            try {
                await sendAdminOrderNotification(adminEmailData);
            } catch (err) {
                console.error("Failed to send admin notification email:", err);
            }
        });

        res.status(201).json({ 
            checkout: populatedCheckout, 
            message: "Order created successfully" 
        });
    } catch (error) {
        console.error("Error in createCheckout:", error);
        res.status(500).json({ message: "Error creating checkout: " + error.message });
    }
};

const getCheckouts = async (req, res) => {
    try {
        const { 
            page = 1, 
            perPage = 10, 
            orderStatus, 
            paymentStatus, 
            customerId, 
            userId,
            startDate,
            endDate,
            search
        } = req.query;

        const query = {};
        
        if (orderStatus) query.orderStatus = orderStatus;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (customerId) query.customer = customerId;
        if (userId) query.userId = userId;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Search functionality
        if (search) {
            // First, find customers that match the search criteria
            const customerIds = await customerModel.find({
                $or: [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            const customerIdList = customerIds.map(customer => customer._id);

            // Search in order number or customer IDs
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { customer: { $in: customerIdList } }
            ];
        }

        const pageNum = parseInt(page);
        const perPageNum = parseInt(perPage);
        const skip = (pageNum - 1) * perPageNum;

        const [checkouts, totalCheckouts] = await Promise.all([
            checkoutModel
                .find(query)
                .populate('customer', 'fullName email phone address')
                .populate({
                    path: 'items.product',
                    select: 'name price images brand category',
                    populate: [
                        { path: 'brand', select: 'name slug' },
                        { path: 'category', select: 'name slug' },
                    ],
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPageNum),
            checkoutModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalCheckouts / perPageNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        res.status(200).json({
            checkouts,
            pagination: {
                currentPage: pageNum,
                perPage: perPageNum,
                totalCheckouts,
                totalPages,
                hasNextPage,
                hasPrevPage,
                currentCheckouts: checkouts.length
            },
            message: "Checkouts fetched successfully"
        });
    } catch (error) {
        console.error("Error in getCheckouts:", error);
        res.status(500).json({ message: "Error fetching checkouts: " + error.message });
    }
};

const deleteCheckout = async (req, res) => {
    console.log("deleteCheckout");
    try {
        const { id } = req.params;
        const checkout = await checkoutModel.findByIdAndDelete(id);
        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }
        res.status(200).json({ message: "Checkout deleted successfully" });
    } catch (error) {
        console.error("Error in deleteCheckout:", error);
        res.status(500).json({ message: "Error deleting checkout: " + error.message });
    }
};

const getCheckoutById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid checkout ID format" });
        }

        const checkout = await checkoutModel
            .findById(id)
            .populate('customer', 'fullName email phone address')
            .populate({
                path: 'items.product',
                select: 'name price images description brand category',
                populate: [
                    { path: 'brand', select: 'name slug' },
                    { path: 'category', select: 'name slug' },
                ],
            });

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        res.status(200).json({ checkout, message: "Checkout fetched successfully" });
    } catch (error) {
        console.error("Error in getCheckoutById:", error);
        res.status(500).json({ message: "Error fetching checkout: " + error.message });
    }
};

const getCheckoutByOrderNumber = async (req, res) => {
    try {
        const { orderNumber } = req.params;

        if (!orderNumber) {
            return res.status(400).json({ message: "Order number is required" });
        }

        const checkout = await checkoutModel
            .findOne({ orderNumber: orderNumber })
            .populate('customer', 'fullName email phone address')
            .populate('items.product', 'name price images description');

        if (!checkout) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ 
            checkout, 
            message: "Order details fetched successfully" 
        });
    } catch (error) {
        console.error("Error in getCheckoutByOrderNumber:", error);
        res.status(500).json({ message: "Error fetching order details: " + error.message });
    }
};

const updateCheckoutStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus, paymentStatus, trackingNumber, notes } = req.body;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid checkout ID format" });
        }

        const checkout = await checkoutModel.findById(id);
        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        const updateData = { updatedAt: new Date() };
        
        if (orderStatus) {
            updateData.orderStatus = orderStatus;
            
            // Set specific timestamps based on status
            if (orderStatus === 'delivered') {
                updateData.deliveredAt = new Date();
            } else if (orderStatus === 'cancelled') {
                updateData.cancelledAt = new Date();
                if (notes) updateData.cancelledReason = notes;
            }
        }
        
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (notes) updateData.notes = notes;

        const updatedCheckout = await checkoutModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('customer', 'fullName email phone address')
            .populate('items.product', 'name price images');

        res.status(200).json({ 
            checkout: updatedCheckout, 
            message: "Checkout status updated successfully" 
        });
    } catch (error) {
        console.error("Error in updateCheckoutStatus:", error);
        res.status(500).json({ message: "Error updating checkout status: " + error.message });
    }
};

const getCustomerCheckouts = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { page = 1, perPage = 10 } = req.query;

        if (!customerId || !customerId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid customer ID format" });
        }

        const pageNum = parseInt(page);
        const perPageNum = parseInt(perPage);
        const skip = (pageNum - 1) * perPageNum;

        const [checkouts, totalCheckouts] = await Promise.all([
            checkoutModel
                .find({ customer: customerId })
                .populate('items.product', 'name price images')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPageNum),
            checkoutModel.countDocuments({ customer: customerId })
        ]);

        const totalPages = Math.ceil(totalCheckouts / perPageNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        res.status(200).json({
            checkouts,
            pagination: {
                currentPage: pageNum,
                perPage: perPageNum,
                totalCheckouts,
                totalPages,
                hasNextPage,
                hasPrevPage,
                currentCheckouts: checkouts.length
            },
            message: "Customer checkouts fetched successfully"
        });
    } catch (error) {
        console.error("Error in getCustomerCheckouts:", error);
        res.status(500).json({ message: "Error fetching customer checkouts: " + error.message });
    }
};

const getOrderStats = async (req, res) => {
    try {
        const stats = await checkoutModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    averageOrderValue: { $avg: "$totalAmount" }
                }
            }
        ]);

        const statusStats = await checkoutModel.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        const paymentStats = await checkoutModel.aggregate([
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            stats: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
            orderStatusStats: statusStats,
            paymentStatusStats: paymentStats,
            message: "Order statistics fetched successfully"
        });
    } catch (error) {
        console.error("Error in getOrderStats:", error);
        res.status(500).json({ message: "Error fetching order statistics: " + error.message });
    }
};

const getAllCustomers = async (req, res) => {
    try {
        const { 
            page = 1, 
            perPage = 10, 
            search, 
            isActive,
            startDate,
            endDate
        } = req.query;

        const query = {};
        
        // Search by name, email, or phone
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const pageNum = parseInt(page);
        const perPageNum = parseInt(perPage);
        const skip = (pageNum - 1) * perPageNum;

        const [customers, totalCustomers] = await Promise.all([
            customerModel
                .find(query)
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPageNum),
            customerModel.countDocuments(query)
        ]);

        // Get order count for each customer
        const customersWithOrderCount = await Promise.all(
            customers.map(async (customer) => {
                const orderCount = await checkoutModel.countDocuments({ customer: customer._id });
                return {
                    ...customer.toObject(),
                    orderCount
                };
            })
        );

        const totalPages = Math.ceil(totalCustomers / perPageNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        res.status(200).json({
            customers: customersWithOrderCount,
            pagination: {
                currentPage: pageNum,
                perPage: perPageNum,
                totalCustomers,
                totalPages,
                hasNextPage,
                hasPrevPage,
                currentCustomers: customers.length
            },
            message: "Customers fetched successfully"
        });
    } catch (error) {
        console.error("Error in getAllCustomers:", error);
        res.status(500).json({ message: "Error fetching customers: " + error.message });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid customer ID format" });
        }

        const customer = await customerModel
            .findById(id)
            .populate('userId', 'name email');

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Get customer's order statistics
        const orderStats = await checkoutModel.aggregate([
            { $match: { customer: customer._id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: "$totalAmount" },
                    averageOrderValue: { $avg: "$totalAmount" }
                }
            }
        ]);

        // Get recent orders
        const recentOrders = await checkoutModel
            .find({ customer: customer._id })
            .populate('items.product', 'name price images')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({ 
            customer,
            orderStats: orderStats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
            recentOrders,
            message: "Customer details fetched successfully" 
        });
    } catch (error) {
        console.error("Error in getCustomerById:", error);
        res.status(500).json({ message: "Error fetching customer: " + error.message });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, address, isActive } = req.body;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid customer ID format" });
        }

        const customer = await customerModel.findById(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== customer.email) {
            const existingCustomer = await customerModel.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: id }
            });
            if (existingCustomer) {
                return res.status(400).json({ message: "Email already exists" });
            }
        }

        const updatedCustomer = await customerModel.findByIdAndUpdate(
            id,
            {
                fullName: fullName || customer.fullName,
                email: email ? email.toLowerCase() : customer.email,
                phone: phone || customer.phone,
                address: address || customer.address,
                isActive: isActive !== undefined ? isActive : customer.isActive,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('userId', 'name email');

        res.status(200).json({ 
            customer: updatedCustomer, 
            message: "Customer updated successfully" 
        });
    } catch (error) {
        console.error("Error in updateCustomer:", error);
        res.status(500).json({ message: "Error updating customer: " + error.message });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid customer ID format" });
        }

        const customer = await customerModel.findById(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Check if customer has orders
        const orderCount = await checkoutModel.countDocuments({ customer: id });
        if (orderCount > 0) {
            return res.status(400).json({ 
                message: "Cannot delete customer with existing orders. Deactivate instead." 
            });
        }

        await customerModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Customer deleted successfully" });
    } catch (error) {
        console.error("Error in deleteCustomer:", error);
        res.status(500).json({ message: "Error deleting customer: " + error.message });
    }
};

module.exports = {
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
};

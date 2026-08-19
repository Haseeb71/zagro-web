const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: false
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        productPrice: {
            type: Number,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        size: {
            type: String,
            required: true
        },
        brandName: {
            type: String,
            required: false
        },
        categoryName: {
            type: String,
            required: false
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
        required: false
    },
    shippingAmount: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["cash_on_delivery", "credit_card", "debit_card", "bank_transfer", "digital_wallet"]
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
        default: "pending"
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    notes: {
        type: String,
        required: false
    },
    trackingNumber: {
        type: String,
        required: false
    },
    estimatedDelivery: {
        type: Date,
        required: false
    },
    deliveredAt: {
        type: Date,
        required: false
    },
    cancelledAt: {
        type: Date,
        required: false
    },
    cancelledReason: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for better query performance
checkoutSchema.index({ orderNumber: 1 });
checkoutSchema.index({ customer: 1 });
checkoutSchema.index({ userId: 1 });
checkoutSchema.index({ orderStatus: 1 });
checkoutSchema.index({ paymentStatus: 1 });
checkoutSchema.index({ createdAt: -1 });

const checkoutModel = mongoose.model("checkout", checkoutSchema);

module.exports = checkoutModel;

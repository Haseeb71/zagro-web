const mongoose = require("mongoose");
const { USER_TYPES } = require("../constants/enums");
const users = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    tempPassword: {
        type: String,
        required: false,
        default: null
    },
    type: {
        type: String,
        required: false,
        enum: Object.values(USER_TYPES),
        default: USER_TYPES.CUSTOMER
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: false,
    },
    isActive: {
        type: Boolean,
        default: false,
        required: false,
        default: false
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

module.exports = mongoose.model("users", users);
const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
    mainText: {
        type: String,
        required: true
    },
    subText: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: false
    },
    priority: {
        type: Number,
        default: 0
    },
    link: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const promotionModel = mongoose.model("promotion", promotionSchema);

module.exports = promotionModel;

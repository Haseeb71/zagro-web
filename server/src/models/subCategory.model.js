const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
    }
})

const subCategoryModel = mongoose.model("subCategory", subCategorySchema);

module.exports = subCategoryModel;
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
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
    image: {
        type: String,
        required: false,
    },
    /** Links category to a product type key for brand/product filters */
    productType: {
        type: String,
        required: false,
        default: "",
    },
    subCategories: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "subCategory",
        required: false
    }
})

const categoryModel = mongoose.model("category", categorySchema);

module.exports = categoryModel;
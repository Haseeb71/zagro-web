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
    subCategories: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "subCategory",
        required: false
    }
})

const categoryModel = mongoose.model("category", categorySchema);

module.exports = categoryModel;
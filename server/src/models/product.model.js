const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    /** MRP / compare-at — shown struck through when higher than price */
    originalPrice: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator(v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one product image is required",
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "brand",
      required: false,
    },
    /** Dynamic product-type key — no frozen enum so admin-created types save */
    productType: {
      type: String,
      default: "simple",
      trim: true,
      lowercase: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
    },
    colorQuantities: {
      type: Object,
      required: false,
    },
    colorImages: {
      type: Object,
      required: false,
    },
    sizeColorQuantities: {
      type: Object,
      required: false,
    },
    sizes: {
      type: Array,
    },
    sizeQuantities: {
      type: Object,
      required: false,
    },
    isFeatured: {
      type: Boolean,
    },
    /** New badge — reserved path name; warning suppressed below */
    isNew: {
      type: Boolean,
    },
    isBestSeller: {
      type: Boolean,
    },
    isTrending: {
      type: Boolean,
    },
    isSpecial: {
      type: Boolean,
    },
    isDiscounted: {
      type: Boolean,
    },
    discountPercentage: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { suppressReservedKeysWarning: true }
);

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

module.exports = productModel;

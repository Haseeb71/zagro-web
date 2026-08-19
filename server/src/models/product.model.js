const mongoose = require("mongoose");
const { PRODUCT_TYPE_KEYS } = require("../constants/productTypes");

const productSchema = new mongoose.Schema({
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
    type: Array,
    required: true,
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
  /**
   * Catalog type drives admin form + storefront (sizes, etc.)
   * watch | apparel | toy | vehicle | simple | other
   */
  productType: {
    type: String,
    enum: PRODUCT_TYPE_KEYS,
    default: "simple",
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
  /** Size labels, e.g. ['S','M','L'] or age bands for toys */
  sizes: {
    type: Array,
  },
  /** Per-size stock: { S: 10, M: 4 } — used when productType has sizes */
  sizeQuantities: {
    type: Object,
    required: false,
  },
  isFeatured: {
    type: Boolean,
  },
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
});

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;

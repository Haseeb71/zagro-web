const mongoose = require("mongoose");
const slugify = require("slugify");

const productTypeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    hasSizes: {
      type: Boolean,
      default: false,
    },
    hasColors: {
      type: Boolean,
      default: false,
    },
    /** Suggested sizes shown when adding a product (e.g. 40,41,42 or S,M,L) */
    sizePreset: {
      type: [String],
      default: [],
    },
    colorPreset: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

productTypeSchema.pre("validate", function (next) {
  if (this.label && !this.key) {
    this.key = slugify(this.label, { lower: true, strict: true });
  }
  if (this.key) {
    this.key = slugify(String(this.key), { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("productType", productTypeSchema);

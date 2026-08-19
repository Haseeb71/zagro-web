/**
 * Shared product-type catalogue — keep FE (src/config/productTypes.js) in sync.
 */
const PRODUCT_TYPES = {
  simple: {
    key: "simple",
    label: "Simple product",
    description: "No size variants (generic SKU)",
    hasSizes: false,
    sizePreset: [],
  },
  watch: {
    key: "watch",
    label: "Watch",
    description: "Timepieces — quantity only",
    hasSizes: false,
    sizePreset: [],
  },
  apparel: {
    key: "apparel",
    label: "Apparel / Suit",
    description: "Clothing with size chart",
    hasSizes: true,
    sizePreset: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  },
  toy: {
    key: "toy",
    label: "Baby / Kids toy",
    description: "Toys — optional age / size bands",
    hasSizes: true,
    sizePreset: ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-5Y", "5-7Y", "One Size"],
  },
  vehicle: {
    key: "vehicle",
    label: "Vehicle / Jeep",
    description: "Cars, jeeps, RC — quantity only",
    hasSizes: false,
    sizePreset: [],
  },
  other: {
    key: "other",
    label: "Other (custom sizes)",
    description: "Custom size list if needed",
    hasSizes: true,
    sizePreset: [],
  },
};

const PRODUCT_TYPE_KEYS = Object.keys(PRODUCT_TYPES);

function getProductTypeConfig(type) {
  return PRODUCT_TYPES[type] || PRODUCT_TYPES.simple;
}

function productRequiresSize(product) {
  const type = getProductTypeConfig(product?.productType);
  const sizes = Array.isArray(product?.sizes) ? product.sizes.filter(Boolean) : [];
  return Boolean(type.hasSizes && sizes.length > 0);
}

module.exports = {
  PRODUCT_TYPES,
  PRODUCT_TYPE_KEYS,
  getProductTypeConfig,
  productRequiresSize,
};

/**
 * Shared product-type catalogue — keep FE (src/config/productTypes.js) in sync.
 */
const PRODUCT_TYPES = {
  simple: {
    key: "simple",
    label: "Simple product",
    description: "No size or colour variants",
    hasSizes: false,
    hasColors: false,
    sizePreset: [],
    colorPreset: [],
  },
  watch: {
    key: "watch",
    label: "Watch",
    description: "Timepieces — quantity only",
    hasSizes: false,
    hasColors: false,
    sizePreset: [],
    colorPreset: [],
  },
  apparel: {
    key: "apparel",
    label: "Apparel / Suit",
    description: "Clothing with sizes and colours",
    hasSizes: true,
    hasColors: true,
    sizePreset: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    colorPreset: ["Black", "Navy", "Grey", "Brown", "White", "Beige"],
  },
  toy: {
    key: "toy",
    label: "Baby / Kids toy",
    description: "Toys — age bands; optional colours",
    hasSizes: true,
    hasColors: true,
    sizePreset: ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-5Y", "5-7Y", "One Size"],
    colorPreset: ["Red", "Blue", "Green", "Yellow", "Pink", "Multi"],
  },
  vehicle: {
    key: "vehicle",
    label: "Vehicle / Jeep",
    description: "Cars, jeeps, RC — quantity only",
    hasSizes: false,
    hasColors: true,
    sizePreset: [],
    colorPreset: ["Black", "White", "Red", "Blue", "Silver"],
  },
  other: {
    key: "other",
    label: "Other (custom)",
    description: "Custom sizes and colours if needed",
    hasSizes: true,
    hasColors: true,
    sizePreset: [],
    colorPreset: [],
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

/**
 * Built-in defaults + in-memory cache of DB product types.
 * Call refreshProductTypeCache() after connect / after CRUD.
 */
const BUILTIN_PRODUCT_TYPES = {
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
  shoes: {
    key: "shoes",
    label: "Shoes",
    description: "Footwear — EU sizes and colours",
    hasSizes: true,
    hasColors: true,
    sizePreset: ["38", "39", "40", "41", "42", "43", "44", "45"],
    colorPreset: ["Black", "Brown", "White", "Navy"],
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

/** @type {Record<string, object>} */
let PRODUCT_TYPES = { ...BUILTIN_PRODUCT_TYPES };

function toConfig(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    key: o.key,
    label: o.label || o.key,
    description: o.description || "",
    hasSizes: Boolean(o.hasSizes),
    hasColors: Boolean(o.hasColors),
    sizePreset: Array.isArray(o.sizePreset) ? o.sizePreset.map(String).filter(Boolean) : [],
    colorPreset: Array.isArray(o.colorPreset) ? o.colorPreset.map(String).filter(Boolean) : [],
    isActive: o.isActive !== false,
    sortOrder: Number(o.sortOrder) || 100,
    _id: o._id,
  };
}

async function refreshProductTypeCache() {
  try {
    const ProductType = require("../models/productType.model");
    const rows = await ProductType.find({ isActive: { $ne: false } }).sort({ sortOrder: 1, label: 1 }).lean();
    const map = { ...BUILTIN_PRODUCT_TYPES };
    for (const row of rows) {
      const cfg = toConfig(row);
      if (cfg?.key) map[cfg.key] = cfg;
    }
    PRODUCT_TYPES = map;
  } catch (err) {
    console.error("[productTypes] cache refresh failed:", err.message);
  }
  return PRODUCT_TYPES;
}

function getProductTypeConfig(type) {
  const key = type || "simple";
  if (PRODUCT_TYPES[key]) return PRODUCT_TYPES[key];
  return {
    key,
    label: key,
    description: "",
    hasSizes: false,
    hasColors: false,
    sizePreset: [],
    colorPreset: [],
  };
}

function listProductTypeConfigs() {
  const seen = new Set();
  const list = [];
  for (const cfg of Object.values(PRODUCT_TYPES)) {
    if (!cfg?.key || seen.has(cfg.key)) continue;
    if (cfg.isActive === false) continue;
    seen.add(cfg.key);
    list.push(cfg);
  }
  return list.sort((a, b) => (a.sortOrder || 100) - (b.sortOrder || 100) || a.label.localeCompare(b.label));
}

/** Require size when product actually has size variants */
function productRequiresSize(product) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes.filter(Boolean) : [];
  if (sizes.length > 0) return true;
  const type = getProductTypeConfig(product?.productType);
  return Boolean(type.hasSizes && sizes.length > 0);
}

function productRequiresColor(product) {
  const qtyMap =
    product?.colorQuantities && typeof product.colorQuantities === "object"
      ? product.colorQuantities
      : {};
  const keys = Object.keys(qtyMap);
  if (keys.length > 0) return true;
  const colors = Array.isArray(product?.colors) ? product.colors.filter(Boolean) : [];
  if (colors.length > 0) return true;
  return false;
}

module.exports = {
  BUILTIN_PRODUCT_TYPES,
  get PRODUCT_TYPES() {
    return PRODUCT_TYPES;
  },
  get PRODUCT_TYPE_KEYS() {
    return Object.keys(PRODUCT_TYPES);
  },
  toConfig,
  refreshProductTypeCache,
  getProductTypeConfig,
  listProductTypeConfigs,
  productRequiresSize,
  productRequiresColor,
};

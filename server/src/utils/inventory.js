const { productRequiresSize, getProductTypeConfig } = require("../constants/productTypes");

function parseMaybeJson(value) {
  if (value == null) return value;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (_) {
    return value;
  }
}

function normalizeSizeQuantities(raw) {
  const parsed = parseMaybeJson(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const out = {};
  for (const [key, val] of Object.entries(parsed)) {
    if (!key) continue;
    out[String(key)] = Math.max(0, Number(val) || 0);
  }
  return out;
}

function normalizeSizes(raw) {
  const parsed = parseMaybeJson(raw);
  if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  if (typeof parsed === "string" && parsed.trim()) {
    return parsed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/** Total sellable units for a product */
function getTotalStock(product) {
  const sizeQty = normalizeSizeQuantities(product.sizeQuantities);
  const sizeKeys = Object.keys(sizeQty);
  if (sizeKeys.length > 0) {
    return sizeKeys.reduce((sum, k) => sum + (Number(sizeQty[k]) || 0), 0);
  }
  return Math.max(0, Number(product.quantity) || 0);
}

function getAvailableStock(product, { size } = {}) {
  const requires = productRequiresSize(product);
  const sizeQty = normalizeSizeQuantities(product.sizeQuantities);

  if (requires) {
    if (!size) return 0;
    if (Object.keys(sizeQty).length > 0) {
      return Math.max(0, Number(sizeQty[size]) || 0);
    }
    // sizes listed but no per-size qty → fall back to total quantity shared
    const sizes = normalizeSizes(product.sizes);
    if (!sizes.includes(String(size))) return 0;
    return Math.max(0, Number(product.quantity) || 0);
  }

  return Math.max(0, Number(product.quantity) || 0);
}

function assertCanPurchase(product, { size, quantity }) {
  const qty = Number(quantity) || 0;
  if (qty < 1) {
    return { ok: false, message: `Invalid quantity for ${product.name}` };
  }

  if (productRequiresSize(product) && !size) {
    return { ok: false, message: `Please select a size for ${product.name}` };
  }

  if (productRequiresSize(product) && size) {
    const sizes = normalizeSizes(product.sizes);
    if (sizes.length && !sizes.map(String).includes(String(size))) {
      return { ok: false, message: `Size ${size} not available for ${product.name}` };
    }
  }

  const available = getAvailableStock(product, { size });
  if (available < qty) {
    return {
      ok: false,
      message: `Insufficient stock for ${product.name}${size ? ` (${size})` : ""}`,
    };
  }

  return { ok: true };
}

/**
 * Mutates product fields for stock decrement; returns update payload.
 */
function buildStockDecrement(product, { size, quantity }) {
  const qty = Number(quantity) || 0;
  const sizeQty = normalizeSizeQuantities(product.sizeQuantities);
  const update = {};

  if (productRequiresSize(product) && size && Object.keys(sizeQty).length > 0) {
    const next = { ...sizeQty };
    next[size] = Math.max(0, (Number(next[size]) || 0) - qty);
    update.sizeQuantities = next;
    update.quantity = Object.values(next).reduce((s, n) => s + (Number(n) || 0), 0);
  } else {
    update.quantity = Math.max(0, (Number(product.quantity) || 0) - qty);
  }

  return update;
}

function applyProductTypeDefaults(productType, sizes, sizeQuantities, quantity) {
  const cfg = getProductTypeConfig(productType);
  let nextSizes = normalizeSizes(sizes);
  let nextSizeQty = normalizeSizeQuantities(sizeQuantities);
  let nextQty = Number(quantity) || 0;

  if (!cfg.hasSizes) {
    nextSizes = [];
    nextSizeQty = {};
  } else {
    if (Object.keys(nextSizeQty).length > 0) {
      nextSizes = nextSizes.length
        ? nextSizes
        : Object.keys(nextSizeQty);
      nextQty = Object.values(nextSizeQty).reduce((s, n) => s + (Number(n) || 0), 0);
    }
  }

  return {
    productType: cfg.key,
    sizes: nextSizes,
    sizeQuantities: Object.keys(nextSizeQty).length ? nextSizeQty : undefined,
    quantity: nextQty,
  };
}

module.exports = {
  parseMaybeJson,
  normalizeSizeQuantities,
  normalizeSizes,
  getTotalStock,
  getAvailableStock,
  assertCanPurchase,
  buildStockDecrement,
  applyProductTypeDefaults,
};

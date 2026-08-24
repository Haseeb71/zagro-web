/** Keep in sync with server/src/constants/productTypes.js */
export const PRODUCT_TYPES = {
  simple: {
    key: 'simple',
    label: 'Simple product',
    description: 'No size or colour variants',
    hasSizes: false,
    hasColors: false,
    sizePreset: [],
    colorPreset: [],
  },
  watch: {
    key: 'watch',
    label: 'Watch',
    description: 'Timepieces — quantity only',
    hasSizes: false,
    hasColors: false,
    sizePreset: [],
    colorPreset: [],
  },
  apparel: {
    key: 'apparel',
    label: 'Apparel / Suit',
    description: 'Clothing with sizes and colours',
    hasSizes: true,
    hasColors: true,
    sizePreset: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    colorPreset: ['Black', 'Navy', 'Grey', 'Brown', 'White', 'Beige'],
  },
  toy: {
    key: 'toy',
    label: 'Baby / Kids toy',
    description: 'Toys — age bands; optional colours',
    hasSizes: true,
    hasColors: true,
    sizePreset: ['0-6M', '6-12M', '1-2Y', '2-3Y', '3-5Y', '5-7Y', 'One Size'],
    colorPreset: ['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Multi'],
  },
  vehicle: {
    key: 'vehicle',
    label: 'Vehicle / Jeep',
    description: 'Cars, jeeps, RC — quantity only',
    hasSizes: false,
    hasColors: true,
    sizePreset: [],
    colorPreset: ['Black', 'White', 'Red', 'Blue', 'Silver'],
  },
  other: {
    key: 'other',
    label: 'Other (custom)',
    description: 'Custom sizes and colours if needed',
    hasSizes: true,
    hasColors: true,
    sizePreset: [],
    colorPreset: [],
  },
};

export const PRODUCT_TYPE_LIST = Object.values(PRODUCT_TYPES);

export function getProductTypeConfig(type) {
  return PRODUCT_TYPES[type] || PRODUCT_TYPES.simple;
}

export function productRequiresSize(product) {
  const type = getProductTypeConfig(product?.productType);
  const sizes = Array.isArray(product?.sizes) ? product.sizes.filter(Boolean) : [];
  return Boolean(type.hasSizes && sizes.length > 0);
}

export function productRequiresColor(product) {
  const type = getProductTypeConfig(product?.productType);
  const colors =
    product?.colorQuantities && typeof product.colorQuantities === 'object'
      ? Object.keys(product.colorQuantities)
      : Array.isArray(product?.colors)
        ? product.colors
        : [];
  return Boolean(type.hasColors && colors.filter(Boolean).length > 0);
}

export function getAvailableSizes(product) {
  if (!Array.isArray(product?.sizes)) return [];
  const qtyMap =
    product.sizeQuantities && typeof product.sizeQuantities === 'object'
      ? product.sizeQuantities
      : {};
  return product.sizes.filter((s) => {
    if (!s) return false;
    if (qtyMap[s] == null) return true;
    return Number(qtyMap[s]) > 0;
  });
}

export function getAvailableColors(product) {
  const qtyMap =
    product?.colorQuantities && typeof product.colorQuantities === 'object'
      ? product.colorQuantities
      : {};
  const keys = Object.keys(qtyMap);
  if (keys.length) {
    return keys.filter((c) => Number(qtyMap[c]) > 0 || qtyMap[c] == null);
  }
  return Array.isArray(product?.colors) ? product.colors.filter(Boolean) : [];
}

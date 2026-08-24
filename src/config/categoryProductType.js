/** Fallback slug → type when category.productType is empty */
export const CATEGORY_PRODUCT_TYPE = {
  watches: 'watch',
  'suits-apparel': 'apparel',
  'suits-and-apparel': 'apparel',
  'baby-toys': 'toy',
  'baby-and-toys': 'toy',
  vehicles: 'vehicle',
  men: 'apparel',
  women: 'apparel',
  kids: 'toy',
  shoes: 'shoes',
};

export function productTypeForCategory(slugOrCategory) {
  if (!slugOrCategory) return null;
  if (typeof slugOrCategory === 'object') {
    if (slugOrCategory.productType) return slugOrCategory.productType;
    if (slugOrCategory.slug) return CATEGORY_PRODUCT_TYPE[slugOrCategory.slug] || null;
    return null;
  }
  return CATEGORY_PRODUCT_TYPE[slugOrCategory] || null;
}

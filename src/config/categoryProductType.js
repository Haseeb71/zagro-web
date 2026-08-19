/** Map category slug → productType for brand filtering */
export const CATEGORY_PRODUCT_TYPE = {
  watches: 'watch',
  'suits-apparel': 'apparel',
  'suits-and-apparel': 'apparel', // legacy slug alias
  'baby-toys': 'toy',
  'baby-and-toys': 'toy',
  vehicles: 'vehicle',
  men: 'apparel',
  women: 'apparel',
  kids: 'toy',
};

export function productTypeForCategory(slug) {
  if (!slug) return null;
  return CATEGORY_PRODUCT_TYPE[slug] || null;
}

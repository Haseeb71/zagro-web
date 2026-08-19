/** FE helpers for sale + original (struck) prices */

export function resolveProductPricing(product = {}) {
  const price = Number(product.price) || 0;
  let originalPrice =
    product.originalPrice != null ? Number(product.originalPrice) : null;

  if (!(originalPrice > price) && product.isDiscounted && product.discountPercentage) {
    const pct = Number(product.discountPercentage);
    if (pct > 0 && pct < 100) {
      originalPrice = Math.round((price / (1 - pct / 100)) * 100) / 100;
    }
  }

  if (!(originalPrice > price)) originalPrice = null;

  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : Number(product.discountPercentage || product.discount) || null;

  return {
    price,
    originalPrice,
    discount: discount > 0 ? discount : null,
  };
}

export function formatRs(n) {
  return `Rs ${Number(n || 0).toLocaleString()}`;
}

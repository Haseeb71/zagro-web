/**
 * price = selling / discount price (what customer pays)
 * originalPrice = MRP / compare-at (shown struck through when higher)
 */
function resolvePricing(product) {
  const price = Number(product.price) || 0;
  let originalPrice = product.originalPrice != null ? Number(product.originalPrice) : null;

  if (!(originalPrice > price) && product.isDiscounted && product.discountPercentage) {
    const pct = Number(product.discountPercentage);
    if (pct > 0 && pct < 100) {
      originalPrice = Math.round((price / (1 - pct / 100)) * 100) / 100;
    }
  }

  if (!(originalPrice > price)) {
    originalPrice = null;
  }

  let discountPercentage = Number(product.discountPercentage) || 0;
  if (originalPrice > price) {
    discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  return {
    price,
    originalPrice,
    discountPercentage: discountPercentage || 0,
    isDiscounted: Boolean(originalPrice > price || product.isDiscounted),
    discount: discountPercentage > 0 ? discountPercentage : null,
  };
}

function applyPricingFields(price, originalPrice, isDiscounted, discountPercentage) {
  const sale = Number(price);
  let original = originalPrice !== undefined && originalPrice !== '' && originalPrice != null
    ? Number(originalPrice)
    : null;

  let discounted = isDiscounted === true || isDiscounted === 'true';
  let pct = Number(discountPercentage) || 0;

  if (original > sale) {
    discounted = true;
    pct = Math.round(((original - sale) / original) * 100);
  } else if (discounted && pct > 0 && pct < 100 && !(original > sale)) {
    original = Math.round((sale / (1 - pct / 100)) * 100) / 100;
  } else {
    original = null;
    if (!discounted) pct = 0;
  }

  return {
    price: sale,
    originalPrice: original,
    isDiscounted: discounted,
    discountPercentage: pct,
  };
}

module.exports = { resolvePricing, applyPricingFields };

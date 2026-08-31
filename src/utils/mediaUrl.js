export function mediaUrl(path) {
  if (!path) return null;
  const raw = String(path).trim();
  if (!raw) return null;

  // Already absolute or data URI
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
    return raw;
  }

  // Already a media API URL — do not re-prefix
  if (raw.startsWith('/api/upload/media') || raw.startsWith('/api/')) {
    return raw;
  }

  /**
   * Private S3 object key — served via backend redirect to presigned GET.
   * Keys look like: uploads/products/123-file.jpg  OR  products/123-file.jpg
   */
  if (
    raw.startsWith('uploads/') ||
    raw.startsWith('products/') ||
    raw.startsWith('brands/') ||
    raw.startsWith('banners/') ||
    raw.startsWith('categories/') ||
    raw.startsWith('promotions/')
  ) {
    const key = raw.startsWith('uploads/') ? raw : `uploads/${raw}`;
    const base = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');
    return `${base}/upload/media?key=${encodeURIComponent(key)}`;
  }

  // Legacy local disk paths
  let clean = raw.replace(/\\/g, '/');
  const uploadsIdx = clean.toLowerCase().lastIndexOf('/uploads/');
  if (uploadsIdx >= 0) {
    clean = clean.slice(uploadsIdx);
  } else if (!clean.startsWith('/uploads') && !clean.startsWith('uploads')) {
    clean = `/uploads/${clean.replace(/^\/+/, '')}`;
  }
  if (!clean.startsWith('/')) clean = `/${clean}`;

  // If it resolved to /uploads/products/... treat as S3 key via media API
  if (clean.startsWith('/uploads/')) {
    const key = clean.slice(1); // drop leading slash
    const base = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');
    return `${base}/upload/media?key=${encodeURIComponent(key)}`;
  }

  const base = (process.env.NEXT_PUBLIC_IMAGE_URL || '').replace(/\/$/, '');
  return `${base}${clean}`;
}

/** Product images may be strings, { url }, images[], or cart.product.image */
export function productImageUrl(productOrImage) {
  if (!productOrImage) return null;
  if (typeof productOrImage === 'string') return mediaUrl(productOrImage);

  if (Array.isArray(productOrImage.images) && productOrImage.images.length) {
    return productImageUrl(productOrImage.images[0]);
  }

  return mediaUrl(
    productOrImage.image ||
      productOrImage.url ||
      productOrImage.path ||
      productOrImage.src ||
      null
  );
}

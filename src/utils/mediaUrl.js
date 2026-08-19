export function mediaUrl(path) {
  if (!path) return null;
  const raw = String(path);
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
    return raw;
  }

  let clean = raw.replace(/\\/g, '/');
  const uploadsIdx = clean.toLowerCase().lastIndexOf('/uploads/');
  if (uploadsIdx >= 0) {
    clean = clean.slice(uploadsIdx);
  } else if (!clean.startsWith('/uploads') && !clean.startsWith('uploads')) {
    clean = `/uploads/${clean.replace(/^\/+/, '')}`;
  }
  if (!clean.startsWith('/')) clean = `/${clean}`;

  const base = (process.env.NEXT_PUBLIC_IMAGE_URL || '').replace(/\/$/, '');
  return `${base}${clean}`;
}

/** Product images may be strings or { url } objects from the API */
export function productImageUrl(productOrImage) {
  if (!productOrImage) return null;
  if (typeof productOrImage === 'string') return mediaUrl(productOrImage);

  if (Array.isArray(productOrImage.images)) {
    return productImageUrl(productOrImage.images[0]);
  }

  return mediaUrl(
    productOrImage.url || productOrImage.path || productOrImage.src || productOrImage.image || null
  );
}

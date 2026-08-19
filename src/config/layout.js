// Layout configuration for different pages
export const LAYOUT_CONFIG = {
  WITH_LAYOUT: [
    '/',
    '/categories',
    '/products',
    '/product',
    '/checkout',
    '/shop',
    '/order-status',
    '/profile',
    '/orders',
    '/wishlist',
    '/about',
    '/contact',
    '/help',
  ],

  WITHOUT_LAYOUT: [
    '/admin',
  ],

  shouldUseLayout: (pathname) => {
    // Never wrap admin console with storefront chrome
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      return false;
    }

    const shouldExclude = LAYOUT_CONFIG.WITHOUT_LAYOUT.some((pattern) => {
      if (pattern.endsWith('*')) {
        return pathname.startsWith(pattern.slice(0, -1));
      }
      return pathname === pattern || pathname.startsWith(pattern + '/');
    });

    if (shouldExclude) return false;

    const shouldInclude = LAYOUT_CONFIG.WITH_LAYOUT.some((pattern) => {
      if (pattern.endsWith('*')) {
        return pathname.startsWith(pattern.slice(0, -1));
      }
      return pathname === pattern || pathname.startsWith(pattern + '/');
    });

    return Boolean(shouldInclude);
  },
};

export const useLayout = (pathname) => {
  return LAYOUT_CONFIG.shouldUseLayout(pathname);
};

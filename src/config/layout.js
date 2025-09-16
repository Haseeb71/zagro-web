// Layout configuration for different pages
export const LAYOUT_CONFIG = {
  // Pages that should use the full layout (Navigation + Footer)
  WITH_LAYOUT: [
    '/',                    // Home page
    '/categories',          // Categories page
    '/products',            // Products page
    '/checkout',            // Checkout page
    '/profile',             // User profile
    '/orders',              // User orders
    '/wishlist',            // User wishlist
    '/about',               // About page
    '/contact',             // Contact page
    '/help',                // Help/FAQ page
  ],
  
  // Pages that should NOT use the layout (standalone pages)
  WITHOUT_LAYOUT: [
    // No auth pages - all pages use layout
  ],
  
  // Check if a path should use layout
  shouldUseLayout: (pathname) => {
    // Check if path starts with any of the WITH_LAYOUT patterns
    const shouldInclude = LAYOUT_CONFIG.WITH_LAYOUT.some(pattern => {
      if (pattern.endsWith('*')) {
        // Wildcard pattern (e.g., '/products*' matches '/products/123')
        return pathname.startsWith(pattern.slice(0, -1));
      }
      return pathname === pattern || pathname.startsWith(pattern + '/');
    });
    
    // Check if path starts with any of the WITHOUT_LAYOUT patterns
    const shouldExclude = LAYOUT_CONFIG.WITHOUT_LAYOUT && LAYOUT_CONFIG.WITHOUT_LAYOUT.some(pattern => {
      if (pattern.endsWith('*')) {
        return pathname.startsWith(pattern.slice(0, -1));
      }
      return pathname === pattern || pathname.startsWith(pattern + '/');
    });
    
    // If explicitly excluded, don't use layout
    if (shouldExclude) return false;
    
    // If explicitly included, use layout
    if (shouldInclude) return true;
    
    // Default: use layout for most pages
    return true;
  }
};

// Simple function-based approach - all pages use layout
export const useLayout = (pathname) => {
  return true; // All pages use layout now
};

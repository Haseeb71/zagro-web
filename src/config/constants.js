// export const BASE_URL = 'https://admin.api.zagrofootwear.com/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const BASE_URL = API_URL;

// Debug logging
console.log('BASE_URL:', BASE_URL);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

export const ENDPOINT = {
    products: {
        getLandingPageProducts: `${BASE_URL}/products/all-types`,
        getNewArrivals: `${BASE_URL}/products/new-arrivals`,
        getTrendingProducts: `${BASE_URL}/products/trending`,
        getBestSellersProducts: `${BASE_URL}/products/best-sellers`,
        getSearchedProducts: `${BASE_URL}/products/search`,
        getFilteredProducts: `${BASE_URL}/products/filter`,
        getProductById: `${BASE_URL}/products`,
    },
    categories: {
        getAllCategories: `${BASE_URL}/categories`,
    },
    promotions: {
        getPromotions: `${BASE_URL}/promotions`,
    },
    order: {
        placeOrder: `${BASE_URL}/checkout`,
        applyCoupon: `${BASE_URL}/coupons`,
    }
};

// Export API_ENDPOINTS for backward compatibility
export const API_ENDPOINTS = ENDPOINT;

// Add API_HEADERS for authentication requests
export const API_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};


export const BASE_URL = 'https://admin.api.zagrofootwear.com/api';
// export const BASE_URL = 'http://localhost:3005/api';

export const ENDPOINT = {
 
    products: {
        getLandingPageProducts: `${BASE_URL}/product/all-types`,
        getProducts:`${BASE_URL}/product`,
        getProductsByFilters: `${BASE_URL}/product/filter`,
        getProductById: `${BASE_URL}/product`
    },
    categories: {
        getAllCategories: `${BASE_URL}/product/category/all`
    },
    subCategories: {
        getAllSubCategoriesByCategory: `${BASE_URL}/product/sub-category/by-category`,
        getAllSubCategories: `${BASE_URL}/product/sub-category/all`
    },
    promotions: {
        getAllPromotions: `${BASE_URL}/promotion`
    },
    checkoutCustomer: {
        checkoutCustomer: `${BASE_URL}/checkout/customer`,
        applyCoupon: `${BASE_URL}/coupon/validate`
    },
    orderCheckout: {
        orderCheckout: `${BASE_URL}/checkout`
    }
};


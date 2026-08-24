const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
export const BASE_URL = API_URL;

export const ENDPOINT = {
  auth: {
    login: `${BASE_URL}/user/login`,
  },
  products: {
    getLandingPageProducts: `${BASE_URL}/product/all-types`,
    getProducts: `${BASE_URL}/product`,
    getNewArrivals: `${BASE_URL}/product`,
    getTrendingProducts: `${BASE_URL}/product`,
    getBestSellersProducts: `${BASE_URL}/product`,
    getSearchedProducts: `${BASE_URL}/product/filter`,
    getFilteredProducts: `${BASE_URL}/product/filter`,
    getProductById: `${BASE_URL}/product`,
    create: `${BASE_URL}/product/create`,
    update: `${BASE_URL}/product/update`,
    delete: `${BASE_URL}/product/delete`,
  },
  categories: {
    getAllCategories: `${BASE_URL}/product/category/all`,
    create: `${BASE_URL}/product/category/create`,
    update: `${BASE_URL}/product/category/update`,
    delete: `${BASE_URL}/product/category/delete`,
  },
  promotions: {
    getPromotions: `${BASE_URL}/promotion`,
    getActive: `${BASE_URL}/promotion/active`,
    create: `${BASE_URL}/promotion/create`,
    update: `${BASE_URL}/promotion/update`,
    delete: `${BASE_URL}/promotion/delete`,
  },
  order: {
    placeOrder: `${BASE_URL}/checkout`,
    applyCoupon: `${BASE_URL}/coupon/validate`,
    getOrders: `${BASE_URL}/checkout`,
    getOrderByNumber: `${BASE_URL}/checkout/order`,
  },
  brands: {
    list: `${BASE_URL}/brand`,
    create: `${BASE_URL}/brand/create`,
    update: `${BASE_URL}/brand/update`,
    delete: `${BASE_URL}/brand/delete`,
  },
  banners: {
    list: `${BASE_URL}/banner`,
    active: `${BASE_URL}/banner/active`,
    create: `${BASE_URL}/banner/create`,
    update: `${BASE_URL}/banner/update`,
    delete: `${BASE_URL}/banner/delete`,
  },
  coupons: {
    list: `${BASE_URL}/coupon`,
    create: `${BASE_URL}/coupon/create`,
    update: `${BASE_URL}/coupon/update`,
    delete: `${BASE_URL}/coupon/delete`,
  },
  productTypes: {
    list: `${BASE_URL}/product-type`,
    adminList: `${BASE_URL}/product-type/admin`,
    create: `${BASE_URL}/product-type/create`,
    update: `${BASE_URL}/product-type/update`,
    delete: `${BASE_URL}/product-type/delete`,
  },
  upload: {
    presign: `${BASE_URL}/upload/presign`,
    sign: `${BASE_URL}/upload/sign`,
    media: `${BASE_URL}/upload/media`,
  },
};

export const API_ENDPOINTS = ENDPOINT;

export const API_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

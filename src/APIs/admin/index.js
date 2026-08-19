import API from '../base';
import { ENDPOINT } from '../../config/constants';

const adminAPI = {
  login: async (email, password) => {
    return API.postMethod(ENDPOINT.auth.login, false, { email, password }, true, true);
  },

  getProducts: async (page = 1, perPage = 20, search = '', category = '', brand = '') => {
    const body = { page, perPage, search };
    if (category) body.category = category;
    if (brand) body.brand = brand;
    return API.postMethod(ENDPOINT.products.getProducts, true, body, false, false);
  },

  getProductById: async (id) => {
    return API.getMethod(`${ENDPOINT.products.getProductById}/${id}`, true, false, false);
  },

  createProduct: async (formData) => {
    return API.postMethod(ENDPOINT.products.create, true, formData, true, true, true);
  },

  updateProduct: async (id, formData) => {
    return API.postMethod(`${ENDPOINT.products.update}/${id}`, true, formData, true, true, true);
  },

  deleteProduct: async (id) => {
    return API.deleteMethod(`${ENDPOINT.products.delete}/${id}`, true);
  },

  getCategories: async () => {
    return API.getMethod(ENDPOINT.categories.getAllCategories, true, false, false);
  },

  createCategory: async (data) => {
    return API.postMethod(ENDPOINT.categories.create, true, data, true, true, data instanceof FormData);
  },

  updateCategory: async (id, data) => {
    return API.postMethod(`${ENDPOINT.categories.update}/${id}`, true, data, true, true, data instanceof FormData);
  },

  deleteCategory: async (id) => {
    return API.deleteMethod(`${ENDPOINT.categories.delete}/${id}`, true);
  },

  getBrands: async () => {
    return API.getMethod(ENDPOINT.brands.list, true, false, false);
  },

  createBrand: async (formData) => {
    return API.postMethod(ENDPOINT.brands.create, true, formData, true, true, true);
  },

  updateBrand: async (id, formData) => {
    return API.putMethod(`${ENDPOINT.brands.update}/${id}`, true, formData, true, true, true);
  },

  deleteBrand: async (id) => {
    return API.deleteMethod(`${ENDPOINT.brands.delete}/${id}`, true);
  },

  getBanners: async () => {
    return API.getMethod(ENDPOINT.banners.list, true, false, false);
  },

  createBanner: async (formData) => {
    return API.postMethod(ENDPOINT.banners.create, true, formData, true, true, true);
  },

  updateBanner: async (id, formData) => {
    return API.putMethod(`${ENDPOINT.banners.update}/${id}`, true, formData, true, true, true);
  },

  deleteBanner: async (id) => {
    return API.deleteMethod(`${ENDPOINT.banners.delete}/${id}`, true);
  },

  getPromotions: async () => {
    return API.getMethod(ENDPOINT.promotions.getPromotions, true, false, false);
  },

  createPromotion: async (formData) => {
    return API.postMethod(ENDPOINT.promotions.create, true, formData, true, true, true);
  },

  deletePromotion: async (id) => {
    return API.deleteMethod(`${ENDPOINT.promotions.delete}/${id}`, true);
  },

  getCoupons: async () => {
    return API.getMethod(ENDPOINT.coupons.list, true, false, false);
  },

  createCoupon: async (data) => {
    return API.postMethod(ENDPOINT.coupons.create, true, data, true, true);
  },

  deleteCoupon: async (id) => {
    return API.deleteMethod(`${ENDPOINT.coupons.delete}/${id}`, true);
  },

  getOrders: async () => {
    return API.getMethod(`${ENDPOINT.order.getOrders}?perPage=100`, true, false, false);
  },

  getOrderById: async (id) => {
    return API.getMethod(`${ENDPOINT.order.getOrders}/${id}`, true, false, false);
  },

  getCustomers: async () => {
    return API.getMethod(`${ENDPOINT.order.getOrders}/customers?perPage=100`, true, false, false);
  },
};

export default adminAPI;

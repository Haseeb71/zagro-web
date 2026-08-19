import API from '../base'
import { ENDPOINT } from '../../config/constants'

const getLandingPageProducts = async () => {
  const response = await API.postMethod(`${ENDPOINT.products.getLandingPageProducts}`, false, {
    page: 1,
    perPage: 20,
  });
  return response;
}

const getProductsByType = async (type) => {
  const response = await API.postMethod(ENDPOINT.products.getProducts, false, {
    page: 1,
    perPage: 20,
    type,
  });
  return response;
}

const getNewArrivals = async () => getProductsByType('new');
const getTrendingProducts = async () => getProductsByType('trending');
const getBestSellersProducts = async () => getProductsByType('bestseller');

const getSearchedProducts = async (search) => {
  const url = `${ENDPOINT.products.getSearchedProducts}?search=${encodeURIComponent(search)}`;
  return API.getMethod(url, false);
}

const getFilteredProducts = async (filters) => {
  const {
    gender,
    category,
    brand,
    productType,
    page = 1,
    limit = 12,
    sortBy = 'newest',
  } = filters;
  const params = new URLSearchParams();
  if (gender) params.append('gender', gender);
  if (category) params.append('category', category);
  if (brand) params.append('brand', brand);
  if (productType) params.append('productType', productType);
  params.append('page', page);
  params.append('perPage', limit);
  if (sortBy) params.append('sortBy', sortBy === 'newest' ? 'createdAt' : sortBy);
  const url = `${ENDPOINT.products.getFilteredProducts}?${params.toString()}`;
  return API.getMethod(url, false);
}

const getProductById = async (id) => {
  const url = `${ENDPOINT.products.getProductById}/${id}`;
  return API.getMethod(url, false);
}

export default {
  getLandingPageProducts,
  getNewArrivals,
  getTrendingProducts,
  getBestSellersProducts,
  getSearchedProducts,
  getFilteredProducts,
  getProductById,
}

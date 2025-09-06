import API from '../base'
import { ENDPOINT } from '../../config/constants'


const getLandingPageProducts = async () => {
  const response = await API.postMethod(`${ENDPOINT.products.getLandingPageProducts}`, false, {
    page: 1,
    limit: 10
  });
  console.log("response ---", response);
  return response;
}

const getNewArrivals = async () => {
  const response = await API.getMethod(`${ENDPOINT.products.getNewArrivals}`, false);
  return response;
}

const getTrendingProducts = async () => {
  const response = await API.getMethod(`${ENDPOINT.products.getTrendingProducts}`, false);
  return response;
}

const getBestSellersProducts = async () => {
  const response = await API.getMethod(`${ENDPOINT.products.getBestSellersProducts}`, false);
  return response;
}

const getSearchedProducts = async (search) => {
  const url = `${ENDPOINT.products.getSearchedProducts}?q=${encodeURIComponent(search)}`;
  console.log("Search API URL:", url);
  console.log("Search query:", search);
  console.log("ENDPOINT.products.getSearchedProducts:", ENDPOINT.products.getSearchedProducts);
  const response = await API.getMethod(url, false);
  console.log("Search API Response:", response);
  return response;
}

const getFilteredProducts = async (filters) => {
  const { gender, category, page = 1, limit = 12, sortBy = 'newest' } = filters;
  
  // Build query parameters
  const params = new URLSearchParams();
  if (gender) params.append('gender', gender);
  if (category) params.append('category', category);
  params.append('page', page);
  params.append('limit', limit);
  if (sortBy) params.append('sortBy', sortBy);
  
  const url = `${ENDPOINT.products.getFilteredProducts}?${params.toString()}`;
  console.log("Filter API URL:", url);
  console.log("Filter params:", { gender, category, page, limit, sortBy });
  const response = await API.getMethod(url, false);
  console.log("Filter API Response:", response);
  return response;
}

const getProductById = async (id) => {
  const url = `${ENDPOINT.products.getProductById}/${id}`;
  const response = await API.getMethod(url, false);
  return response;
}


export default {
  getLandingPageProducts,
  getNewArrivals,
  getTrendingProducts,
  getBestSellersProducts,
  getSearchedProducts,
  getFilteredProducts,
  getProductById
}
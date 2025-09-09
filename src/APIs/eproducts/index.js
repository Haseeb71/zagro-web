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

const getProducts = async (params = {}) => {
  const { page = "", perPage = "", search = "", type = "" } = params;

  const payload = {};

  // Only add parameters to payload if they have values
  if (page !== "") payload.page = page;
  if (perPage !== "") payload.perPage = perPage;
  if (search !== "") payload.search = search;
  if (type !== "") payload.type = type;

  const response = await API.postMethod(`${ENDPOINT.products.getProducts}`, false, payload);
  return response;
}

const getProductsByFilters = async (params = {}) => {
  const {
    // Pagination
    page = "",
    perPage = "",

    // Basic filters
    search = "",
    category = "",
    subCategory = "",

    // Price filters
    minPrice = "",
    maxPrice = "",

    // Product type filters
    isFeatured = "",
    isBestSeller = "",
    isTrending = "",
    isSpecial = "",
    isDiscounted = "",

    // Color and size filters
    color = "",
    size = "",

    // Availability
    inStock = "",

    // Sorting
    sortBy = "",
    sortOrder = ""
  } = params;

  // Build query string
  const queryParams = new URLSearchParams();

  // Only add parameters to query string if they have values
  if (page !== "") queryParams.append('page', page);
  if (perPage !== "") queryParams.append('perPage', perPage);
  if (search !== "") queryParams.append('search', search);
  if (category !== "") queryParams.append('category', category);
  if (subCategory !== "") queryParams.append('subCategory', subCategory);
  if (minPrice !== "") queryParams.append('minPrice', minPrice);
  if (maxPrice !== "") queryParams.append('maxPrice', maxPrice);
  if (isFeatured !== "") queryParams.append('isFeatured', isFeatured);
  if (isBestSeller !== "") queryParams.append('isBestSeller', isBestSeller);
  if (isTrending !== "") queryParams.append('isTrending', isTrending);
  if (isSpecial !== "") queryParams.append('isSpecial', isSpecial);
  if (isDiscounted !== "") queryParams.append('isDiscounted', isDiscounted);
  if (color !== "") queryParams.append('color', color);
  if (size !== "") queryParams.append('size', size);
  if (inStock !== "") queryParams.append('inStock', inStock);
  if (sortBy !== "") queryParams.append('sortBy', sortBy);
  if (sortOrder !== "") queryParams.append('sortOrder', sortOrder);

  // Build the full URL with query parameters
  const url = `${ENDPOINT.products.getProductsByFilters}?${queryParams.toString()}`;

  const response = await API.getMethod(url, false);
  return response;
}

const getProductById = async (id) => {
  const response = await API.getMethod(`${ENDPOINT.products.getProductById}/${id}`, false);
  return response;
}

export default {
  getLandingPageProducts,
  getProducts,
  getProductsByFilters,
  getProductById
}
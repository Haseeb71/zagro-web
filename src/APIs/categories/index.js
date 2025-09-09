import API from '../base'
import { ENDPOINT } from '../../config/constants'

const getAllCategories = async () => {
    const response = await API.getMethod(`${ENDPOINT.categories.getAllCategories}`, false);
    return response;
}

const getAllSubCategoriesByCategory = async (categoryId) => {
    const response = await API.getMethod(`${ENDPOINT.subCategories.getAllSubCategoriesByCategory}/${categoryId}`, false);
    return response;
}

const getAllSubCategories = async () => {
  const response = await API.getMethod(`${ENDPOINT.subCategories.getAllSubCategories}`, false);
  return response;
}

export default {
  getAllCategories,
  getAllSubCategoriesByCategory,
  getAllSubCategories
}

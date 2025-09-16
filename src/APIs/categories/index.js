import API from '../base';
import { ENDPOINT } from '../../config/constants'

const categoriesAPI = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await API.getMethod(`${ENDPOINT.categories.getAllCategories}`, false);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: null, error: error, success: false };
    }
  }
};

export default categoriesAPI;

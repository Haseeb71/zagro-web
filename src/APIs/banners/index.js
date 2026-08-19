import API from '../base';
import { ENDPOINT } from '../../config/constants';

const bannersAPI = {
  getActive: async () => API.getMethod(ENDPOINT.banners.active, false, false, false),
};

export default bannersAPI;

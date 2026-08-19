import API from '../base';
import { ENDPOINT } from '../../config/constants';

const brandsAPI = {
  getAll: async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.isActive != null) qs.append('isActive', String(params.isActive));
    if (params.productType) qs.append('productType', params.productType);
    const q = qs.toString();
    const url = q ? `${ENDPOINT.brands.list}?${q}` : ENDPOINT.brands.list;
    return API.getMethod(url, false, false, false);
  },
};

export default brandsAPI;

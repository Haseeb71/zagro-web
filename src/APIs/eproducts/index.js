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




export default {
  getLandingPageProducts,
}
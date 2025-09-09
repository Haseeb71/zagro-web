import API from '../base'
import { ENDPOINT } from '../../config/constants'

const getPromotions = async () => {
    const response = await API.getMethod(`${ENDPOINT.promotions.getAllPromotions}`, false);
    return response;
}

export default { 
    getPromotions 
}
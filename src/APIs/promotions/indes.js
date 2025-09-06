import API from '../base'
import { ENDPOINT } from '../../config/constants'

const getPromotions = async () => {
    const response = await API.getMethod(`${ENDPOINT.promotions.getPromotions}`, false)
    console.log("response for promotions ---", response);
    return response;
}

export default {
    getPromotions
}
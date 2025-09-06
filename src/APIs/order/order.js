import API from '../base'
import { ENDPOINT } from '../../config/constants'

const placeOrder = async (order) => {
    
    const response = await API.postMethod(ENDPOINT.order.placeOrder, false, order);
    return response;
}
const applyCoupon = async (couponCode) => {
    const response = await API.getMethod(`${ENDPOINT.order.applyCoupon}/${couponCode}`, false);
    return response;
}

export default {
    placeOrder,
    applyCoupon
}

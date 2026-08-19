import API from '../base'
import { ENDPOINT } from '../../config/constants'

const placeOrder = async (order) => {
    const response = await API.postMethod(ENDPOINT.order.placeOrder, false, order, false, false);
    return response;
}

const applyCoupon = async (couponCode) => {
    const response = await API.postMethod(ENDPOINT.order.applyCoupon, false, { code: couponCode }, false, false);
    return response;
}

export default {
    placeOrder,
    applyCoupon
}

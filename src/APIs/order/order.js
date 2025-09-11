import API from '../base'
import { ENDPOINT } from '../../config/constants'

const applyCoupon = async (couponData) => {
    const response = await API.postMethod(`${ENDPOINT.checkoutCustomer.applyCoupon}`, false, couponData);
    return response;
}

const checkoutCustomer = async (data) => {
    const response = await API.postMethod(`${ENDPOINT.checkoutCustomer.checkoutCustomer}`, false, data);
    return response;
}

const orderCheckout = async (data) => {
    const response = await API.postMethod(`${ENDPOINT.orderCheckout.orderCheckout}`, false, data);
    return response;
}

const orderStatus = async (orderNumber) => {
    const response = await API.getMethod(`${ENDPOINT.orderCheckout.orderStatus}/${orderNumber}`, false);
    return response;
}

export default {
    applyCoupon,
    checkoutCustomer,
    orderCheckout,
    orderStatus
}

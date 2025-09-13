import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { clearCart, updateQuantity } from '../redux/slices/cartSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import orderAPI from '../APIs/order/order';
import Layout from '../components/Layout';
import FormField from '../components/FormField';
import ErrorSummary from '../components/ErrorSummary';
import SubmitButton from '../components/SubmitButton';
// import OrderConfirmationModal from '../components/OrderConfirmationModal';

// Helper function to format prices (e.g., 1000 to 1k)
const formatPrice = (price) => {
  if (!price) return 0;

  // Fix floating point issue
  const fixedPrice = Number(price.toFixed(2));

  if (fixedPrice < 1000) {
    return fixedPrice; // return normally if < 1000
  }
  if (fixedPrice >= 1000000) {
    return (fixedPrice / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (fixedPrice >= 1000) {
    return (fixedPrice / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }

  return fixedPrice;
};


// Helper function to count words
const countWords = (text) => {
  if (!text || text.trim() === '') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Validation schema
const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .matches(/^[\+]?[0-9\s\-\(\)]+$/, 'Phone number can only contain digits, spaces, hyphens, parentheses, and + sign')
    .test('phone-format', 'Please enter a valid phone number', function (value) {
      if (!value) return false;

      // Remove all non-digit characters for basic validation
      const digitsOnly = value.replace(/\D/g, '');

      // Check if it's a reasonable length (10-13 digits)
      if (digitsOnly.length < 10 || digitsOnly.length > 13) {
        return false;
      }

      // Try to parse with libphonenumber-js for more validation
      try {
        const phoneNumber = parsePhoneNumber(value, 'Rs');
        return phoneNumber && phoneNumber.isValid();
      } catch (error) {
        try {
          const phoneNumber = parsePhoneNumber(value);
          return phoneNumber && phoneNumber.isValid();
        } catch (e) {
          // If libphonenumber fails, just check basic format
          return digitsOnly.length >= 10 && digitsOnly.length <= 13;
        }
      }
    }),
  address: Yup.string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters')
    .matches(/^[a-zA-Z0-9\s\-#.,/]+$/, 'Address contains invalid characters')
    .required('Address is required'),
  city: Yup.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces')
    .required('City is required'),
  state: Yup.string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'State can only contain letters and spaces')
    .required('State is required'),
  zipCode: Yup.string()
    .matches(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789')
    .required('ZIP code is required'),
  notes: Yup.string()
    .test('word-count', 'Order notes must be between 10 and 250 words', function (value) {
      if (!value || value.trim() === '') return true; // Optional field
      const wordCount = countWords(value);
      return wordCount >= 10 && wordCount <= 250;
    })
    .max(2000, 'Notes must be less than 2000 characters')
});

const CheckoutPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [showOrderModal, setShowOrderModal] = useState(false);
  // Get cart data from Redux
  const { items: cartItems, totalItems, totalPrice } = useAppSelector(state => state.cart);

  // Initial form values
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  };

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState(null);
  const [couponDetails, setCouponDetails] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [orderResult, setOrderResult] = useState({ isSuccess: false, message: '', orderNumber: null });

  // Customer and order state
  const [customerId, setCustomerId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Redirect to home if cart is empty (but not if modal is showing)
  useEffect(() => {
    if (cartItems.length === 0 && !showOrderModal) {
      router.push('/');
    }
  }, [cartItems.length, showOrderModal, router]);

  // Handle ESC key to close image modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
        setPreviewImage(null);
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset'; // Restore scrolling
    };
  }, [showImageModal]);

  const subtotal = totalPrice; // Use Redux total price
  const shipping = 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const discount = couponDiscount || 0; // Default to 0 if no coupon
  const total = subtotal + shipping + tax - discount;

  // Coupon validation and application
  const validateAndApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponStatus('invalid');
      return;
    }

    try {
      // Prepare coupon data according to the API requirements
      const couponRequestData = {
        code: couponCode,
        orderAmount: subtotal,
        productIds: cartItems.map(item => item.product._id),
        categoryIds: cartItems.map(item => item.product.category).filter((value, index, self) => self.indexOf(value) === index)
      };

      const response = await orderAPI.applyCoupon(couponRequestData);
      console.log('Coupon API Response:', response);

      // The base API returns the full axios response, so we need to access .data
      const couponResponseData = response?.data;
      console.log('Coupon data:', couponResponseData);

      if (couponResponseData && couponResponseData.isValid) {
        const coupon = couponResponseData.coupon;

        // Coupon is valid
        setCouponStatus('applied');
        setCouponDetails(coupon);
        setCouponDiscount(couponResponseData.discountAmount || 0);
      } else {
        setCouponStatus('invalid');
        setCouponDetails(null);
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponStatus('invalid');
      setCouponDetails(null);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setCouponCode('');
    setCouponStatus(null);
    setCouponDetails(null);
    setCouponDiscount(0);
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);
      setIsProcessing(true);

      // Step 1: Create customer first
      const customerData = {
        fullName: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.phone,
        address: {
          street: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: 'Pakistan'
        }
      };

      console.log('Creating customer:', customerData);
      const customerResponse = await orderAPI.checkoutCustomer(customerData);
      console.log('Customer created:', customerResponse);

      // The base API returns the full axios response, so we need to access .data
      const customerResponseData = customerResponse?.data;
      console.log('Customer data:', customerResponseData);

      // Check if response exists and has customer data
      if (!customerResponseData || !customerResponseData.customer || !customerResponseData.customer._id) {
        throw new Error('Failed to create customer - invalid response structure');
      }

      const customerId = customerResponseData.customer._id;
      setCustomerId(customerId);
      console.log('Customer ID extracted:', customerId);

      // Step 2: Create order with customer ID
      const orderData = {
        customerId: customerId,
        items: cartItems.map(item => ({
          productId: item.product._id,
          productName: item.product.name,
          size: item.selectedSize,
          color: item.selectedColor,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal: subtotal,
        discountAmount: couponDiscount,
        couponCode: couponDetails?.code || null,
        shippingAmount: shipping,
        taxAmount: tax,
        totalAmount: total,
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        shippingAddress: {
          street: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: 'Pakistan'
        },
        billingAddress: {
          street: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: 'Pakistan'
        },
        notes: values.notes || `Payment method: ${paymentMethod}`
      };

      console.log('Creating order:', orderData);
      const orderResponse = await orderAPI.orderCheckout(orderData);
      console.log('Order created:', orderResponse);

      // The base API returns the full axios response, so we need to access .data
      const orderResponseData = orderResponse?.data;
      console.log('Order data:', orderResponseData);

      // Check if response exists (be more flexible with response structure)
      if (!orderResponseData) {
        throw new Error('Failed to create order - no response received');
      }

      console.log('Order creation successful, showing success modal');

      // Show success modal
      setOrderResult({
        isSuccess: true,
        message: 'Your order has been placed successfully!',
        orderNumber: orderResponseData.checkout?.orderNumber
      });
      setShowOrderModal(true);

    } catch (error) {
      console.error('Order placement error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });

      // Show error modal
      setOrderResult({
        isSuccess: false,
        message: error.message || error.response?.data?.message || 'Failed to place order. Please try again.',
        orderNumber: null
      });
      setShowOrderModal(true);
    } finally {
      setSubmitting(false);
      setIsProcessing(false);
    }
  };

  // Handle modal close
  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    // If it was a successful order, clear the cart
    if (orderResult.isSuccess) {
      dispatch(clearCart());
    }
    setOrderResult({ isSuccess: false, message: '', orderNumber: null });
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    setShowOrderModal(false);
    // If it was a successful order, clear the cart
    if (orderResult.isSuccess) {
      dispatch(clearCart());
    }
    setOrderResult({ isSuccess: false, message: '', orderNumber: null });
    router.push('/');
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Checkout - Zagro Footwear</title>
        <meta name="description" content="Complete your order at Zagro Footwear" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="mb-8 text-center">
            <div className="flex justify-center items-center mb-4">
              <img
                src="/images/logo.png"
                alt="Zagro Footwear"
                className="h-12 w-auto sm:h-14 md:h-16 transition-transform duration-300 hover:scale-105"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Checkout
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
              Complete your order for <span className="font-semibold text-blue-600">{totalItems}</span> item{totalItems !== 1 ? 's' : ''}
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Checkout Form */}
            <div className="space-y-6 order-2 lg:order-1">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, isValid, dirty, values, errors, touched }) => (
                  
                  <Form className="space-y-6">
                    {/* Error Summary */}
                    <ErrorSummary 
                      errors={errors} 
                      touched={touched} 
                      isSubmitting={isSubmitting} 
                    />
                    {/* Contact Information */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          name="firstName"
                          type="text"
                          label="First Name"
                          placeholder="Enter your first name"
                        />
                        <FormField
                          name="lastName"
                          type="text"
                          label="Last Name"
                          placeholder="Enter your last name"
                        />
                        <FormField
                          name="email"
                          type="email"
                          label="Email"
                          placeholder="Enter your email address"
                        />
                        <div className="space-y-2">
                          <FormField
                            name="phone"
                            type="tel"
                            label="Phone"
                            placeholder="+92 300 1234567"
                          />
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Enter your phone number (e.g., +92 300 1234567)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                      </div>
                      <div className="space-y-6">
                        <FormField
                          name="address"
                          type="text"
                          label="Address"
                          placeholder="House/Flat No, Street Name, Area, Landmark"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Include house number, street name, area, and any nearby landmarks
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <FormField
                            name="city"
                            type="text"
                            label="City"
                            placeholder="e.g., Karachi, Lahore"
                          />
                          <FormField
                            name="state"
                            type="text"
                            label="State/Province"
                            placeholder="e.g., Sindh, Punjab"
                          />
                          <FormField
                            name="zipCode"
                            type="text"
                            label="ZIP Code"
                            placeholder="5400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
                      </div>
                      <div className="space-y-4">
                        {/* Cash on Delivery - Available */}
                        <div className={`relative flex items-center space-x-3 p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer ${paymentMethod === 'cash_on_delivery'
                          ? 'border-green-500 bg-green-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                          }`}
                          onClick={() => setPaymentMethod('cash_on_delivery')}
                        >
                          <input
                            type="radio"
                            id="cash_on_delivery"
                            name="paymentMethod"
                            value="cash_on_delivery"
                            checked={paymentMethod === 'cash_on_delivery'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <label htmlFor="cash_on_delivery" className="text-base font-semibold text-gray-900 cursor-pointer flex items-center">
                                <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                Cash on Delivery
                              </label>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                ✓ Available
                              </span>
                            </div>
                            <p className="text-gray-600">Pay with cash when your order is delivered at your doorstep.</p>
                          </div>
                        </div>

                        {/* Credit/Debit Cards - Coming Soon */}
                        <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 bg-gray-50 rounded-xl opacity-60 cursor-not-allowed">
                          <input
                            type="radio"
                            id="credit_card"
                            name="paymentMethod"
                            value="credit_card"
                            disabled
                            className="w-5 h-5 text-gray-400 border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <label htmlFor="credit_card" className="text-base font-semibold text-gray-500 cursor-not-allowed flex items-center">
                                <svg className="w-6 h-6 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Credit/Debit Cards
                              </label>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                ⏳ Coming Soon
                              </span>
                            </div>
                            <p className="text-gray-400">Online payment methods will be available soon.</p>
                          </div>
                        </div>

                        {/* Digital Wallets - Coming Soon */}
                        <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 bg-gray-50 rounded-xl opacity-60 cursor-not-allowed">
                          <input
                            type="radio"
                            id="digital_wallet"
                            name="paymentMethod"
                            value="digital_wallet"
                            disabled
                            className="w-5 h-5 text-gray-400 border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <label htmlFor="digital_wallet" className="text-base font-semibold text-gray-500 cursor-not-allowed flex items-center">
                                <svg className="w-6 h-6 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Digital Wallets
                              </label>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                ⏳ Coming Soon
                              </span>
                            </div>
                            <p className="text-gray-400">PayPal, Apple Pay, Google Pay and more.</p>
                          </div>
                        </div>

                        {/* Cash on Delivery Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <h3 className="text-sm font-medium text-blue-800 mb-1">Cash on Delivery</h3>
                              <p className="text-sm text-blue-700">
                                You can pay with cash when your order is delivered. Our delivery person will collect the payment at your doorstep.
                              </p>
                              <p className="text-xs text-blue-600 mt-2">
                                Please have the exact amount ready for a smooth delivery experience.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Notes */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Notes (Optional)</h2>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Special Instructions
                        </label>
                        <Field
                          as="textarea"
                          name="notes"
                          rows={4}
                          placeholder="Please provide detailed instructions for your order (minimum 10 words, maximum 250 words). Include any special delivery requirements, gift messages, or other important notes..."
                          className="outline-none w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                        <ErrorMessage name="notes" component="div" className="text-red-500 text-sm mt-1" />
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">
                            Let us know if you have any special delivery requirements or gift messages.
                          </p>
                          <div className="text-xs text-gray-500">
                            {values.notes ? (
                              <span className={countWords(values.notes) < 10 || countWords(values.notes) > 250 ? 'text-red-500' : 'text-green-600'}>
                                {countWords(values.notes)}/250 words
                              </span>
                            ) : (
                              <span>0/250 words</span>
                            )}
                          </div>
                        </div>
                        {values.notes && (countWords(values.notes) < 10 || countWords(values.notes) > 250) && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <div className="flex items-center text-yellow-800">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="font-medium">
                                {countWords(values.notes) < 10
                                  ? `Please add at least ${10 - countWords(values.notes)} more words`
                                  : `Please remove ${countWords(values.notes) - 250} words to meet the maximum limit`
                                }
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Validation Message */}
                    {cartItems.some(item => !item.selectedSize || !item.selectedColor) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Complete Product Selection</p>
                            <p className="text-xs text-yellow-600">
                              Please select size and color for all products in your cart before placing the order.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Place Order Button */}
                    <SubmitButton
                      isSubmitting={isSubmitting}
                      isProcessing={isProcessing}
                      isValid={isValid}
                      dirty={dirty}
                      errors={errors}
                      touched={touched}
                      cartItems={cartItems}
                    />
                  </Form>
                )}
              </Formik>
            </div>

            {/* Order Summary */}
            <div className="space-y-4 order-1 lg:order-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Summary
                </h2>

                {/* Cart Items - Enhanced Display */}
                <div className="space-y-4 mb-4">
                  {(() => {
                    // Group items by product ID
                    const groupedItems = cartItems.reduce((groups, item) => {
                      const productId = item.product._id;
                      if (!groups[productId]) {
                        groups[productId] = [];
                      }
                      groups[productId].push(item);
                      return groups;
                    }, {});

                    return Object.values(groupedItems).map((productItems, groupIndex) => (
                      <div key={groupIndex} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                        {/* Product Header with Larger Image */}
                        <div className="flex items-start space-x-4 mb-4">
                          {productItems[0].product.image ? (
                            <div
                              className="relative group cursor-pointer"
                              onClick={() => {
                                setPreviewImage(productItems[0].product.image);
                                setShowImageModal(true);
                              }}
                            >
                              <img
                                src={productItems[0].product.image}
                                alt={productItems[0].product.name}
                                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:border-blue-400 group-hover:z-10"
                              />
                              {/* Simple hover tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
                                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                  Click to view larger
                                </div>
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                              <span className="text-xs text-gray-500 font-medium">No Image</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">{productItems[0].product.name}</h3>
                            <p className="text-base text-gray-600 mb-2 font-alumni-lg">Rs {formatPrice(productItems[0].product.price)} each</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                {productItems[0].product.category?.name || 'General'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Variants with Quantity Controls */}
                        <div className="space-y-3">
                          {productItems.map((item, itemIndex) => (
                            <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-4 mb-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Size:</span>
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                                        {item.selectedSize || 'Pending'}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Color:</span>
                                      <span className="px-2 py-1 bg-transparent text-green-800 rounded-md text-sm font-medium">
                                        {item.selectedColor ? (
                                          <div
                                            className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                            style={{
                                              backgroundColor: typeof item.selectedColor === 'string'
                                                ? item.selectedColor
                                                : item.selectedColor?.hex || item.selectedColor?.code || item.selectedColor?.name || '#ccc'
                                            }}
                                            title={typeof item.selectedColor === 'string' ? item.selectedColor : item.selectedColor?.name}
                                          />
                                        ) : (
                                          <span className="text-gray-400">Pending</span>
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Quantity Controls */}
                                  <div className="flex items-center space-x-3">
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Quantity:</span>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => {
                                          if (item.quantity > 1) {
                                            dispatch(updateQuantity({ itemId: item.id, quantity: item.quantity - 1 }));
                                          }
                                        }}
                                        disabled={item.quantity <= 1}
                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                      >
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                      </button>
                                      <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                                      <button
                                        onClick={() => {
                                          dispatch(updateQuantity({ itemId: item.id, quantity: item.quantity + 1 }));
                                        }}
                                        className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Warning for missing size/color */}
                                  {(!item.selectedSize || !item.selectedColor) && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                      <div className="flex items-center text-red-800">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="font-medium text-sm">Size/Color not selected</span>
                                      </div>
                                      <button
                                        onClick={() => router.push(`/product?id=${item.product._id}`)}
                                        className="mt-1 text-red-600 hover:text-blue-800 underline text-sm font-medium"
                                      >
                                        Click to select size & color
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Price Display */}
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">
                                    Rs {formatPrice(item.product.price * item.quantity)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Rs {formatPrice(item.product.price)} × {item.quantity}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Product Total */}
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-700">Subtotal for this product:</span>
                            <span className="text-lg font-bold text-gray-900">
                              <span className="font-alumni-xl">Rs {formatPrice(productItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Coupon Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Have a coupon?</h3>

                  {/* Coupon Input */}
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="outline-none flex-1 text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && validateAndApplyCoupon()}
                    />
                    <button
                      onClick={validateAndApplyCoupon}
                      className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Coupon Status Messages */}
                  {couponStatus && (
                    <div className="mb-3">
                      {couponStatus === 'applied' && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-green-800">Coupon applied successfully!</p>
                              <p className="text-xs text-green-600">{couponDetails?.heading} - {couponDetails?.description}</p>
                              <p className="text-xs text-green-600">{couponDetails?.discountPercentage}% off</p>
                            </div>
                          </div>
                          <button
                            onClick={removeCoupon}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      {couponStatus === 'invalid' && (
                        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-red-800">Invalid coupon code</p>
                            <p className="text-xs text-red-600">
                              {couponDetails ?
                                `Coupon "${couponDetails.code}" is not active or not yet valid` :
                                'Please check the coupon code and try again'
                              }
                            </p>
                          </div>
                        </div>
                      )}

                      {couponStatus === 'expired' && (
                        <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-800">Coupon has expired</p>
                            <p className="text-xs text-gray-600">
                              {couponDetails?.title} - Expired on: {couponDetails?.validUntil ? new Date(couponDetails.validUntil).toLocaleDateString() : 'Unknown'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>Rs {formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>Rs {formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax</span>
                    <span>Rs {formatPrice(tax)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({couponDetails?.code})</span>
                      <span>-Rs {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span>Rs {formatPrice(total)}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              {orderResult.isSuccess ? (
                <>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Order Placed Successfully!</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">{orderResult.message}</p>
                  {orderResult.orderNumber && (
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">Order Number: {orderResult.orderNumber}</p>

                      {/* Order Status Info Section */}
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Track Your Order</h4>
                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                          Visit our Order Status page and enter your order number to check the status anytime.
                        </p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <input
                            type="text"
                            value={orderResult.orderNumber}
                            readOnly
                            className="flex-1 text-xs bg-white border border-gray-300 rounded px-2 py-2 sm:py-1 font-mono text-gray-700 break-all"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(orderResult.orderNumber);
                              // Show a brief success message
                              const button = event.target;
                              const originalText = button.textContent;
                              button.textContent = 'Copied!';
                              button.className = 'px-3 py-2 sm:px-2 sm:py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors whitespace-nowrap';
                              setTimeout(() => {
                                button.textContent = originalText;
                                button.className = 'px-3 py-2 sm:px-2 sm:py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors whitespace-nowrap';
                              }, 2000);
                            }}
                            className="px-3 py-2 sm:px-2 sm:py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors whitespace-nowrap"
                          >
                            Copy Order #
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Save this order number to check your order status later.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Order Failed</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">{orderResult.message}</p>
                </>
              )}

              <div className="flex flex-col space-y-2 sm:space-y-3">
                {orderResult.isSuccess && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => {
                        window.open('/order-status', '_blank');
                      }}
                      className="flex-1 bg-green-600 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="truncate">View Order Status</span>
                    </button>
                    <button
                      onClick={handleContinueShopping}
                      className="flex-1 bg-blue-600 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                      Continue Shopping
                    </button>
                  </div>
                )}
                <button
                  onClick={handleCloseOrderModal}
                  className="w-full bg-gray-600 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            setShowImageModal(false);
            setPreviewImage(null);
          }}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowImageModal(false);
                setPreviewImage(null);
              }}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 animate-fadeInRight"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image container */}
            <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl animate-slideUp">
              <img
                src={previewImage}
                alt="Product preview"
                className="w-full h-auto max-h-[80vh] object-contain transition-all duration-500 hover:scale-105"
              />

              {/* Image info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 animate-fadeInUp">
                <p className="text-white text-sm font-medium">
                  Click outside or press ESC to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CheckoutPage;


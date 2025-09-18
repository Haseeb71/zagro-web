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
// import OrderConfirmationModal from '../components/OrderConfirmationModal';

const formatPrice = (price) => {
  if (!price) return price;
  
  return price.toLocaleString();
};

// Comprehensive color mapping system (same as ProductCard)
const getColorHex = (colorName) => {
  if (!colorName) return '#6B7280'; // Default gray
  
  const color = colorName.toLowerCase().trim();
  
  // If it's already a hex code, return it as is
  if (color.startsWith('#')) {
    return color;
  }
  
  // Comprehensive color mapping
  const colorMap = {
    // Basic Colors
    'red': '#EF4444',
    'blue': '#3B82F6',
    'green': '#10B981',
    'yellow': '#F59E0B',
    'orange': '#F97316',
    'purple': '#8B5CF6',
    'pink': '#EC4899',
    'brown': '#A16207',
    'black': '#1F2937',
    'white': '#F9FAFB',
    'gray': '#6B7280',
    'grey': '#6B7280',
    
    // Extended Colors
    'navy': '#1E3A8A',
    'maroon': '#991B1B',
    'olive': '#365314',
    'lime': '#65A30D',
    'cyan': '#06B6D4',
    'magenta': '#D946EF',
    'violet': '#7C3AED',
    'indigo': '#4F46E5',
    'teal': '#0D9488',
    'emerald': '#059669',
    'amber': '#D97706',
    'rose': '#F43F5E',
    'sky': '#0EA5E9',
    'slate': '#475569',
    'zinc': '#71717A',
    'neutral': '#737373',
    'stone': '#78716C',
    
    // Common Shoe Colors
    'beige': '#F5F5DC',
    'tan': '#D2B48C',
    'khaki': '#F0E68C',
    'cream': '#FFFDD0',
    'ivory': '#FFFFF0',
    'off-white': '#FAFAFA',
    'charcoal': '#36454F',
    'midnight': '#191970',
    'royal': '#4169E1',
    'forest': '#228B22',
    'crimson': '#DC143C',
    'burgundy': '#800020',
    'wine': '#722F37',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
    'bronze': '#CD7F32',
    'copper': '#B87333',
    
    // Multi-word colors
    'dark blue': '#1E40AF',
    'light blue': '#93C5FD',
    'dark green': '#166534',
    'light green': '#86EFAC',
    'dark red': '#991B1B',
    'light red': '#FCA5A5',
    'dark gray': '#374151',
    'light gray': '#D1D5DB',
    'dark grey': '#374151',
    'light grey': '#D1D5DB',
    'royal blue': '#1D4ED8',
    'navy blue': '#1E3A8A',
    'sky blue': '#0EA5E9',
    'forest green': '#166534',
    'lime green': '#65A30D',
    'bright red': '#DC2626',
    'deep red': '#991B1B',
    'bright blue': '#2563EB',
    'deep blue': '#1E40AF',
    'bright green': '#16A34A',
    'deep green': '#166534',
    
    // Special cases and codes
    'multi': '#8B5CF6', // Multi-color
    'multicolor': '#8B5CF6',
    'multicoloured': '#8B5CF6',
    'multicolored': '#8B5CF6',
    'rainbow': '#8B5CF6',
    'clear': '#F9FAFB',
    'transparent': '#F9FAFB',
    'metallic': '#C0C0C0',
    'shiny': '#C0C0C0',
    'matte': '#6B7280',
    'glossy': '#1F2937',
    
    // Common variations
    'reddish': '#EF4444',
    'bluish': '#3B82F6',
    'greenish': '#10B981',
    'yellowish': '#F59E0B',
    'purplish': '#8B5CF6',
    'pinkish': '#EC4899',
    'brownish': '#A16207',
    'blackish': '#1F2937',
    'whitish': '#F9FAFB',
    'grayish': '#6B7280',
    'greyish': '#6B7280'
  };

  // Direct match
  if (colorMap[color]) {
    return colorMap[color];
  }

  // Partial match for compound colors
  for (const [key, value] of Object.entries(colorMap)) {
    if (color.includes(key) || key.includes(color)) {
      return value;
    }
  }

  // Generate a consistent color from the string if no match
  let hash = 0;
  for (let i = 0; i < color.length; i++) {
    hash = color.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to a color
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
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
    .matches(/^[\+]?[0-9\s\-\(\)]+$/, 'Phone number can only contain digits, spaces, hyphens, parentheses, and + sign'),
  company: Yup.string()
    .max(100, 'Company name must be less than 100 characters'),
  address: Yup.string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters')
    .matches(/^[a-zA-Z0-9\s\-#.,/]+$/, 'Address contains invalid characters')
    .required('Address is required'),
  apartment: Yup.string()
    .max(100, 'Apartment info must be less than 100 characters'),
  city: Yup.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces')
    .required('City is required'),
  zipCode: Yup.string()
    .matches(/^\d{4,6}$/, 'Postal code must be 4-6 digits'),
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
    company: '',
    address: '',
    apartment: '',
    city: '',
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
  const tax = 0; // No tax
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
      if (!customerResponseData) {
        console.error('No response data received from customer API');
        throw new Error('Failed to create customer - no response data');
      }

      // Handle different possible response structures
      let customerId;
      if (customerResponseData.customer && customerResponseData.customer._id) {
        // Expected structure: { customer: { _id: "..." } }
        customerId = customerResponseData.customer._id;
      } else if (customerResponseData._id) {
        // Alternative structure: { _id: "...", ... }
        customerId = customerResponseData._id;
      } else if (customerResponseData.id) {
        // Another alternative: { id: "...", ... }
        customerId = customerResponseData.id;
      } else {
        console.error('Invalid response structure:', customerResponseData);
        throw new Error('Failed to create customer - invalid response structure. Expected customer with _id, id, or direct _id field');
      }

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
        taxAmount: 0,
        totalAmount: total,
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        shippingAddress: {
          street: values.address,
          city: values.city,
          zipCode: values.zipCode,
          country: 'Pakistan'
        },
        billingAddress: {
          street: values.address,
          city: values.city,
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

      <div className="min-h-screen bg-white py-12 pt-28">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Checkout Form */}
            <div className="space-y-8 order-2 lg:order-1 lg:col-span-2">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, isValid, dirty, values, errors, touched }) => (
                  
                  <Form className="space-y-8">
                    {/* Error Summary */}
                    <ErrorSummary 
                      errors={errors} 
                      touched={touched} 
                      isSubmitting={isSubmitting} 
                    />
                    
                    {/* Contact */}
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact</h2>
                      <div className="space-y-4">
                        <FormField
                          name="email"
                          type="email"
                          label="Email"
                          placeholder="Email"
                        />
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="newsletter"
                            className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
                          />
                          <label htmlFor="newsletter" className="ml-2 text-sm text-slate-700">
                            Email me with news and offers
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Delivery */}
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 mb-4">Delivery</h2>
                      <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          name="firstName"
                          type="text"
                            label="First name"
                          placeholder="First name"
                        />
                        <FormField
                          name="lastName"
                          type="text"
                            label="Last name"
                          placeholder="Last name"
                        />
                        </div>
                        <FormField
                          name="company"
                          type="text"
                          label="Company (optional)"
                          placeholder="Company (optional)"
                        />
                        <FormField
                          name="address"
                          type="text"
                          label="Address"
                          placeholder="Address"
                        />
                        <FormField
                          name="apartment"
                          type="text"
                          label="Apartment, suite, etc. (optional)"
                          placeholder="Apartment, suite, etc. (optional)"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            name="city"
                            type="text"
                            label="City"
                            placeholder="City"
                          />
                          <FormField
                            name="zipCode"
                            type="text"
                            label="Postal code (optional)"
                            placeholder="Postal code (optional)"
                          />
                        </div>
                        <FormField
                          name="phone"
                          type="tel"
                          label="Phone"
                          placeholder="Phone"
                        />
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="saveInfo"
                            className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
                          />
                          <label htmlFor="saveInfo" className="ml-2 text-sm text-slate-700">
                            Save this information for next time
                              </label>
                            </div>
                          </div>
                        </div>

                    {/* Shipping method */}
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 mb-4">Shipping method</h2>
                      <div className="space-y-3">
                        <div className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'cash_on_delivery'
                          ? 'border-slate-300 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => setPaymentMethod('cash_on_delivery')}
                        >
                          <div className="flex items-center">
                          <input
                            type="radio"
                              name="shippingMethod"
                              value="cash_on_delivery"
                              checked={paymentMethod === 'cash_on_delivery'}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500"
                            />
                            <span className="ml-3 text-sm font-medium text-slate-900">Cash On Delivery</span>
                            </div>
                          <span className="text-sm font-medium text-slate-600">Rs 250.00</span>
                          </div>
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
                    <div className="flex flex-col sm:flex-row gap-3 mb-8">
                      <button
                        type="submit"
                        disabled={isSubmitting || isProcessing || !isValid || !dirty || cartItems.some(item => !item.selectedSize || !item.selectedColor)}
                        className={`relative flex-1 py-3 px-4 sm:px-8 text-white text-sm sm:text-base font-semibold rounded-full shadow-md overflow-hidden transition-colors duration-500
                          ${!isSubmitting && !isProcessing && isValid && dirty && !cartItems.some(item => !item.selectedSize || !item.selectedColor)
                            ? 'cursor-pointer'
                            : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        style={{
                          background: !isSubmitting && !isProcessing && isValid && dirty && !cartItems.some(item => !item.selectedSize || !item.selectedColor)
                            ? 'linear-gradient(to right, #000 0%, #fff 100%)'
                            : undefined,
                          color: !isSubmitting && !isProcessing && isValid && dirty && !cartItems.some(item => !item.selectedSize || !item.selectedColor) ? '#fff' : undefined,
                          position: 'relative',
                        }}
                      >
                        {!isSubmitting && !isProcessing && isValid && dirty && !cartItems.some(item => !item.selectedSize || !item.selectedColor) && (
                          <span
                            className="absolute inset-0 z-0 transition-all duration-700 ease-in-out"
                            style={{
                              background: 'linear-gradient(to left, #000 0%, #fff 100%)',
                              width: '0%',
                              left: '100%',
                              top: 0,
                              bottom: 0,
                              transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
                              borderRadius: '9999px',
                              pointerEvents: 'none',
                            }}
                            aria-hidden="true"
                            id="liquid-gradient-place-order"
                          />
                        )}
                        <span className="relative z-10 transition-colors duration-500">
                          {isSubmitting || isProcessing ? 'Processing...' : 
                           !isValid || !dirty ? 'Fill in all required fields' :
                           cartItems.some(item => !item.selectedSize || !item.selectedColor) ? 'Complete product selection' :
                           'Place Order'}
                        </span>
                      </button>
                      <style jsx>{`
                        button[style] {
                          position: relative;
                          overflow: hidden;
                        }
                        button[style]:hover #liquid-gradient-place-order {
                          width: 100%;
                          left: 0;
                        }
                      `}</style>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>

            {/* Order Summary */}
            <div className="space-y-6 order-1 lg:order-2 lg:col-span-1">
              <div className="bg-white sticky top-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Order Summary</h2>

                {/* Cart Items - Compact Display */}
                <div className="space-y-3 mb-6">
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
                      <div key={groupIndex} className="flex items-center space-x-3 py-3">
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
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            {/* Quantity badge */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                              {productItems.reduce((sum, item) => sum + item.quantity, 0)}
                              </div>
                            </div>
                          ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-slate-500 font-medium">No Image</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 text-sm mb-1 line-clamp-2">{productItems[0].product.name}</h3>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-slate-500">{productItems[0].selectedSize || 'Size'}</span>
                            <span className="text-xs text-slate-500">/</span>
                            {productItems[0].selectedColor ? (
                              <div className="flex items-center space-x-1">
                                <div
                                  className="w-3 h-3 rounded-full border border-slate-300 shadow-sm"
                                  style={{
                                    backgroundColor: getColorHex(productItems[0].selectedColor)
                                  }}
                                  title={productItems[0].selectedColor}
                                />
                                <span className="text-xs text-slate-500">
                                  {productItems[0].selectedColor}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">Color</span>
                            )}
                                </div>
                        </div>
                                <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">Rs {formatPrice(productItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))}</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Discount Code Section */}
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-medium text-slate-900 mb-3">Discount code</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="outline-none flex-1 text-slate-900 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && validateAndApplyCoupon()}
                    />
                    <button
                      onClick={validateAndApplyCoupon}
                      className="cursor-pointer px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Coupon Status Messages */}
                  {couponStatus && (
                    <div className="mb-4">
                      {couponStatus === 'applied' && (
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
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
                        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
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
                        <div className="flex items-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
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
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>Rs {formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({couponDetails?.code})</span>
                      <span>-Rs {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold text-slate-900 border-t border-slate-200 pt-3">
                    <span>Total</span>
                    <span>PKR Rs {formatPrice(total)}</span>
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

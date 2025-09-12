import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import orderAPI from '../APIs/order/order';

// Helper function to format prices
const formatPrice = (price) => {
  if (!price || price < 1000) return price;
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (price >= 1000) {
    return (price / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return price;
};

// Helper function to get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${imagePath.replace(/\\/g, '/')}`;
};

const OrderStatusPage = () => {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const response = await orderAPI.orderStatus(orderNumber.trim());
      console.log('API Response:', response); // Debug log
      
      // Handle the response structure based on your API
      if (response && response.checkout) {
        setOrderData(response);
      } else if (response && response.data && response.data.checkout) {
        setOrderData(response.data);
      } else {
        setError(response?.message || 'Order not found');
      }
    } catch (err) {
      setError('Failed to fetch order status. Please try again.');
      console.error('Order status error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Order Received';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  // Get progress steps based on order status
  const getProgressSteps = (status) => {
    const steps = [
      { id: 'received', label: 'Order Received', completed: true },
      { id: 'processing', label: 'Processing', completed: false },
      { id: 'shipped', label: 'Shipped', completed: false },
      { id: 'delivered', label: 'Delivered', completed: false }
    ];

    switch (status?.toLowerCase()) {
      case 'pending':
        return steps.map(step => ({ ...step, completed: step.id === 'received' }));
      case 'processing':
        return steps.map(step => ({ ...step, completed: ['received', 'processing'].includes(step.id) }));
      case 'shipped':
        return steps.map(step => ({ ...step, completed: ['received', 'processing', 'shipped'].includes(step.id) }));
      case 'delivered':
        return steps.map(step => ({ ...step, completed: true }));
      case 'cancelled':
        return steps.map(step => ({ ...step, completed: step.id === 'received', cancelled: true }));
      default:
        return steps.map(step => ({ ...step, completed: step.id === 'received' }));
    }
  };

  // Get progress percentage
  const getProgressPercentage = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 25;
      case 'processing':
        return 50;
      case 'shipped':
        return 75;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 25;
      default:
        return 25;
    }
  };

  return (
    <Layout>
      <Head>
        <title>Order Status - Zagro Footwear</title>
        <meta name="description" content="Check your order status at Zagro Footwear" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-8 px-4">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Order Status
            </h1>
            <p className="text-gray-600">
              Enter your order number to check the status
            </p>
          </div>

          {/* Order Input Form */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-lg border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="orderNumber" className="block text-gray-700 font-medium mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your order number (e.g., ORD-1757412527664-496)"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200 transition-all duration-300"
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={!orderNumber.trim() || isLoading}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking Order Status...
                  </>
                ) : (
                  'Check Order Status'
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-700 text-center text-sm">{error}</p>
            </div>
          )}

          {/* Order Details */}
          {orderData && (
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              {/* Order Status Progress */}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Order Status: {getStatusText(orderData.checkout.orderStatus)}
                  </h2>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(orderData.checkout.orderStatus)}`}>
                    {orderData.checkout.orderStatus?.toLowerCase() === 'delivered' && (
                      <span className="mr-1">✓</span>
                    )}
                    {orderData.checkout.orderStatus?.toLowerCase() === 'cancelled' && (
                      <span className="mr-1">✗</span>
                    )}
                    {getStatusText(orderData.checkout.orderStatus)}
                  </div>
                  
                  {/* Status Message */}
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    {orderData.checkout.orderStatus?.toLowerCase() === 'delivered' ? (
                      <div className="text-green-700 font-medium">
                        🎉 Congratulations! Your order has been delivered successfully.
                      </div>
                    ) : orderData.checkout.orderStatus?.toLowerCase() === 'cancelled' ? (
                      <div className="text-red-700 font-medium">
                        ❌ Your order has been cancelled.
                      </div>
                    ) : orderData.checkout.orderStatus?.toLowerCase() === 'shipped' ? (
                      <div className="text-blue-700 font-medium">
                        📦 Your order is on its way! Track your package for delivery updates.
                      </div>
                    ) : orderData.checkout.orderStatus?.toLowerCase() === 'processing' ? (
                      <div className="text-yellow-700 font-medium">
                        ⚙️ Your order is being processed. We'll update you soon!
                      </div>
                    ) : (
                      <div className="text-yellow-700 font-medium">
                        📋 Your order has been received and is being prepared.
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {getProgressSteps(orderData.checkout.orderStatus).map((step, index) => (
                      <div key={step.id} className="flex flex-col items-center relative flex-1">
                        {/* Step Circle */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 relative z-10 ${
                          step.completed 
                            ? step.cancelled 
                              ? 'bg-red-500 border-red-500' 
                              : 'bg-green-500 border-green-500'
                            : 'bg-gray-500 border-gray-500'
                        }`}>
                          {step.completed ? (
                            step.cancelled ? '✗' : '✓'
                          ) : (
                            index + 1
                          )}
                        </div>
                        
                        {/* Step Label */}
                        <div className="mt-1 text-center">
                          <div className={`text-xs font-medium ${
                            step.completed ? 'text-gray-800' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </div>
                        </div>

                        {/* Connecting Line */}
                        {index < getProgressSteps(orderData.checkout.orderStatus).length - 1 && (
                          <div className="absolute top-4 left-1/2 w-full h-0.5 transform -translate-y-1/2 z-0">
                            <div className={`h-full ${
                              step.completed && !step.cancelled ? 'bg-green-500' : 'bg-gray-300'
                            }`} style={{ width: 'calc(100% - 1rem)', marginLeft: '1rem' }}></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="bg-gray-300 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${
                        orderData.checkout.orderStatus?.toLowerCase() === 'delivered' 
                          ? 'bg-gradient-to-r from-green-400 to-green-600' 
                          : orderData.checkout.orderStatus?.toLowerCase() === 'cancelled'
                          ? 'bg-gradient-to-r from-red-400 to-red-600'
                          : 'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{ width: `${getProgressPercentage(orderData.checkout.orderStatus)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-600">
                    <span>0%</span>
                    <span className="font-medium">{getProgressPercentage(orderData.checkout.orderStatus)}% Complete</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Order Information</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Order Details</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Order Number:</span>
                        <span className="font-mono text-gray-900">{orderData.checkout.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Order Date:</span>
                        <span className="text-gray-900">{new Date(orderData.checkout.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="capitalize text-gray-900">{orderData.checkout.paymentMethod.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                          orderData.checkout.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {orderData.checkout.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Customer Information</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="text-gray-900">{orderData.checkout.customer.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="text-gray-900">{orderData.checkout.customer.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span className="text-gray-900">{orderData.checkout.customer.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address & Products */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Shipping Address</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="text-gray-900">{orderData.checkout.shippingAddress.street}</div>
                      <div className="text-gray-900">{orderData.checkout.shippingAddress.city}, {orderData.checkout.shippingAddress.state}</div>
                      <div className="text-gray-900">{orderData.checkout.shippingAddress.zipCode}, {orderData.checkout.shippingAddress.country}</div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-3">Order Items</h3>
                  
                  <div className="space-y-3">
                    {orderData.checkout.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center space-x-3">
                          {item.product.images && item.product.images.length > 0 && (
                            <img
                              src={getImageUrl(item.product.images[0])}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="text-gray-800 font-medium text-sm">{item.productName}</h4>
                            <div className="text-gray-600 text-xs space-y-1">
                              <div>Size: {item.size} | Color: {item.color}</div>
                              <div>Quantity: {item.quantity}</div>
                              <div className="font-semibold text-gray-900">Rs {formatPrice(item.totalPrice)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Total */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Order Total</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-gray-900">Rs {formatPrice(orderData.checkout.subtotal)}</span>
                  </div>
                  {orderData.checkout.discountAmount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Discount ({orderData.checkout.couponCode}):</span>
                      <span>-Rs {formatPrice(orderData.checkout.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="text-gray-900">Rs {formatPrice(orderData.checkout.shippingAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="text-gray-900">Rs {formatPrice(orderData.checkout.taxAmount)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total:</span>
                      <span>Rs {formatPrice(orderData.checkout.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setOrderData(null);
                    setOrderNumber('');
                    setError(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-300"
                >
                  Check Another Order
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderStatusPage;

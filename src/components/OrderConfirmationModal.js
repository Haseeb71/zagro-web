import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const OrderConfirmationModal = ({
  isOpen,
  onClose,
  isSuccess = true,
  orderNumber = null,
  message = "",
  onContinueShopping = () => {}
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to ensure DOM is ready for animation
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md transition-all duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={handleOverlayClick}
    >
      {/* Modal Container */}
      <div className={`relative bg-white rounded-lg border border-gray-200 shadow-2xl w-full max-w-md mx-auto overflow-hidden transition-all duration-300 transform ${
        isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center z-10 transition-colors duration-200"
        >
          <XMarkIcon className="w-4 h-4 text-gray-600" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 text-center">
          {/* Animated Icon */}
          <div className={`mb-6 transition-all duration-500 ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}>
            {isSuccess ? (
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-12 h-12 text-green-600" />
                </div>
                {/* Success animation ring */}
                <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-green-200 rounded-full animate-ping"></div>
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-bold mb-4 transition-all duration-500 delay-200 ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
            {isSuccess ? 'Order Placed Successfully!' : 'Order Failed'}
          </h2>

          {/* Order Number */}
          {isSuccess && orderNumber && (
            <div className={`mb-4 transition-all duration-500 delay-300 ${
              isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-lg font-semibold text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border">
                #{orderNumber}
              </p>
            </div>
          )}

          {/* Message */}
          <p className={`text-gray-700 mb-6 leading-relaxed transition-all duration-500 delay-400 ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {message || (isSuccess 
              ? 'Thank you for your purchase! We\'ll send you a confirmation email shortly and your order will be processed within 1-2 business days.'
              : 'We encountered an issue while processing your order. Please try again or contact our support team if the problem persists.'
            )}
          </p>

          {/* Buttons */}
          <div className={`space-y-3 transition-all duration-500 delay-500 ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {isSuccess ? (
              <>
                <button
                  onClick={onContinueShopping}
                  className="w-full py-3 px-6 rounded-lg bg-black text-white border-2 border-black hover:bg-gray-800 font-medium transition-colors duration-200"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 rounded-lg bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200 font-medium transition-colors duration-200"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 rounded-lg bg-red-600 text-white border-2 border-red-600 hover:bg-red-700 font-medium transition-colors duration-200"
                >
                  Try Again
                </button>
                <button
                  onClick={onContinueShopping}
                  className="w-full py-3 px-6 rounded-lg bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200 font-medium transition-colors duration-200"
                >
                  Continue Shopping
                </button>
              </>
            )}
          </div>

          {/* Additional Info for Success */}
          {isSuccess && (
            <div className={`mt-6 pt-4 border-t border-gray-200 transition-all duration-500 delay-600 ${
              isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <p className="text-xs text-gray-500">
                You'll receive an email confirmation at your registered email address.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;

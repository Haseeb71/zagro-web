import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { updateQuantity, removeFromCart, closeCart, clearAutoCloseTimer } from '@/redux/slices/cartSlice';

const CartSlider = ({ isOpen, onClose }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoCloseTimeoutRef = useRef(null);
  
  // Get cart data from Redux
  const { items: cartItems, totalItems, totalPrice, autoCloseTimer } = useAppSelector(state => state.cart);
  
  // Handle migration of old cart items with object selectedColor
  const cleanCartItems = cartItems.map(item => ({
    ...item,
    selectedColor: typeof item.selectedColor === 'string' 
      ? item.selectedColor 
      : item.selectedColor?.name || 'Pending'
  }));

  // Clear cart if there are any problematic items
  const clearCartIfNeeded = () => {
    const hasObjectColors = cartItems.some(item => 
      item.selectedColor && typeof item.selectedColor === 'object'
    );
    
    if (hasObjectColors) {
      localStorage.removeItem('cart');
      window.location.reload();
    }
  };

  // Check for problematic items on mount
  useEffect(() => {
    clearCartIfNeeded();
  }, []);
  
  // Debug logging
  console.log('CartSlider props:', { isOpen, cartItems: cartItems.length, onClose: !!onClose });
  
  // Close cart when escape key is pressed
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Delay visibility for smooth animation
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Auto-close cart after 5 seconds when a product is added
  useEffect(() => {
    if (autoCloseTimer && isOpen) {
      const timeRemaining = autoCloseTimer - Date.now();
      
      if (timeRemaining > 0) {
        // Clear any existing timeout
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current);
        }
        
        // Set new timeout
        autoCloseTimeoutRef.current = setTimeout(() => {
          dispatch(closeCart());
          dispatch(clearAutoCloseTimer());
        }, timeRemaining);
      }
    }

    // Cleanup timeout on unmount or when autoCloseTimer changes
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, [autoCloseTimer, isOpen, dispatch]);

  // Clear auto-close timer when user interacts with cart
  const handleUserInteraction = () => {
    if (autoCloseTimer) {
      dispatch(clearAutoCloseTimer());
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    }
  };

  const handleCheckout = () => {
    setIsAnimating(true);
    setTimeout(() => {
      dispatch(closeCart());
      router.push('/checkout');
    }, 300);
    
    // Failsafe: Reset animation state after 2 seconds
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  // Reset animation state when cart is closed or opened
  useEffect(() => {
    if (!isOpen) {
      setIsAnimating(false);
    } else {
      // Reset animation state when cart is opened
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    dispatch(updateQuantity({ itemId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  console.log('CartSlider render check:', { isOpen, isVisible });
  
  // Add a simple test indicator
  if (isOpen) {
    console.log('CartSlider should be visible now');
  }
  
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with fade animation */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-[4px] transition-opacity duration-300 ease-in-out z-40 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
        style={{ zIndex: 9998 }}
      />
      
      {/* Cart Slider with slide and fade animations */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-all duration-300 ease-in-out flex flex-col ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{ zIndex: 9999 }}
        onMouseEnter={handleUserInteraction}
        onTouchStart={handleUserInteraction}
      >
        {/* Header with gradient background - Fixed height */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <p className="text-blue-100 text-sm mt-1">
                {totalItems} item{totalItems !== 1 ? 's' : ''} in cart
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cart Items Container - Scrollable with proper height */}
        <div className="flex-1 overflow-hidden min-h-0">
          {cleanCartItems.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 text-sm">Add some amazing products to get started</p>
                <button
                  onClick={onClose}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-4">
                {(() => {
                  // Group items by product name for better organization
                  const groupedItems = cleanCartItems.reduce((groups, item) => {
                    const productName = item.product.name;
                    if (!groups[productName]) {
                      groups[productName] = [];
                    }
                    groups[productName].push(item);
                    return groups;
                  }, {});

                  return Object.values(groupedItems).map((productItems, groupIndex) => (
                    <div key={groupIndex} className="space-y-2">
                      {productItems.map((item, itemIndex) => (
                        <div 
                          key={item.id} 
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                          style={{
                            animationDelay: `${(groupIndex * 100) + (itemIndex * 50)}ms`,
                            animation: 'fadeInUp 0.5s ease-out forwards'
                          }}
                          onMouseEnter={handleUserInteraction}
                          onTouchStart={handleUserInteraction}
                        >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">No Image</span>
                          </div>
                        )}
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          ${item.product.price}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">
                          {item.product.name}
                          {productItems.length > 1 && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {productItems.length} variants
                            </span>
                          )}
                        </h3>
                        
                        {/* Show replacement indicator */}
                        {item.replaced && (
                          <div className="mb-2 p-1 bg-green-50 border border-green-200 rounded text-xs">
                            <div className="flex items-center text-green-700">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="font-medium">Updated with size & color</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Show size and color status */}
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            Size: {item.selectedSize || 'Pending'}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            Color: {item.selectedColor ? (typeof item.selectedColor === 'string' ? item.selectedColor : item.selectedColor?.name) : 'Pending'}
                          </span>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                handleUserInteraction();
                                handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1));
                              }}
                              className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="text-sm font-medium text-gray-900 w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => {
                                handleUserInteraction();
                                handleUpdateQuantity(item.id, item.quantity + 1);
                              }}
                              className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              handleUserInteraction();
                              handleRemoveItem(item.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        </div>
                      </div>
                    </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Footer with sticky positioning - Fixed height */}
        {cleanCartItems.length > 0 && (
          <div className="border-t border-gray-200 bg-white p-6 flex-shrink-0">
            {/* Price Summary */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium text-gray-900">${(totalPrice * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${(totalPrice * 1.08).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Checkout Button */}
            <button
              onClick={() => {
                handleUserInteraction();
                handleCheckout();
              }}
              disabled={isAnimating}
              className={`cursor-pointer w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                isAnimating ? 'animate-pulse' : ''
              }`}
            >
              {isAnimating ? 'Processing...' : 'Proceed to Checkout'}
            </button>
            
            {/* Continue Shopping */}
            <button
              onClick={() => {
                handleUserInteraction();
                onClose();
              }}
              className="cursor-pointer w-full mt-3 text-gray-600 hover:text-blue-800 transition-colors text-sm font-medium"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS for animations and scrollbar */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Firefox scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }
      `}</style>
    </>
  );
};

export default CartSlider;

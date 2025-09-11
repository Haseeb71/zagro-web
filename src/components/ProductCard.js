import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import RatingStars from './RatingStars';
import { useAppDispatch } from '../redux/hooks';
import { addToCart, openCart } from '../redux/slices/cartSlice';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

const ProductCard = ({ 
  product, 
  variant = 'default', // 'default', 'compact', 'minimal'
  onAddToCart, 
  onWishlist, 
  className = '',
  imageChangeInterval = 3000 // 3 seconds default
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const intervalRef = useRef(null);

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${imagePath.replace(/\\/g, '/')}`;
  };

  // Helper function to parse colorQuantities JSON string
  const getColorQuantities = (colorQuantities) => {
    if (!colorQuantities) return [];
    if (Array.isArray(colorQuantities)) return colorQuantities;
    try {
      return JSON.parse(colorQuantities);
    } catch (error) {
      console.error('Error parsing colorQuantities:', error);
      return [];
    }
  };

  // Comprehensive color mapping system
  const getColorHex = (colorName) => {
    if (!colorName) return '#6B7280'; // Default gray
    
    const color = colorName.toLowerCase().trim();
    
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

  // Helper function to format price (e.g., 1000 -> 1k, 1500 -> 1.5k)
  const formatPrice = (price) => {
    if (!price || price < 1000) return price;
    
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (price >= 1000) {
      return (price / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    
    return price;
  };

  // Image carousel logic with smooth transitions
  useEffect(() => {
    if (product.images && product.images.length > 1) {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentImageIndex((prevIndex) => 
            (prevIndex + 1) % product.images.length
          );
          setIsTransitioning(false);
        }, 300); // Half of the transition duration
      }, imageChangeInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [product.images, imageChangeInterval]);

  // Pause carousel on hover
  useEffect(() => {
    if (isHovered && intervalRef.current) {
      clearInterval(intervalRef.current);
    } else if (!isHovered && product.images && product.images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % product.images.length
        );
      }, imageChangeInterval);
    }
  }, [isHovered, product.images, imageChangeInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  const variants = {
    default: {
      imageSize: 'w-full h-80 sm:h-72 md:h-80 lg:h-96',
      cardPadding: 'p-0',
      titleSize: 'text-lg sm:text-xl md:text-2xl',
      priceSize: 'text-xl sm:text-2xl md:text-3xl',
      showRating: true,
      showActions: true
    },
    compact: {
      imageSize: 'w-20 h-20',
      cardPadding: 'p-3',
      titleSize: 'text-sm',
      priceSize: 'text-base',
      showRating: true,
      showActions: false
    },
    minimal: {
      imageSize: 'w-16 h-16',
      cardPadding: 'p-2',
      titleSize: 'text-xs',
      priceSize: 'text-sm',
      showRating: false,
      showActions: false
    }
  };

  const currentVariant = variants[variant];

  const handleQuickView = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product?id=${product._id}`);
  }, [router, product._id]);

  const handleProductClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product?id=${product._id}`);
  }, [router, product._id]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleProductClick();
    }
  }, [handleProductClick]);

  const handleCartIconClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCartModal(true);
    // Set default selections if available
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    const colorQuantities = getColorQuantities(product.colorQuantities);
    if (colorQuantities && colorQuantities.length > 0) {
      setSelectedColor(colorQuantities[0].color);
    }
  }, [product]);

  // Set default selections when modal opens
  useEffect(() => {
    if (showCartModal) {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
      const colorQuantities = getColorQuantities(product.colorQuantities);
      if (colorQuantities && colorQuantities.length > 0 && !selectedColor) {
        setSelectedColor(colorQuantities[0].color);
      }
    }
  }, [showCartModal, product.sizes, product.colorQuantities, selectedSize, selectedColor]);

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if size and color are required
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    const colorQuantities = getColorQuantities(product.colorQuantities);
    if (colorQuantities && colorQuantities.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    // Get selected image
    const selectedImage = product.images && product.images.length > 0
      ? getImageUrl(product.images[currentImageIndex])
      : null;

    // Add to cart using Redux
    dispatch(addToCart({
      product: product,
      quantity: 1,
      selectedSize: selectedSize,
      selectedColor: selectedColor,
      selectedImage: selectedImage
    }));

    // Open cart slider
    dispatch(openCart());

    // Show success message
    toast.success(`${product.name} added to cart!`);
    setShowCartModal(false);
  }, [dispatch, product, selectedSize, selectedColor, currentImageIndex]);

  const handleCloseModal = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCartModal(false);
  }, []);


  if (variant === 'compact' || variant === 'minimal') {
    // Keep original design for compact and minimal variants
    return (
      <div 
        className={`bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group ${currentVariant.cardPadding} ${className}`}
      >
        <div className="relative mb-3 overflow-hidden rounded-lg">
          {product.images && product.images.length > 0 ? (
            <img 
              src={getImageUrl(product.images[0])} 
              alt={product.name}
              className={`${currentVariant.imageSize} object-cover group-hover:scale-110 transition-transform duration-300`}
            />
          ) : (
            <div className={`${currentVariant.imageSize} bg-gray-200 flex items-center justify-center`}>
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 
            className={`${currentVariant.titleSize} font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 cursor-pointer hover:scale-105 transform`}
            onClick={handleProductClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`View product: ${product.name}`}
          >
            {product.name.length > 16 ? product.name.slice(0, 16) + '...' : product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className={`${currentVariant.priceSize} font-bold text-blue-600`}>
              PKR {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image with Carousel */}
      <div className={`relative ${currentVariant.imageSize} overflow-hidden`}>
        {product.images && product.images.length > 0 ? (
          <>
            <img 
              src={getImageUrl(product.images[currentImageIndex])} 
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${
                isTransitioning ? 'animate-fadeOutLeft' : 'animate-fadeInRight'
              }`}
              loading="lazy"
              decoding="async"
            />
            {/* Image indicators */}
            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
                {product.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-white scale-125 shadow-lg' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={`${currentVariant.imageSize} bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center`}>
            <span className="text-gray-500 text-lg font-medium">No Image</span>
          </div>
        )}

        {/* Stronger Gradient Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        {/* Additional overlay for hover state */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm px-4 py-2 rounded-2xl font-bold shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-300 border border-red-400/30">
            -{product.discountPercentage}%
          </div>
        )}

        {/* Stock Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`text-xs px-4 py-2 rounded-2xl font-bold shadow-2xl ${
            product.quantity > 0 
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-400/30' 
              : 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-400/30'
          }`}>
            {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Hover Overlay with Action Buttons */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
          <div className="flex space-x-3">
            {/* Quick View Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickView(e);
              }}
              className="bg-black/40 backdrop-blur-lg text-white w-12 h-12 rounded-full font-semibold shadow-2xl hover:bg-black/60 hover:scale-110 transition-all duration-300 flex items-center justify-center border border-white/20"
              aria-label={`Quick view ${product.name}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleCartIconClick}
              disabled={product.quantity === 0}
              className="bg-black/40 backdrop-blur-lg text-white w-12 h-12 rounded-full font-semibold shadow-2xl hover:bg-black/60 hover:scale-110 transition-all duration-300 flex items-center justify-center border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label={`Add ${product.name} to cart`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Product Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
        {/* Brand */}
        {product.brand && (
          <p className="text-sm font-semibold uppercase tracking-widest text-white/90 mb-2 drop-shadow-2xl">
            {product.brand}
          </p>
        )}

        {/* Product Name */}
        <h3 
          className={`${currentVariant.titleSize} font-black mb-3 line-clamp-2 drop-shadow-2xl text-white leading-tight cursor-pointer hover:text-blue-300 transition-colors duration-300 hover:scale-105 transform`}
          onClick={handleProductClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`View product: ${product.name}`}
        >
          {product.name}
        </h3>

        {/* Rating */}
        {currentVariant.showRating && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="drop-shadow-2xl">
              <RatingStars rating={product.rating} size="sm" showRating={false} />
            </div>
            <span className="text-sm text-white/90 drop-shadow-2xl font-medium">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`${currentVariant.priceSize} font-black text-white drop-shadow-2xl`}>
              PKR {formatPrice(product.price)}
            </span>
            {product.discountPercentage > 0 && (
              <span className="text-lg text-white/80 line-through drop-shadow-2xl font-semibold">
                PKR {formatPrice(Math.round(product.price / (1 - product.discountPercentage / 100)))}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cart Modal - Size and Color Selection */}
      {showCartModal && (
        <div className="absolute inset-0 bg-white z-50 rounded-3xl animate-fadeIn">
          <div className="h-full flex flex-col">
            {/* Close Button - Fixed at top */}
            <div className="flex justify-end p-6 pb-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCloseModal(e);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              {/* Price Display */}
              <div className="mb-6 animate-slideUp">
                <div className="flex items-center space-x-2">
                  {product.discountPercentage > 0 ? (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        PKR {formatPrice(Math.round(product.price / (1 - product.discountPercentage / 100)))}
                      </span>
                      <span className="text-xl font-bold text-red-600">
                        PKR {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-gray-900">
                      PKR {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">SIZE:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, index) => (
                      <button
                        key={size}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedSize(size);
                        }}
                        className={`px-4 py-2 rounded border font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                          selectedSize === size
                            ? 'border-black bg-black text-white scale-105'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                        }`}
                        style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {(() => {
                const colorQuantities = getColorQuantities(product.colorQuantities);
                return colorQuantities && colorQuantities.length > 0 && (
                  <div className="mb-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">COLOR:</label>
                    <div className="flex flex-wrap gap-3">
                      {colorQuantities.map((colorItem, index) => {
                        const colorHex = getColorHex(colorItem.color);
                        const isSelected = selectedColor === colorItem.color;
                        const isDisabled = colorItem.quantity === 0;
                        
                        return (
                          <button
                            key={colorItem.color}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!isDisabled) {
                                setSelectedColor(colorItem.color);
                              }
                            }}
                            disabled={isDisabled}
                            className={`relative w-12 h-12 rounded-full border-2 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              isSelected
                                ? 'border-gray-800 scale-110 shadow-lg'
                                : isDisabled
                                ? 'border-gray-200 cursor-not-allowed opacity-50'
                                : 'border-gray-300 hover:border-gray-400 shadow-sm'
                            }`}
                            style={{ 
                              animationDelay: `${0.3 + index * 0.1}s`,
                              backgroundColor: colorHex,
                              boxShadow: isSelected ? `0 0 0 2px ${colorHex}, 0 4px 12px rgba(0,0,0,0.15)` : undefined
                            }}
                            title={colorItem.color} // Show color name on hover
                          >
                            {/* Selection indicator - Simple white dot */}
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-transparent shadow-lg"></div>
                              </div>
                            )}
                            
                            {/* Disabled overlay - Red diagonal line with transparency */}
                            {isDisabled && (
                              <div className="absolute inset-0 rounded-full bg-black backdrop-blur-sm flex items-center justify-center">
                                <div className="w-[-webkit-fill-available] rounded-full h-1 bg-red-500 transform rotate-45 shadow-sm"></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Add to Cart Button - Fixed at bottom */}
            <div className="p-6 pt-4 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(e);
                }}
                disabled={product.quantity === 0}
                className="w-full bg-black text-white py-3 px-4 rounded font-semibold text-sm hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ProductCard);

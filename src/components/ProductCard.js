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
  const [isTapped, setIsTapped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextImageIndex, setNextImageIndex] = useState(0);
  const [showNextImage, setShowNextImage] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const intervalRef = useRef(null);
  const tapTimeoutRef = useRef(null);

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}/${imagePath.replace(/\\/g, '/')}`;
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

  // Helper function to parse sizes (handle both array and string formats)
  const parseSizes = (sizes) => {
    if (!sizes) return [];
    
    // If it's already an array, check if it contains JSON strings
    if (Array.isArray(sizes)) {
      // If array has one element that's a JSON string, parse it
      if (sizes.length === 1 && typeof sizes[0] === 'string' && sizes[0].startsWith('[')) {
        try {
          const parsed = JSON.parse(sizes[0]);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // If JSON parsing fails, treat as comma-separated
          return sizes[0].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(s => s.length > 0);
        }
      }
      // If it's a regular array of sizes, return it
      return sizes;
    }
    
    // If it's a string, try to parse it
    if (typeof sizes === 'string') {
      try {
        // Try to parse as JSON first (for ["6","7","8","9"] format)
        const parsed = JSON.parse(sizes);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // If JSON parsing fails, try comma-separated values
        return sizes.split(',').map(s => s.trim().replace(/['"]/g, '')).filter(s => s.length > 0);
      }
    }
    
    return [];
  };

  // Comprehensive color mapping system
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

  // Helper function to format price (e.g., 1000 -> 1k, 1500 -> 1.5k)
  const formatPrice = (price) => {
    if (!price) return price;
    
    return price.toLocaleString();
  };

  // Image carousel logic - on hover or tap
  useEffect(() => {
    const shouldShowActions = isHovered || isTapped;
    
    if (shouldShowActions && product.images && product.images.length > 1) {
      // Start the image transition loop on hover or tap
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % product.images.length;
          setNextImageIndex(nextIndex);
          setShowNextImage(true);
          setIsTransitioning(true);
          
          // After slide animation completes, update current image
          setTimeout(() => {
            setCurrentImageIndex(nextIndex);
            setShowNextImage(false);
            setIsTransitioning(false);
          }, 1200); // Match slideOutToLeft animation duration
          
          return prevIndex; // Don't update immediately, let the animation handle it
        });
      }, 3000); // Transition every 3 seconds to allow for longer animation

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Clear interval when not hovering/tapped and reset to first image
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset to first image when hover/tap ends
      if (!shouldShowActions) {
        setCurrentImageIndex(0);
        setNextImageIndex(0);
        setShowNextImage(false);
        setIsTransitioning(false);
      }
    }
  }, [isHovered, isTapped, product.images]);

  // Mobile tap handlers
  const handleTouchStart = useCallback((e) => {
    // Don't prevent default to allow click events to work
    setIsTapped(true);
    
    // Clear any existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    // Auto-hide after 3 seconds on mobile
    tapTimeoutRef.current = setTimeout(() => {
      setIsTapped(false);
    }, 3000);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    // Don't prevent default to allow click events to work
    // Don't immediately hide on touch end, let the timeout handle it
  }, []);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);
  
  const variants = {
    default: {
      imageSize: 'w-full h-[220px] xs:h-[240px] sm:h-[260px] md:h-[280px] lg:h-[290px] xl:h-[290px]',
      cardPadding: 'p-0',
      titleSize: 'text-xs sm:text-sm md:text-base lg:text-lg',
      priceSize: 'text-sm sm:text-base md:text-lg lg:text-xl',
      showRating: true,
      showActions: true
    },
    compact: {
      imageSize: 'w-20 h-20',
      cardPadding: 'p-3',
      titleSize: 'text-xs',
      priceSize: 'text-sm',
      showRating: true,
      showActions: false
    },
    minimal: {
      imageSize: 'w-16 h-16',
      cardPadding: 'p-2',
      titleSize: 'text-xs',
      priceSize: 'text-xs',
      showRating: false,
      showActions: false
    }
  };

  const currentVariant = variants[variant];


  const handleProductClick = useCallback((e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest('.action-buttons')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Hide tap state when navigating
    setIsTapped(false);
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
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
    
    const parsedSizes = parseSizes(product.sizes);
    console.log('Cart button clicked on mobile:', { 
      productName: product.name, 
      hasSizes: parsedSizes.length > 0,
      hasColors: getColorQuantities(product.colorQuantities).length > 0
    });
    
    setShowCartModal(true);
    // Set default selections if available
    if (parsedSizes.length > 0) {
      setSelectedSize(parsedSizes[0]);
    }
    const colorQuantities = getColorQuantities(product.colorQuantities);
    if (colorQuantities && colorQuantities.length > 0) {
      setSelectedColor(colorQuantities[0].color);
    }
  }, [product]);

  // Set default selections when modal opens
  useEffect(() => {
    if (showCartModal) {
      const parsedSizes = parseSizes(product.sizes);
      if (parsedSizes.length > 0 && !selectedSize) {
        setSelectedSize(parsedSizes[0]);
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
    const parsedSizes = parseSizes(product.sizes);
    if (parsedSizes.length > 0 && !selectedSize) {
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
              className={`${currentVariant.imageSize} object-contain group-hover:scale-110 transition-transform duration-300`}
            />
          ) : (
            <div className={`${currentVariant.imageSize} bg-gray-200 flex items-center justify-center`}>
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 
            className={`${currentVariant.titleSize} font-product font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 cursor-pointer hover:scale-105 transform`}
            onClick={handleProductClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`View product: ${product.name}`}
          >
            {product.name.length > 10 ? product.name.slice(0, 10) + '...' : product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className={`${currentVariant.priceSize} font-product font-bold text-blue-600`}>
              <span className="font-alumni-lg">Rs {formatPrice(product.price)}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group bg-transparent cursor-pointer max-w-[280px] sm:max-w-[320px] md:max-w-[340px] lg:max-w-[360px] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleProductClick}
    >
      {/* Product Image Container */}
      <div className={`relative ${currentVariant.imageSize} overflow-hidden rounded-t-xl sm:rounded-t-2xl`}>
        {product.images && product.images.length > 0 ? (
          <div className="relative w-full h-full overflow-hidden">
            {/* Current Image */}
            <img 
              src={getImageUrl(product.images[currentImageIndex])} 
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-500 ease-in-out group-hover:scale-105 ${
                isTransitioning && showNextImage ? 'animate-slideOutToLeft' : ''
              }`}
              loading="lazy"
              decoding="async"
            />
              
            {/* Next Image - only shown during transition */}
            {isTransitioning && showNextImage && (
              <img 
                src={getImageUrl(product.images[nextImageIndex])} 
                alt={product.name}
                className="absolute inset-0 w-full h-full object-contain animate-slideInFromRight group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
        ) : (
          <div className={`${currentVariant.imageSize} bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center`}>
            <span className="text-gray-500 text-lg font-medium">No Image</span>
          </div>
        )}

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 md:top-3 md:left-3 bg-red-500 text-white text-[9px] sm:text-[10px] md:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-product font-bold shadow-md">
            {product.discountPercentage}% OFF
          </div>
        )}

      </div>

      {/* Product Info - Below Image */}
      <div className="relative p-2 sm:p-3 md:p-3 lg:p-4 space-y-1 sm:space-y-1.5 md:space-y-2">
        {/* Brand */}
        {product.brand && (
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-500">
            {product.brand}
          </p>
        )}

        {/* Product Name */}
        <h3 
          className={`${currentVariant.titleSize} font-product font-bold text-black leading-tight cursor-pointer hover:text-gray-600 transition-colors duration-200 line-clamp-2 pr-10 sm:pr-12`}
          onClick={handleProductClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`View product: ${product.name}`}
        >
          {/* {product.name.length > 10 ? product.name.slice(0, 20) + '...' : product.name} */}
          {product.name}
        </h3>

        {/* Cart Button - Bottom Right Corner */}
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 z-10 action-buttons">
          <button
            onClick={handleCartIconClick}
            onTouchEnd={handleCartIconClick}
            disabled={product.quantity === 0}
            className="bg-white text-gray-800 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full font-semibold shadow-lg hover:bg-gray-50 hover:scale-110 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-gray-200"
            aria-label={`Add ${product.name} to cart`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </button>
        </div>

        {/* Rating */}
        {currentVariant.showRating && (
          <div className="flex items-center space-x-2">
            <div>
              <RatingStars 
                rating={product.rating} 
                size="lg" 
                showRating={false} 
                interactive={true}
                onRatingChange={(rating) => {
                  console.log(`Rating changed to: ${rating}`);
                  // You can add your rating submission logic here
                }}
              />
            </div>
            {/* <span className="text-sm text-gray-500 font-medium">
              ({product.reviewCount || 0})
            </span> */}
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center space-x-3">
          <span className={`${currentVariant.priceSize} font-product font-medium text-black`}>
            <span className="font-alumni-lg">Rs {formatPrice(product.price)}</span>
          </span>
          {product.discountPercentage > 0 && (
            <span className="text-sm text-red-500 line-through font-medium font-alumni">
              Rs {formatPrice(Math.floor(product.price / (1 - product.discountPercentage / 100)))}
            </span>
          )}
        </div>
      </div>

      {/* Cart Modal - Size and Color Selection */}
      {showCartModal && (
        <div className="absolute inset-0 bg-white z-50 rounded-xl sm:rounded-2xl md:rounded-3xl animate-fadeIn">
          <div className="h-full flex flex-col">
            {/* Close Button - Fixed at top */}
            <div className="flex justify-end p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 md:pb-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCloseModal(e);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
              {/* Price Display */}
              <div className="mb-4 sm:mb-6 animate-slideUp">
                <div className="flex items-center space-x-2">
                  {product.discountPercentage > 0 ? (
                    <>
                      <span className="text-xs sm:text-sm text-gray-500 line-through font-alumni">
                        Rs {formatPrice(Math.floor(product.price / (1 - product.discountPercentage / 100)))}
                      </span>
                      <span className="text-base sm:text-lg font-product font-bold text-red-600">
                        <span className="font-alumni-lg">Rs {formatPrice(product.price)}</span>
                      </span>
                    </>
                  ) : (
                    <span className="text-base sm:text-lg font-product font-bold text-gray-900">
                      <span className="font-alumni-lg">Rs {formatPrice(product.price)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              {(() => {
                const parsedSizes = parseSizes(product.sizes);
                return parsedSizes.length > 0 && (
                  <div className="mb-4 sm:mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">SIZE:</label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {parsedSizes.map((size, index) => (
                      <button
                        key={size}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedSize(size);
                        }}
                        className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded border font-medium text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 ${
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
                );
              })()}

              {/* Color Selection */}
              {(() => {
                const colorQuantities = getColorQuantities(product.colorQuantities);
                return colorQuantities && colorQuantities.length > 0 && (
                  <div className="mb-4 sm:mb-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">COLOR:</label>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
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
                            className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
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
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-transparent shadow-lg"></div>
                              </div>
                            )}
                            
                            {/* Disabled overlay - Red diagonal line with transparency */}
                            {isDisabled && (
                              <div className="absolute inset-0 rounded-full bg-black backdrop-blur-sm flex items-center justify-center">
                                <div className="w-full rounded-full h-1 bg-red-500 transform rotate-45 shadow-sm"></div>
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
            <div className="p-3 sm:p-4 md:p-6 pt-2 sm:pt-3 md:pt-4 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(e);
                }}
                disabled={product.quantity === 0}
                className="w-full bg-black text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded font-semibold text-xs sm:text-sm hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

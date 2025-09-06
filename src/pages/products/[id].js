import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ChevronLeftIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import productsAPI from '../../APIs/eproducts';
import { useAppDispatch } from '../../redux/hooks';
import { addToCart } from '../../redux/slices/cartSlice';

// This is the product detail page with dynamic routing
// It will be built in parts for better organization
export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();

  // State management for the page
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');


  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await productsAPI.getProductById(id);
          console.log("Single product data ====", response);
          
          if (response.data && response.data.product) {
            // Map API response to component format
            const apiProduct = response.data.product;
            const mappedProduct = {
              id: apiProduct._id,
              name: apiProduct.name,
              brand: apiProduct.brand,
              price: apiProduct.price,
              originalPrice: apiProduct.originalPrice,
              discount: apiProduct.discount,
              rating: apiProduct.rating || 0,
              reviewCount: apiProduct.reviewCount || 0,
              description: apiProduct.description,
              shortDescription: apiProduct.shortDescription,
              images: apiProduct.images.map(img => img.url),
              inStock: apiProduct.isInStock,
              stock: apiProduct.stock,
              sizes: apiProduct.sizes.map(size => ({
                size: size,
                available: true,
                stock: apiProduct.stock
              })),
              colors: apiProduct.colors.map(color => ({
                name: color.name,
                hex: color.hexCode,
                available: color.stock > 0
              })),
              category: apiProduct.category || 'Shoes',
              gender: apiProduct.gender,
              sku: apiProduct.sku,
              weight: "0.8 kg", // Default values for missing fields
              dimensions: "30 x 20 x 12 cm",
              materials: "Premium materials",
              care: "Clean with a soft brush and mild soap. Air dry away from direct heat.",
              features: [
                "Premium quality materials",
                "Comfortable fit",
                "Durable construction",
                "Modern design"
              ]
            };
            
            setProduct(mappedProduct);
          } else {
            setError('Product not found');
            setProduct(null);
          }
        } catch (err) {
          console.error('Error fetching product:', err);
          setError('Failed to load product');
          setProduct(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch trending products for "You Might Also Like" section
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      if (product) {
        setIsLoadingTrending(true);
        try {
          const response = await productsAPI.getTrendingProducts();
          if (response.data && response.data.products) {
            // Filter out the current product and take only 4 products
            const filteredProducts = response.data.products
              .filter(p => p._id !== product.id)
              .slice(0, 4);
            setTrendingProducts(filteredProducts);
          }
        } catch (err) {
          console.error('Error fetching trending products:', err);
          setTrendingProducts([]);
        } finally {
          setIsLoadingTrending(false);
        }
      }
    };

    fetchTrendingProducts();
  }, [product]);

  // Handle cart actions with validation messages
  const handleAddToCart = () => {
    if (!isClient || !product) return;
    
    // Clear previous validation message
    setValidationMessage('');
    
    // Validation messages
    if (!selectedSize && !selectedColor) {
      setValidationMessage('Please select both size and color before adding to cart.');
      return;
    }
    
    if (!selectedSize) {
      setValidationMessage('Please select a size before adding to cart.');
      return;
    }
    
    if (!selectedColor) {
      setValidationMessage('Please select a color before adding to cart.');
      return;
    }

    // Add to cart with essential data only
    const essentialData = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : null,
      quantity: quantity,
      selectedSize: selectedSize,
      selectedColor: selectedColor?.name || selectedColor
    };

    dispatch(addToCart(essentialData));

    console.log('Added to cart:', essentialData);
  };

  const handleWishlist = () => {
    if (!isClient) return;
    
    setIsWishlisted(!isWishlisted);
    console.log('Wishlist toggled:', !isWishlisted);
    // TODO: Implement wishlist functionality
  };

  const handleShare = () => {
    // This function will only be called on client side, so it's safe to use browser APIs
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out this amazing product: ${product?.name}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Image navigation and zoom functions
  const handleImageSelect = (index) => {
    if (!isClient) return;
    
    setSelectedImageIndex(index);
    setIsZoomed(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    if (!isClient) return;
    
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleZoomOut = () => {
    if (!isClient) return;
    
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1) {
      setIsZoomed(false);
      setPanPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  };

  const handleMouseDown = (e) => {
    if (!isClient || !isZoomed || zoomLevel <= 1) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isClient || !isZoomed || !isDragging || zoomLevel <= 1) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Limit panning to prevent image from going too far off-screen
    const maxPan = 100;
    setPanPosition({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY))
    });
  };

  const handleMouseUp = () => {
    if (!isClient) return;
    setIsDragging(false);
  };

  const handleImageClick = () => {
    if (!isClient) return;
    
    if (!isZoomed) {
      handleZoomIn();
    } else {
      resetZoom();
    }
  };

  const resetZoom = () => {
    if (!isClient) return;
    
    setIsZoomed(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

    // Keyboard navigation
  useEffect(() => {
    if (!product?.images || !isClient) return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex(prev => 
          prev > 0 ? prev - 1 : product.images.length - 1
        );
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex(prev => 
          prev < product.images.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'Escape') {
        resetZoom();
      }
    };

    // Global mouse up handler to stop dragging when mouse is released outside
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [product?.images?.length, isClient, isDragging]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image skeleton */}
              <div className="bg-gray-200 rounded-lg h-96 lg:h-[600px]"></div>
              {/* Content skeleton */}
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No product found (invalid ID)
  if (!isLoading && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid ID</h3>
          <p className="text-gray-500 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => {
              if (isClient) {
                router.push('/');
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product?.name ? `${product.name} - ${product.brand} | Zagro Store` : 'Loading... | Zagro Store'}</title>
        <meta name="description" content={product?.description || 'Product details'} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <button
              onClick={() => {
                if (isClient) {
                  router.back();
                }
              }}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Back to {product?.category || 'Products'}
            </button>
          </div>
        </div>

        {/* Main Product Content - Part 1: Basic Layout */}
        {product ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images - Part 2: Image Gallery */}
              <div className="space-y-4">
                {/* Main Image with Zoom Controls */}
                <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                  <div className="relative">
                                         {/* Zoom Controls */}
                     <div className="absolute top-4 right-4 z-10 flex space-x-2">
                       <button
                         onClick={handleZoomIn}
                         className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
                         title="Zoom In"
                       >
                         <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 7v3m0 0v3m0-3h3m-3 0H7" />
                         </svg>
                       </button>
                       <button
                         onClick={handleZoomOut}
                         className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
                         title="Zoom Out"
                       >
                         <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 3v6m0 0v6m0-6h6m-6 0H4" />
                         </svg>
                       </button>
                       {isZoomed && (
                         <button
                           onClick={resetZoom}
                           className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
                           title="Reset Zoom"
                         >
                           <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                           </svg>
                         </button>
                       )}
                     </div>

                                         {/* Main Image Container */}
                     <div 
                       className={`relative overflow-hidden select-none ${isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
                       onMouseDown={handleMouseDown}
                       onMouseMove={handleMouseMove}
                       onMouseUp={handleMouseUp}
                       onMouseLeave={handleMouseUp}
                       onClick={handleImageClick}
                       style={{ height: '500px' }}
                     >
                                                <img
                           src={product.images[selectedImageIndex]}
                           alt={product.name}
                           className={`w-full h-full object-cover object-center transition-all duration-300 select-none ${
                             isZoomed ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
                           }`}
                           style={{
                             transform: `scale(${zoomLevel}) translate(${panPosition.x}%, ${panPosition.y}%)`,
                             transformOrigin: 'center center',
                             userSelect: 'none',
                             pointerEvents: 'none'
                           }}
                           draggable={false}
                         />

                      {/* Zoom Hint */}
                      {!isZoomed && (
                        <div className="absolute inset-0 bg-transparent hover:transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      {/* Drag Hint when Zoomed */}
                      {isZoomed && !isDragging && (
                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs">
                          Click and drag to pan
                        </div>
                      )}
                    </div>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {product.images.length}
                    </div>

                    {/* Navigation Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            if (isClient) {
                              setSelectedImageIndex(prev =>
                                prev > 0 ? prev - 1 : product.images.length - 1
                              );
                            }
                          }}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
                          title="Previous Image"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (isClient) {
                              setSelectedImageIndex(prev =>
                                prev < product.images.length - 1 ? prev + 1 : 0
                              );
                            }
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
                          title="Next Image"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Thumbnail Navigation */}
                <div className="bg-white rounded-lg border border-gray-100 p-4">
                  <div className="grid grid-cols-4 gap-3">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageSelect(index)}
                        className={`relative group overflow-hidden rounded-lg border-2 transition-all duration-200 ${selectedImageIndex === index
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-transparent hover:border-blue-300'
                          }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          className="w-full h-20 sm:h-24 object-cover object-center transition-transform duration-200 group-hover:scale-110"
                        />
                        {/* Active indicator */}
                        {selectedImageIndex === index && (
                          <div className="absolute inset-0 bg-transparent border-2 border-blue-500 rounded-lg"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Navigation Instructions */}
                  <div className="mt-3 text-center">
                    <span className="text-xs text-gray-500">
                      {product.images.length} photos • Click thumbnails to view • Use zoom controls
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Information - Part 3: Basic Details */}
              <div className="space-y-6">
                {/* Product Header */}
                <div className="bg-white rounded-lg border border-gray-100 p-6">
                  {/* Brand & Category */}
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {product.brand}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      {product.gender}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    {product.name}
                  </h1>

                  {/* Rating & Reviews */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, index) => (
                        <svg
                          key={index}
                          className={`w-5 h-5 ${index < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {product.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    {product.originalPrice > product.price && (
                      <>
                        <span className="text-lg text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          {product.discount}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <button
                      onClick={handleAddToCart}
                      className="cursor-pointer flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      <span>Add to Cart</span>
                    </button>

                    {isClient && (
                      <button
                        onClick={handleShare}
                        className="p-3 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
                      >
                        <ShareIcon className="w-6 h-6" />
                      </button>
                    )}
                  </div>

                  {/* Validation Message */}
                  {validationMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-700 text-sm font-medium">{validationMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    {product.inStock && (
                      <span className="text-gray-500">
                        • Free shipping on orders over $50
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Options - Part 4: Size, Color, Quantity */}
                <div className="bg-white rounded-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Options</h3>

                  {/* Color Selection */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Color</h4>
                      <span className="text-xs text-gray-500">Select a color</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => {
                            if (isClient) {
                              setSelectedColor(color);
                            }
                          }}
                          disabled={!color.available}
                          className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${selectedColor?.name === color.name
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                            } ${!color.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div
                              className="w-8 h-8 rounded-full border border-gray-200"
                              style={{ backgroundColor: color.hex }}
                            ></div>
                            <span className={`text-xs font-medium ${selectedColor?.name === color.name ? 'text-blue-600' : 'text-gray-700'
                              }`}>
                              {color.name}
                            </span>
                            {!color.available && (
                              <span className="text-xs text-red-500">Out of Stock</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                                   {/* Size Selection */}
                 <div className="mb-6">
                   <div className="flex items-center justify-between mb-3">
                     <h4 className="text-sm font-medium text-gray-700">Size</h4>
                     <div className="flex items-center space-x-2">
                       <span className="text-xs text-gray-500">Select a size</span>
                       <button
                         onClick={() => {
                           if (isClient) {
                             setShowSizeGuide(true);
                           }
                         }}
                         className="text-xs text-blue-600 hover:text-blue-700 underline"
                       >
                         Size Guide
                       </button>
                     </div>
                   </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {product.sizes.map((sizeInfo) => (
                        <button
                          key={sizeInfo.size}
                          onClick={() => {
                            if (isClient) {
                              setSelectedSize(sizeInfo.size);
                            }
                          }}
                          disabled={!sizeInfo.available}
                          className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${selectedSize === sizeInfo.size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            } ${!sizeInfo.available ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}`}
                        >
                          <div className="text-center">
                            <span className="text-sm font-medium">{sizeInfo.size}</span>
                            {sizeInfo.available && (
                              <div className="text-xs text-gray-500 mt-1">
                                {sizeInfo.stock} left
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selection */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Quantity</h4>
                      <span className="text-xs text-gray-500">Select quantity</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          if (isClient) {
                            setQuantity(Math.max(1, quantity - 1));
                          }
                        }}
                        className="w-10 h-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>

                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={quantity}
                        onChange={(e) => {
                          if (isClient) {
                            setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)));
                          }
                        }}
                        className="w-16 h-10 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />

                      <button
                        onClick={() => {
                          if (isClient) {
                            setQuantity(Math.min(10, quantity + 1));
                          }
                        }}
                        className="w-10 h-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Selection Summary */}
                  {(selectedSize || selectedColor) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Options:</h4>
                      <div className="space-y-1 text-sm text-blue-800">
                        {selectedColor && (
                          <div className="flex items-center space-x-2">
                            <span>Color:</span>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-200"
                                style={{ backgroundColor: selectedColor.hex }}
                              ></div>
                              <span>{selectedColor.name}</span>
                            </div>
                          </div>
                        )}
                        {selectedSize && (
                          <div>Size: {selectedSize}</div>
                        )}
                        <div>Quantity: {quantity}</div>
                      </div>
                    </div>
                                     )}
                 </div>
               
                 {/* Bundle Deals Section */}
                 {product.bundleDeals && product.bundleDeals.length > 0 && (
                   <div className="bg-white rounded-lg border border-gray-100 p-6 mt-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4">Bundle Deals</h3>
                     <div className="space-y-4">
                       {product.bundleDeals.map((bundle) => (
                         <div key={bundle.id} className="border border-gray-200 rounded-lg p-4">
                           <div className="flex items-center justify-between mb-3">
                             <h4 className="font-medium text-gray-900">{bundle.name}</h4>
                             <div className="text-right">
                               <div className="text-sm text-gray-500 line-through">${bundle.originalPrice}</div>
                               <div className="text-lg font-bold text-green-600">${bundle.bundlePrice}</div>
                               <div className="text-xs text-green-600">Save ${bundle.savings}</div>
                             </div>
                           </div>
                           
                           {/* Bundle Products */}
                           <div className="grid grid-cols-3 gap-3 mb-3">
                             {bundle.products.map((item) => (
                               <div key={item.id} className="text-center">
                                 <img
                                   src={item.image}
                                   alt={item.name}
                                   className="w-16 h-16 object-cover rounded mx-auto mb-2"
                                 />
                                 <div className="text-xs text-gray-600">{item.name}</div>
                                 <div className="text-xs font-medium text-gray-900">${item.price}</div>
                               </div>
                             ))}
                           </div>
                           
                           <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                             Add Bundle to Cart
                           </button>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             </div>

            {/* Product Details - Part 5: Description, Features, Specs */}
            {product && (
              <div className="mt-12 space-y-8">
                {/* Product Description */}
                <div className="bg-white rounded-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Description</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {/* Key Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Specifications */}
                <div className="bg-white rounded-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Brand</h4>
                      <p className="text-gray-900">{product.brand}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Category</h4>
                      <p className="text-gray-900">{product.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Gender</h4>
                      <p className="text-gray-900">{product.gender}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">SKU</h4>
                      <p className="text-gray-900 font-mono text-sm">{product.sku}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Weight</h4>
                      <p className="text-gray-900">{product.weight}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Dimensions</h4>
                      <p className="text-gray-900">{product.dimensions}</p>
                    </div>
                  </div>
                </div>

                {/* Care Instructions */}
                <div className="bg-white rounded-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Care Instructions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Materials</h4>
                      <p className="text-gray-600">{product.materials}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Care</h4>
                      <p className="text-gray-600">{product.care}</p>
                    </div>
                  </div>
                </div>

                {/* Related Products - Part 6: Related Products Section */}
                <div className="bg-white rounded-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">You Might Also Like</h3>

                  {/* Loading State for Trending Products */}
                  {isLoadingTrending ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : trendingProducts.length > 0 ? (
                    <>
                      {/* Related Products Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {trendingProducts.map((relatedProduct) => (
                          <div
                            key={relatedProduct._id}
                            className="group cursor-pointer"
                            onClick={() => router.push(`/products/${relatedProduct._id}`)}
                          >
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200">
                              {/* Product Image */}
                              <div className="relative overflow-hidden">
                                <img
                                  src={relatedProduct.images?.[0]?.url || '/placeholder-image.jpg'}
                                  alt={relatedProduct.images?.[0]?.alt || relatedProduct.name}
                                  className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                />
                                {relatedProduct.discount > 0 && (
                                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                                    {relatedProduct.discount}% OFF
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="p-4">
                                <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                  {relatedProduct.name}
                                </h4>
                                <p className="text-xs text-gray-500 mb-2">{relatedProduct.brand}</p>

                                {/* Price */}
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-semibold text-gray-900">
                                    ${relatedProduct.price}
                                  </span>
                                  {relatedProduct.originalPrice > relatedProduct.price && (
                                    <span className="text-xs text-gray-400 line-through">
                                      ${relatedProduct.originalPrice}
                                    </span>
                                  )}
                                </div>

                                {/* Rating */}
                                <div className="flex items-center space-x-1">
                                  <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, index) => (
                                      <svg
                                        key={index}
                                        className={`w-3 h-3 ${index < Math.floor(relatedProduct.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    ({relatedProduct.reviewCount || 0})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* View All Products Button */}
                      <div className="text-center mt-8">
                        <button
                          onClick={() => router.push('/categories/trending')}
                          className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                        >
                          View All Trending Products
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Related Products</h3>
                      <p className="text-gray-500 mb-4">We couldn't find any related products at the moment.</p>
                      <button
                        onClick={() => router.push('/categories/trending')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Browse All Products
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading product details...</p>
            </div>
          </div>
        )}
        
        {/* Size Guide Modal */}
        {showSizeGuide && (
          <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-1">Size Guide</h3>
                    <p className="text-gray-500 text-sm">Find your perfect fit with our comprehensive size chart</p>
                  </div>
                  <button
                    onClick={() => {
                      if (isClient) {
                        setShowSizeGuide(false);
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Size Chart */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">US Men's Shoe Sizes</h4>
                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-5 gap-3 min-w-[600px]">
                      {/* Headers */}
                      <div className="text-center font-medium text-gray-700 text-sm py-3 bg-gray-50 rounded-lg">US Size</div>
                      <div className="text-center font-medium text-gray-700 text-sm py-3 bg-gray-50 rounded-lg">EU Size</div>
                      <div className="text-center font-medium text-gray-700 text-sm py-3 bg-gray-50 rounded-lg">UK Size</div>
                      <div className="text-center font-medium text-gray-700 text-sm py-3 bg-gray-50 rounded-lg">CM</div>
                      <div className="text-center font-medium text-gray-700 text-sm py-3 bg-gray-50 rounded-lg">Inches</div>
                      
                      {/* Size Rows */}
                      {[
                        { us: 7, eu: 40, uk: 6.5, cm: 25.4, inches: 10 },
                        { us: 8, eu: 41, uk: 7.5, cm: 26.0, inches: 10.25 },
                        { us: 9, eu: 42, uk: 8.5, cm: 26.7, inches: 10.5 },
                        { us: 10, eu: 43, uk: 9.5, cm: 27.3, inches: 10.75 },
                        { us: 11, eu: 44, uk: 10.5, cm: 28.0, inches: 11 },
                        { us: 12, eu: 45, uk: 11.5, cm: 28.7, inches: 11.25 }
                      ].map((size) => (
                        <>
                          <div key={`us-${size.us}`} className="text-center py-3 text-gray-900 font-medium bg-white border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all duration-200">{size.us}</div>
                          <div key={`eu-${size.us}`} className="text-center py-3 text-gray-700 bg-white border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all duration-200">{size.eu}</div>
                          <div key={`uk-${size.us}`} className="text-center py-3 text-gray-700 bg-white border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all duration-200">{size.uk}</div>
                          <div key={`cm-${size.us}`} className="text-center py-3 text-gray-700 bg-white border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all duration-200">{size.cm}</div>
                          <div key={`inches-${size.us}`} className="text-center py-3 text-gray-700 bg-white border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all duration-200">{size.inches}</div>
                        </>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* How to Measure */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">How to Measure Your Foot</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">1</div>
                        <h5 className="font-medium text-gray-900">Prepare</h5>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">Wear the socks you'll use with the shoes and measure in the afternoon when your feet are largest.</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">2</div>
                        <h5 className="font-medium text-gray-900">Measure</h5>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">Stand on a piece of paper and trace around your foot, then measure the longest part.</p>
                    </div>
                  </div>
                </div>
                
                {/* Tips */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Pro Tips for Perfect Fit
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">Always measure both feet and use the larger measurement</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">Leave about 0.5 inches of space in front of your longest toe</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">Consider the width of your foot for the best fit</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">Try on shoes in the afternoon when your feet are at their largest</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

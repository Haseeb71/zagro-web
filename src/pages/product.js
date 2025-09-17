import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/router';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import eproductsAPI from '../APIs/eproducts';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import Newsletter from '../components/Newsletter';
import { useAppDispatch } from '../redux/hooks';
import { addToCart, openCart } from '../redux/slices/cartSlice';
import { toast } from 'react-hot-toast';

  // Helper function to get proper image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${process.env.NEXT_PUBLIC_API_URL}/${imagePath.replace(/\\/g, '/')}`;
};

// Helper function to get ALL images (general + all colors)
const getAllImages = (productData) => {
  if (!productData) return [];
  
  let allImages = [];
  
  // Always include general images first
  if (productData.images && Array.isArray(productData.images)) {
    allImages = [...productData.images];
  }
  
  // Add all color-specific images
  if (productData.colorImages && productData.colorQuantities) {
    try {
      const colors = JSON.parse(productData.colorQuantities);
      if (Array.isArray(colors)) {
        colors.forEach(colorData => {
          if (productData.colorImages[colorData.color] && Array.isArray(productData.colorImages[colorData.color])) {
            allImages = [...allImages, ...productData.colorImages[colorData.color]];
          }
        });
      }
    } catch (error) {
      console.error('Error parsing colorQuantities:', error);
    }
  }
  
  return allImages;
};

// Helper function to get the starting index of a specific color's images
const getColorImagesStartIndex = (productData, selectedColorIndex) => {
  if (!productData || !productData.images) return 0;
  
  let currentIndex = productData.images.length; // Start after general images
  
  if (selectedColorIndex !== null && selectedColorIndex !== undefined && productData.colorQuantities) {
    try {
      const colors = JSON.parse(productData.colorQuantities);
      if (Array.isArray(colors)) {
        // Find the selected color and calculate its starting index
        for (let i = 0; i < selectedColorIndex && i < colors.length; i++) {
          const colorData = colors[i];
          if (productData.colorImages && productData.colorImages[colorData.color] && Array.isArray(productData.colorImages[colorData.color])) {
            currentIndex += productData.colorImages[colorData.color].length;
          }
        }
      }
    } catch (error) {
      console.error('Error parsing colorQuantities:', error);
    }
  }
  
  return currentIndex;
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

export default function Product() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = router.query;

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [displayedImages, setDisplayedImages] = useState([]);


  const getSimilarProductsSettings = (productCount) => {
    const maxSlides = Math.min(productCount, 4);
    return {
      dots: false,
      infinite: productCount > 1, // Only enable infinite scroll if more than 1 product
      speed: 500,
      slidesToShow: maxSlides,
      slidesToScroll: 1,
      arrows: false,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(productCount, 3),
            arrows: false,
            dots: false,
            infinite: productCount > 1,
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: Math.min(productCount, 2),
            arrows: false,
            dots: false,
            infinite: productCount > 1,
          }
        },
        {
          breakpoint: 640,
          settings: {
            slidesToShow: 1,
            arrows: false,
            dots: false,
            infinite: productCount > 1,
          }
        }
      ]
    };
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

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

  const canAddToCart = () => {
    if (!productData) return false;

    // Check if product is in stock
    if (productData.quantity <= 0) return false;

    // Check if quantity is greater than 1
    if (quantity < 1) return false;

    // Check if size is selected (if sizes are available)
    const parsedSizes = parseSizes(productData.sizes);
    if (parsedSizes.length > 0) {
      if (!selectedSize) return false;
    }

    // Check if color is selected (if colors are available)
    if (productData.colorQuantities) {
      try {
        const colors = JSON.parse(productData.colorQuantities);
        if (Array.isArray(colors) && colors.length > 0) {
          if (selectedColor === null || selectedColor === undefined) return false;

          // Check if selected color has stock
          if (colors[selectedColor] && colors[selectedColor].quantity <= 0) return false;
        }
      } catch (error) {
        console.error('Error parsing colorQuantities:', error);
      }
    }

    return true;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!productData) return;

    if (productData.quantity <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    if (quantity < 1) {
      toast.error('Please select a quantity');
      return;
    }

    // Check size selection
    const parsedSizes = parseSizes(productData.sizes);
    if (parsedSizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    // Check color selection
    if (productData.colorQuantities) {
      try {
        const colors = JSON.parse(productData.colorQuantities);
        if (Array.isArray(colors) && colors.length > 0) {
          if (selectedColor === null || selectedColor === undefined) {
            toast.error('Please select a color');
            return;
          }
        }
      } catch (error) {
        console.error('Error parsing colorQuantities:', error);
      }
    }

    // Get selected color name
    let selectedColorName = null;
    if (productData.colorQuantities) {
      try {
        const colors = JSON.parse(productData.colorQuantities);
        if (Array.isArray(colors) && colors[selectedColor]) {
          selectedColorName = colors[selectedColor].color;
        }
      } catch (error) {
        console.error('Error parsing colorQuantities:', error);
      }
    }

    // Get selected image
    const selectedImage = displayedImages && displayedImages.length > 0
      ? getImageUrl(displayedImages[currentImageIndex])
      : null;

    // Add to cart
    dispatch(addToCart({
      product: productData,
      quantity: quantity,
      selectedSize: selectedSize,
      selectedColor: selectedColorName,
      selectedImage: selectedImage
    }));

    // Open cart slider
    dispatch(openCart());

    // Show success message
    toast.success(`${productData.name} added to cart!`);
  };

  // Fetch similar products
  const fetchSimilarProducts = async (catID, currentProductId) => {
    if (!catID) {
      console.log('No category ID provided for similar products');
      setLoadingSimilar(false);
      return;
    }

    try {
      console.log('Starting to fetch similar products for category:', catID);
      setLoadingSimilar(true);
      setSimilarProducts([]); // Clear previous products
      
      const response = await eproductsAPI.getSimilarProducts({
        catID: catID,
        page: 1,
        perPage: 8,
        type: '' 
      });
      
      console.log('Similar products API response:', response);
      if (response && response.data) {
       
        const products = response.data.products || response.data || [];
        console.log('All similar products before filtering:', products);
        console.log('Current product ID to filter:', currentProductId);
        
        // Filter out the current product from similar products
        const filteredProducts = products.filter(product => {
          const productId = product._id || product.id;
          const isCurrentProduct = String(productId) === String(currentProductId);
          console.log(`Product ${productId} (${typeof productId}) vs Current ${currentProductId} (${typeof currentProductId}) - Match: ${isCurrentProduct}`);
          const shouldKeep = !isCurrentProduct;
          console.log(`Should keep product ${productId}: ${shouldKeep}`);
          return shouldKeep;
        });
        
        console.log('Filtered similar products:', filteredProducts);
        console.log('Filtered products length:', filteredProducts.length);
        console.log('Is array?', Array.isArray(filteredProducts));
        setSimilarProducts(Array.isArray(filteredProducts) ? filteredProducts : []);
      } else {
        console.log('No data found in response');
        setSimilarProducts([]);
      }
    } catch (err) {
      console.error('Error fetching similar products:', err);
      setSimilarProducts([]);
    } finally {
      console.log('Setting loading to false');
      setLoadingSimilar(false);
    }
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        setLoadingSimilar(true); // Ensure loading state is set for similar products
        const response = await eproductsAPI.getProductById(id);
        console.log('API Response:', response);

        if (response && response.data && response.data.product) {
          console.log('Product Data:', response.data.product);
          setProductData(response.data.product);
          
          // Fetch similar products after getting product data
          if (response.data.product.category && response.data.product.category._id) {
            console.log('Fetching similar products for category:', response.data.product.category._id);
            await fetchSimilarProducts(response.data.product.category._id, response.data.product._id);
          } else {
            console.log('No category found for similar products');
            setLoadingSimilar(false);
            setSimilarProducts([]);
          }
        } else {
          console.log('No product data found in response');
          setError('Product not found');
          setLoadingSimilar(false);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
        setLoadingSimilar(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Ensure similar products section is properly initialized
  useEffect(() => {
    console.log('Similar products state changed:', {
      loadingSimilar,
      similarProductsLength: similarProducts?.length || 0,
      similarProducts: similarProducts
    });
  }, [loadingSimilar, similarProducts]);

  // Update displayed images when product data changes
  useEffect(() => {
    if (productData) {
      const images = getAllImages(productData);
      setDisplayedImages(images);
    }
  }, [productData]);

  // Handle color selection - slide to specific color images
  useEffect(() => {
    if (productData && selectedColor !== null && selectedColor !== undefined) {
      const colorStartIndex = getColorImagesStartIndex(productData, selectedColor);
      setCurrentImageIndex(colorStartIndex);
    } else if (productData) {
      // If no color selected, show first general image
      setCurrentImageIndex(0);
    }
  }, [selectedColor, productData]);

  // Initialize AOS animations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      AOS.init({
        duration: 800,
        once: false,
        mirror: true,
        offset: 100,
      });
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !productData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">

        {/* Breadcrumbs */}
        <div className="bg-gray-50 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition">Home</Link>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/" className="hover:text-blue-600 transition">Footwear</Link>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/" className="hover:text-blue-600 transition">Running</Link>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-medium text-gray-900">{productData.name}</span>
            </div>
          </div>
        </div>

        {/* Product Main Section */}
        <section className="py-6 sm:py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              {/* Product Gallery */}
              <div data-aos="fade-right">
                <div
                  className={`overflow-hidden rounded-lg border border-gray-200 relative ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setIsZoomed(false)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    {displayedImages && Array.isArray(displayedImages) && displayedImages.length > 0 ? (
                      <div
                        className={`absolute inset-0 bg-gray-200 flex items-center justify-center ${isZoomed ? 'scale-150' : 'scale-100'} transition-all duration-500 ease-in-out`}
                        style={isZoomed ? {
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                        } : {}}
                      >
                        <img
                          key={`${currentImageIndex}-${selectedColor}`} 
                          src={getImageUrl(displayedImages[currentImageIndex])}
                          alt={productData.name}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                          <span className="text-gray-500">No Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Images Available</span>
                      </div>
                    )}

                  </div>

                  {/* 360 View Button */}
                  <button className="absolute bottom-4 right-4 z-10 bg-white/80 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-white transition-colors shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    360° View
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="flex justify-center mt-4 gap-2">
                  {displayedImages && Array.isArray(displayedImages) && displayedImages.length > 0 ? (
                    displayedImages.map((image, index) => (
                      <div
                        key={index}
                        className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${index === currentImageIndex ? 'border-blue-500' : 'border-transparent'} hover:border-blue-400 transition`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={productData.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                          <span className="text-xs text-gray-500">{index + 1}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-16 h-16 rounded-md overflow-hidden border-2 border-gray-300">
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No Images</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div data-aos="fade-left">
                {/* Product badges */}
                {/* <div className="flex gap-2 mb-3 flex-wrap">
                  {productData.isFeatured === true && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      Featured
                    </span>
                  )}
                  {productData.isBestSeller === true && (
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                      Best Seller
                    </span>
                  )}
                  {productData.isTrending === true && (
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                      Trending
                    </span>
                  )}
                  {productData.isSpecial === true && (
                    <span className="inline-block px-3 py-1 bg-pink-100 text-pink-800 text-xs font-semibold rounded-full">
                      Special
                    </span>
                  )}
                  {productData.isDiscounted === true && productData.discountPercentage > 0 && (
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      {productData.discountPercentage}% OFF
                    </span>
                  )}
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    In Stock ({productData.quantity || 0})
                  </span>
                </div> */}

                {/* Product title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">{productData.name}</h1>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-sm text-gray-600">
                    {typeof productData.category === 'object' && productData.category !== null
                      ? productData.category.name
                      : typeof productData.category === 'string'
                        ? productData.category
                        : ''}
                  </span>
                  <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < Math.floor(productData.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">{productData.rating}</span>
                    <span className="mx-1 text-gray-600">•</span>
                    <button className="text-sm text-blue-600 hover:text-blue-800 transition">
                      {productData.reviews} Reviews
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900 font-alumni-xl">Rs {productData.price || 0}</span>
                    {productData.isDiscounted === true && productData.discountPercentage > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-2">
                        <span className="text-lg sm:text-xl text-gray-500 line-through font-alumni">Rs {Math.round(productData.price / (1 - productData.discountPercentage / 100))}</span>
                        <span className="text-sm text-green-600 font-medium font-alumni">Save Rs {Math.round(productData.price / (1 - productData.discountPercentage / 100)) - productData.price}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Includes taxes and free shipping on orders over Rs 75</p>
                </div>

                {/* Color Selection */}
                {productData.colorQuantities && (() => {
                  try {
                    const colors = JSON.parse(productData.colorQuantities);
                    return Array.isArray(colors) && colors.length > 0 ? (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-medium text-gray-900">Available Colors <span className="text-red-500">*</span></h3>
                        </div>
                        <div className="flex gap-2 sm:gap-3 flex-wrap">
                          {colors.map((colorData, index) => {
                            const isOutOfStock = colorData.quantity <= 0;
                            const isSelected = selectedColor === index;
                            const colorHex = getColorHex(colorData.color);
                            
                            return (
                              <button
                                key={index}
                                onClick={() => !isOutOfStock && setSelectedColor(index)}
                                disabled={isOutOfStock}
                                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                  isSelected
                                    ? 'border-gray-800 scale-110 shadow-lg'
                                    : isOutOfStock
                                    ? 'border-gray-200 cursor-not-allowed opacity-50'
                                    : 'border-gray-300 hover:border-gray-400 shadow-sm'
                                }`}
                                style={{ 
                                  backgroundColor: colorHex,
                                  boxShadow: isSelected ? `0 0 0 2px ${colorHex}, 0 4px 12px rgba(0,0,0,0.15)` : undefined
                                }}
                                title={colorData.color} // Show color name on hover
                              >
                                {/* Selection indicator - Simple white dot */}
                                {isSelected && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-3 h-3 rounded-full bg-transparent shadow-lg"></div>
                                  </div>
                                )}
                                
                                {/* Disabled overlay - Red diagonal line with transparency */}
                                {isOutOfStock && (
                                  <div className="absolute inset-0 rounded-full bg-black backdrop-blur-sm flex items-center justify-center">
                                    <div className="w-[-webkit-fill-available] rounded-full h-1 bg-red-500 transform rotate-45 shadow-sm"></div>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {selectedColor === null && (
                          <p className="text-sm text-red-500 mt-1">Please select a color</p>
                        )}
                      </div>
                    ) : null;
                  } catch (error) {
                    console.error('Error parsing colorQuantities:', error);
                    return null;
                  }
                })()}

                {/* Size Selection */}
                {(() => {
                  const parsedSizes = parseSizes(productData.sizes);
                  console.log('Size parsing debug:', {
                    original: productData.sizes,
                    parsed: parsedSizes,
                    type: typeof productData.sizes,
                    isArray: Array.isArray(productData.sizes)
                  });
                  return parsedSizes.length > 0 && (
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-900">Size <span className="text-red-500">*</span></h3>
                        <button
                          className="text-sm text-blue-600 hover:text-blue-800 transition"
                          onClick={() => setShowSizeGuide(!showSizeGuide)}
                        >
                          Size Guide
                        </button>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                        {parsedSizes.map((size) => (
                          <button
                            key={size}
                            className={`py-2 px-1 border rounded-md text-sm font-medium transition transform hover:scale-105
                            ${selectedSize === size
                                ? 'border-blue-500 bg-blue-50 text-blue-700 scale-105 shadow-md'
                                : 'border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50'}`}
                            onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      {!selectedSize && (
                        <p className="text-sm text-red-500 mt-1">Please select a size</p>
                      )}
                    </div>
                  );
                })()}

                {/* Size Guide Modal */}
                {showSizeGuide && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSizeGuide(false)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Size Guide</h3>
                        <button onClick={() => setShowSizeGuide(false)} className="text-gray-500 hover:text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">US</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UK</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EU</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CM</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {[
                              [7, 6, 40, 25],
                              [7.5, 6.5, 40.5, 25.5],
                              [8, 7, 41, 26],
                              [8.5, 7.5, 42, 26.5],
                              [9, 8, 42.5, 27],
                              [9.5, 8.5, 43, 27.5],
                              [10, 9, 44, 28],
                              [10.5, 9.5, 44.5, 28.5],
                              [11, 10, 45, 29],
                              [11.5, 10.5, 45.5, 29.5],
                              [12, 11, 46, 30],
                            ].map((row, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2 text-sm text-gray-900">{row[0]}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{row[1]}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{row[2]}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{row[3]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-500 mt-4">Sizing may vary slightly depending on the model. If you're between sizes, we recommend sizing up.</p>
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity <span className="text-red-500">*</span></h3>
                  <div className="flex items-center w-28 sm:w-32">
                    <button
                      className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-l-md flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="h-8 sm:h-10 w-10 sm:w-12 border-t border-b border-gray-300 text-center text-gray-900 text-sm sm:text-base"
                    />
                    <button
                      className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-r-md flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {quantity < 1 && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">Please select a quantity greater than 0</p>
                  )}
                </div>

                {/* Add to Cart & Buy Now */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart()}
                    className={`relative flex-1 py-3 px-4 sm:px-8 text-white text-sm sm:text-base font-semibold rounded-full shadow-md overflow-hidden transition-colors duration-500
                      ${canAddToCart()
                        ? 'cursor-pointer'
                        : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    style={{
                      background: canAddToCart()
                        ? 'linear-gradient(to right, #000 0%, #fff 100%)'
                        : undefined,
                      color: canAddToCart() ? '#fff' : undefined,
                      position: 'relative',
                    }}
                  >
                    {canAddToCart() && (
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
                        id="liquid-gradient"
                      />
                    )}
                    <span className="relative z-10 transition-colors duration-500">
                      {!canAddToCart() ? 'Select Size, Color & Quantity' : 'Add to Cart'}
                    </span>
                  </button>
                  <style jsx>{`
                    button[style] {
                      position: relative;
                      overflow: hidden;
                    }
                    button[style]:hover #liquid-gradient {
                      width: 100%;
                      left: 0;
                    }
                  `}</style>
                </div>

                {/* Shipping & Returns */}
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  <div className="mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs sm:text-sm text-gray-600">Free shipping on orders over Rs 75</p>
                    </div>
                  </div>
                  <div className="mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs sm:text-sm text-gray-600">Free returns within 30 days</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs sm:text-sm text-gray-600">1-year manufacturer warranty</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details Tabs */}
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tabs */}
            <div className="mb-8 border-b border-gray-200" data-aos="fade-up">
              <div className="flex flex-wrap -mb-px">
                {['description'].map((tab) => (
                  <button
                    key={tab}
                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-12" data-aos="fade-up">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div>
                  <div className="prose max-w-none">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h3>
                    <p className="text-gray-700 mb-6">{productData.description || 'No description available.'}</p>
                  </div>

                </div>
              )}

              {/* Specifications Tab */}
              {/* {activeTab === 'specifications' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200">
                        {productData.specifications.map((spec, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{spec.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Care Instructions</h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Clean with mild soap and water only
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Air dry away from direct heat or sunlight
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Do not machine wash or tumble dry
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Store in a cool, dry place
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )} */}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                    <button className="mt-4 md:mt-0 inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                      Write a Review
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="md:w-1/3 bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center mb-3">
                        <span className="text-3xl font-bold text-gray-900 mr-2">{productData.rating}</span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < Math.floor(productData.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{productData.reviews} verified reviews</p>

                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center">
                            <div className="w-12 text-sm text-gray-600">{star} stars</div>
                            <div className="w-full h-2 bg-gray-200 rounded-full mx-2">
                              <div className="h-2 bg-yellow-400 rounded-full" style={{ width: star === 5 ? '70%' : star === 4 ? '20%' : star === 3 ? '5%' : star === 2 ? '3%' : '2%' }}></div>
                            </div>
                            <div className="w-10 text-right text-xs text-gray-600">
                              {star === 5 ? '70%' : star === 4 ? '20%' : star === 3 ? '5%' : star === 2 ? '3%' : '2%'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:w-2/3">
                      {/* Sample reviews */}
                      <div className="space-y-6">
                        {[
                          { name: "Alex Johnson", date: "2 months ago", rating: 5, comment: "Absolutely love these shoes! Super comfortable right out of the box and they've held up well for my daily runs. The responsive cushioning is really noticeable, especially on longer distances.", verified: true },
                          { name: "Sam Taylor", date: "1 month ago", rating: 4, comment: "Great shoes overall. The fit is true to size and the cushioning is excellent. Took off one star because the laces are a bit too short for my liking, but that's a minor issue.", verified: true },
                          { name: "Jordan Williams", date: "2 weeks ago", rating: 5, comment: "Best running shoes I've ever owned. Perfect amount of support without feeling bulky. Already ordered a second pair in another color!", verified: true }
                        ].map((review, index) => (
                          <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-900 mr-2">{review.name}</span>
                                  {review.verified && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Verified Purchase</span>
                                  )}
                                </div>
                                <div className="flex items-center mt-1">
                                  <div className="flex text-yellow-400 mr-1">
                                    {[...Array(5)].map((_, i) => (
                                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500">{review.date}</span>
                                </div>
                              </div>
                              <button className="text-gray-400 hover:text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                              </button>
                            </div>
                            <p className="mt-2 text-gray-600">{review.comment}</p>
                            <div className="mt-3 flex items-center space-x-4">
                              <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905 0 .905.714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                Helpful (12)
                              </button>
                              <button className="text-sm text-gray-500 hover:text-gray-700">
                                Reply
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button className="w-full mt-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                        Load More Reviews
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* You May Also Like Section */}
        <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12" data-aos="fade-up">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">You May Also Like</h2>
                <p className="text-gray-600">Discover similar products that match your style</p>
              </div>
            </div>

            {(() => {
              console.log('Similar products render check:', {
                loadingSimilar,
                similarProductsLength: similarProducts.length,
                similarProducts: similarProducts
              });
              return null;
            })()}
            {loadingSimilar ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading similar products...</p>
              </div>
            ) : similarProducts && Array.isArray(similarProducts) && similarProducts.length > 0 ? (
              <div data-aos="fade-up" data-aos-delay="200">
                {similarProducts.length === 1 ? (
                  // Single product - display in centered grid
                  <div className="flex justify-center">
                    <div className="w-full max-w-sm">
                      <ProductCard
                        product={similarProducts[0]}
                        className="mx-auto"
                      />
                    </div>
                  </div>
                ) : (
                  // Multiple products - use slider
                  <Slider {...getSimilarProductsSettings(similarProducts.length)} className="similar-products-slider">
                    {similarProducts.map((product, index) => (
                      <div key={product._id || index} className="px-1" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                        <ProductCard
                          product={product}
                          className="max-w-sm mx-auto"
                        />
                      </div>
                    ))}
                  </Slider>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No similar products available at the moment.</p>
                <div className="mt-4 text-xs text-gray-400">
                  Debug: Loading: {loadingSimilar ? 'Yes' : 'No'}, Products: {similarProducts?.length || 0}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter */}
        <Newsletter />

      </div>
    </Layout>
  );
}
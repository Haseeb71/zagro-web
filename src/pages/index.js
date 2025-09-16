import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import Slider from "react-slick";
import { useRouter } from "next/router";
import { useAppDispatch } from "../redux/hooks";
import { addToCart } from "../redux/slices/cartSlice";

import Layout from "../components/Layout";
import Modal from "../components/Modal";
import productsAPI from "../APIs/eproducts";
import categoriesAPI from "../APIs/categories";
import ProductCard from "../components/ProductCard";
import PromotionModal from "../components/PromotionModal";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [BestsellersProducts, setBestsellersProducts] = useState([]);
  const [productsByType, setProductsByType] = useState({
    featured: [],
    new: [],
    bestseller: [],
    trending: [],
    special: [],
    discounted: []
  });

  const router = useRouter();
  const dispatch = useAppDispatch();

  // Function to get dynamic background image and color based on category name
  const getCategoryStyle = (categoryName) => {
    const name = categoryName.toLowerCase();

    // Define color gradients based on category names
    const colorMap = {
      'men': 'from-blue-400 to-blue-600',
      'women': 'from-pink-400 to-pink-600',
      'kids': 'from-yellow-400 to-yellow-600',
      'sports': 'from-green-400 to-green-600',
      'running': 'from-blue-400 to-blue-600',
      'casual': 'from-purple-400 to-purple-600',
      'athletic': 'from-green-400 to-green-600',
      'formal': 'from-gray-400 to-gray-600',
      'sneakers': 'from-orange-400 to-orange-600',
      'boots': 'from-brown-400 to-brown-600'
    };

    // Get color gradient or default
    const color = Object.keys(colorMap).find(key => name.includes(key))
      ? colorMap[Object.keys(colorMap).find(key => name.includes(key))]
      : 'from-indigo-400 to-indigo-600';

    // Generate dynamic background image URL based on category name
    const imageUrl = `https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop&crop=center&auto=format&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&text=${encodeURIComponent(categoryName)}`;

    return { color, imageUrl };
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const newArrivals = await productsAPI.getNewArrivals();
      const trendingProducts = await productsAPI.getTrendingProducts();
      const BestsellersProducts = await productsAPI.getBestSellersProducts();
      
      console.log("fetching newArrivals products ---", newArrivals?.data?.products);
      console.log("fetching trendingProduct products ---", trendingProducts?.data?.products);
      console.log("fetching bestSellersProduct products ---", BestsellersProducts?.data?.products);
      setNewArrivals(newArrivals?.data?.products);
      setTrendingProducts(trendingProducts?.data?.products);
      setBestsellersProducts(BestsellersProducts?.data?.products);
    } catch (error) {
      setNewArrivals([]);
      setTrendingProducts([]);
      setBestsellersProducts([]);
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoriesAPI.getAllCategories();
      if (response.success && response.categories) {
        // Take only first 3 categories
        setCategories(response.categories.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Add to cart function with essential data only
  const handleAddToCart = (product) => {
    const essentialData = {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0].url : null,
      quantity: 1
    };
    
    dispatch(addToCart(essentialData));
  };

  // Banner slider settings
  const bannerSliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    fade: true,
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    dotsClass: 'slick-dots custom-dots',
    pauseOnHover: true,
    pauseOnFocus: true,
  };

  // Enhanced banner images with more content - using proper static paths
  const bannerImages = [
    {
      id: 1,
      image: "/banner1.jpg",
      title: "Step into the Future",
      subtitle: "Experience ultimate comfort with our revolutionary shoe technology",
      ctaText: "Shop Now",
      ctaSecondary: "View Collection",
      backgroundGradient: "from-blue-900/80 via-blue-800/60 to-transparent"
    },
    {
      id: 2,
      image: "/banner2.webp",
      title: "Summer Collection",
      subtitle: "Lightweight shoes for your active lifestyle",
      ctaText: "Explore Collection",
      ctaSecondary: "Learn More",
      backgroundGradient: "from-purple-900/80 via-purple-800/60 to-transparent"
    },
    {
      id: 3,
      image: "/banner3.avif",
      title: "Limited Edition Series",
      subtitle: "Exclusive designs available for a limited time only",
      ctaText: "View Limited Edition",
      ctaSecondary: "Join Waitlist",
      backgroundGradient: "from-gray-900/80 via-gray-800/60 to-transparent"
    }
  ];

  // Custom Arrow Components
  function CustomPrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 cursor-pointer group"
        onClick={onClick}
      >
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </div>
    );
  }

  function CustomNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 cursor-pointer group"
        onClick={onClick}
      >
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    );
  }

  // Slider settings
  const featuredSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
  };

  const productSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  // Dynamic slider settings based on product count
  const getDynamicSliderSettings = (productCount) => {
    const baseSettings = {
      dots: productCount > 1,
      infinite: productCount > 1,
      speed: 500,
      slidesToShow: Math.min(productCount, 4),
      slidesToScroll: 1,
      autoplay: false,
      centerMode: false,
      centerPadding: '0px',
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(productCount, 3),
            centerMode: false,
            centerPadding: '0px',
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: Math.min(productCount, 2),
            centerMode: false,
            centerPadding: '0px',
          }
        },
        {
          breakpoint: 640,
          settings: {
            slidesToShow: 1,
            centerMode: false,
            centerPadding: '0px',
          }
        }
      ]
    };

    return baseSettings;
  };

  // Category slider settings
  const getCategorySliderSettings = (categoryCount) => {
    return {
      dots: categoryCount > 1,
      infinite: categoryCount > 1,
      speed: 500,
      slidesToShow: Math.min(categoryCount, 3),
      slidesToScroll: 1,
      autoplay: false,
      centerMode: false,
      centerPadding: '0px',
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(categoryCount, 3),
            slidesToScroll: 1,
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: Math.min(categoryCount, 2),
            slidesToScroll: 1,
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          }
        }
      ]
    };
  };

  // Show promotion modal automatically when page loads (with user preference check)
  useEffect(() => {
    // Check if user has previously dismissed the promotion modal
    const hasDismissedPromotion = localStorage.getItem('promotionDismissed');
    const lastDismissedDate = localStorage.getItem('promotionDismissedDate');
    
    // If user dismissed within last 7 days, don't show again
    if (hasDismissedPromotion && lastDismissedDate) {
      const sevenDaysAgo = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
      const dismissedDate = new Date(lastDismissedDate).getTime();
      
      if (dismissedDate > sevenDaysAgo) {
        return; // Don't show promotion modal
      }
    }

    // Show promotion modal after a short delay to ensure page is loaded
    const timer = setTimeout(() => {
      setIsPromotionModalOpen(true);
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

  // Auto-close promotion modal after 1 minute
  useEffect(() => {
    if (isPromotionModalOpen) {
      const autoCloseTimer = setTimeout(() => {
        setIsPromotionModalOpen(false);
      }, 60000); // 60 seconds = 1 minute

      return () => clearTimeout(autoCloseTimer);
    }
  }, [isPromotionModalOpen]);

  // Helper function to get products by type
  const getProductsByType = (type) => {
    return productsByType[type] || [];
  };

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${imagePath.replace(/\\/g, '/')}`;
  };

  // Function to close Promotion Modal
  const handleClosePromotionModal = () => {
    setIsPromotionModalOpen(false);
  };

  // Function to handle "Maybe Later" - remember user choice for 7 days
  const handleMaybeLater = () => {
    // Save user preference to localStorage
    localStorage.setItem('promotionDismissed', 'true');
    localStorage.setItem('promotionDismissedDate', new Date().toISOString());
    setIsPromotionModalOpen(false);
  };

  // Function to reset promotion preferences (for testing or admin use)
  const resetPromotionPreferences = () => {
    localStorage.removeItem('promotionDismissed');
    localStorage.removeItem('promotionDismissedDate');
    console.log('Promotion preferences reset. Banner will show again on next visit.');
  };

  // Expose reset function to window for testing (remove in production)
  if (typeof window !== 'undefined') {
    window.resetPromotionPreferences = resetPromotionPreferences;
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div>
      {/* Custom CSS for enhanced animations */}
      <style jsx>{`
        .banner-content {
          animation: fadeInUp 1s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      {/* Hero Banner Slider - Full Page */}
      <section className="relative h-screen overflow-hidden">
        <Slider {...bannerSliderSettings} className="h-full">
          {bannerImages.map((banner, index) => (
            <div key={banner.id} className="relative h-screen">
              {/* Background image with parallax effect */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${banner.image})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  width: '100%',
                  height: '100%',
                }}
              />

              {/* Gradient overlay - separate from background image */}
              <div className="absolute inset-0 bg-transparent" />

              {/* Animated overlay patterns */}
              <div className="absolute inset-0 bg-transparent" />
              <div className="absolute inset-0 bg-transparent" />

              {/* Content overlay */}
              <div className="absolute inset-0 z-10 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-3xl banner-content">
                    {/* Badge */}
                    <div className="slide-in-left mb-4 sm:mb-6">
                      <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-transparent border border-white/20 rounded-full text-white text-xs sm:text-sm font-medium">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
                        New Collection Available
                      </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 tracking-tight text-white drop-shadow-lg slide-in-left">
                      <span className="block">{banner.title.split(' ')[0]}</span>
                      <span className="block text-blue-300">{banner.title.split(' ').slice(1).join(' ')}</span>
                    </h1>

                    {/* Subtitle */}
                    <div className="relative z-10 mb-6 sm:mb-8 slide-in-left">
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 font-light leading-relaxed max-w-2xl">
                        {banner.subtitle}
                      </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 slide-in-left">
                      <button className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {banner.ctaText}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      </button>
                      <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-white/30 hover:border-white/70 hover:bg-transparent text-white text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <span className="flex items-center justify-center gap-2">
                          {banner.ctaSecondary}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                      </button>
                    </div>

                    {/* Features */}
                    <div className="mt-8 sm:mt-12 slide-in-left">
                      <div className="flex flex-wrap gap-4 sm:gap-6 text-white/80">
                        {['Free Shipping', '30-Day Returns', 'Premium Quality'].map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scroll indicator */}
              <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
                <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center">
                  <div className="w-0.5 h-2 sm:w-1 sm:h-3 bg-white/70 rounded-full mt-1.5 sm:mt-2 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* New Arrivals Slider */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4" data-aos="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">New Arrivals</h2>
            <Link
              href="/categories/new-arrivals"
              className="group text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors duration-300"
            >
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : newArrivals?.length > 0 ? (
            <div data-aos="fade-up" data-aos-delay="200">
              <Slider {...getDynamicSliderSettings(newArrivals.length)} className="product-slider">
                {newArrivals.map((product, index) => (
                  <div key={product.id || index} className="px-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                    <ProductCard
                      product={product}
                      className="max-w-sm mx-auto"
                    />
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No new arrivals available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Bestsellers Grid */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4" data-aos="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Bestsellers</h2>
            <Link
              href="/categories/bestsellers"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : BestsellersProducts?.length > 0 ? (
            <div data-aos="fade-up" data-aos-delay="200">
              <Slider {...getDynamicSliderSettings(BestsellersProducts.length)} className="bestseller-slider">
                {BestsellersProducts.map((product, index) => (
                  <div key={product.id || index} className="px-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                    <ProductCard
                      product={product}
                      className="max-w-sm mx-auto"
                    />
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No bestsellers available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-12 gap-4" data-aos="fade-up">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Trending Now</h2>
              <p className="text-sm sm:text-base text-gray-600">Products that are currently trending among our customers</p>
            </div>
            <Link
              href="/categories/trending"
              className="group text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 transition-colors duration-300"
            >
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading trending products...</p>
            </div>
          ) : trendingProducts.length > 0 ? (
            <div data-aos="fade-up" data-aos-delay="200">
              <Slider {...getDynamicSliderSettings(trendingProducts.length)} className="trending-slider">
                {trendingProducts.map((product, index) => (
                  <div key={product.id || index} className="px-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                    <ProductCard
                      product={product}
                      className="max-w-sm mx-auto"
                    />
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No trending products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-12 gap-4" data-aos="fade-up">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Special Offers</h2>
              <p className="text-sm sm:text-base text-gray-600">Limited time deals and exclusive offers just for you</p>
            </div>
            <Link
              href="/products"
              className="group text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 transition-colors duration-300"
            >
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading special offers...</p>
            </div>
          ) : (newArrivals.length > 0 || trendingProducts.length > 0) ? (
            <div data-aos="fade-up" data-aos-delay="200">
              <Slider {...getDynamicSliderSettings([...newArrivals, ...trendingProducts].slice(0, 8).length)} className="special-offers-slider">
                {[...newArrivals, ...trendingProducts].slice(0, 8).map((product, index) => (
                  <div key={product.id || index} className="px-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                    <ProductCard
                      product={product}
                      className="max-w-sm mx-auto"
                    />
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No special offers available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Category Banners */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center" data-aos="fade-up">Shop by Category</h2>
          
          {categories.length > 0 ? (
            <div data-aos="fade-up" data-aos-delay="200">
              <Slider {...getCategorySliderSettings(categories.length)} className="category-slider">
                {categories.map((category, index) => {              
                  return (
                    <div key={category._id || index} className="px-2" data-aos="fade-up" data-aos-delay={index * 100}>
                      <div
                        className="relative h-80 rounded-xl overflow-hidden shadow-md group cursor-pointer"
                        onClick={() => router.push(`/categories/${category.slug}`)}
                      >
                        {/* Category Image */}
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/30 opacity-60 group-hover:opacity-70 transition"></div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                          <p className="text-white text-sm mb-4 opacity-90">{category.description}</p>
                          <button className="cursor-pointer mt-4 px-6 py-2 bg-white text-gray-900 font-medium rounded-full shadow transform group-hover:scale-105 transition">
                            Explore
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Slider>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading categories...</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter - Enhanced */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-blue-200/50 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -top-20 w-60 h-60 bg-purple-200/50 rounded-full blur-3xl"></div>
        </div>

        <div
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
          data-aos="fade-up"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-gray-800">Join Our Community</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
            Subscribe to get special offers, free giveaways, and new release notifications
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 text-black border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-full shadow-sm text-lg"
            />
            <button className="cursor-pointer px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Promotion Modal */}
      {isPromotionModalOpen && (
        <PromotionModal
          isOpen={isPromotionModalOpen}
          onClose={handleClosePromotionModal}
          onMaybeLater={handleMaybeLater}
        />
      )}
    </div>
  );
}
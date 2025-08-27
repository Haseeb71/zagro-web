import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import Link from "next/link";
import Slider from "react-slick";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ProductQuickView from "../components/ProductQuickView";
import productsAPI from "../APIs/eproducts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productsByType, setProductsByType] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await productsAPI.getLandingPageProducts();
      console.log("fetching products ---", res.data.productsByType);
      
      if (res && res.data.productsByType) {
        // Convert array to object for easier access
        const productsMap = {};
        res.data.productsByType.forEach(item => {
          productsMap[item.type] = item.products || [];
        });
        setProductsByType(productsMap);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get products by type
  const getProductsByType = (type) => {
    return productsByType[type] || [];
  };

  // Function to handle Quick View
  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  // Function to close Quick View
  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setSelectedProduct(null);
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

    // If only 1 product, disable slider functionality
    if (productCount <= 1) {
      baseSettings.infinite = false;
      baseSettings.dots = false;
      baseSettings.arrows = false;
    }

    return baseSettings;
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Layout>
      <div className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Custom CSS for enhanced animations */}
        <style jsx>{`
          .custom-dots {
            bottom: 30px !important;
          }
          .custom-dots li {
            margin: 0 8px;
          }
          .custom-dots li button {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            border: none;
            transition: all 0.3s ease;
          }
          .custom-dots li.slick-active button {
            background: white;
            transform: scale(1.3);
          }
          .custom-dots li button:hover {
            background: rgba(255, 255, 255, 0.8);
          }
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
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent"
                />

                {/* Animated overlay patterns */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Content overlay */}
                <div className="absolute inset-0 z-10 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-3xl banner-content">
                      {/* Badge */}
                      <div className="slide-in-left mb-6">
                        <span className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                          New Collection Available
                        </span>
                      </div>

                      {/* Main Title */}
                      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-white drop-shadow-lg slide-in-left">
                        <span className="block">{banner.title.split(' ')[0]}</span>
                        <span className="block text-blue-300">{banner.title.split(' ').slice(1).join(' ')}</span>
                      </h1>

                      {/* Subtitle */}
                      <div className="relative z-10 mb-8 slide-in-left">
                        <p className="text-xl md:text-2xl text-blue-100 font-light leading-relaxed max-w-2xl">
                          {banner.subtitle}
                        </p>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex flex-wrap gap-4 slide-in-left">
                        <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                          <span className="relative z-10 flex items-center gap-2">
                            {banner.ctaText}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </span>
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        </button>
                        <button className="group px-8 py-4 bg-transparent border-2 backdrop-blur-sm bg-white/10 border-white/30 hover:border-white/70 hover:bg-white/20 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                          <span className="flex items-center gap-2">
                            {banner.ctaSecondary}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </span>
                        </button>
                      </div>

                      {/* Features */}
                      <div className="mt-12 slide-in-left">
                        <div className="flex flex-wrap gap-6 text-white/80">
                          {['Free Shipping', '30-Day Returns', 'Premium Quality'].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span className="text-sm font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
                  <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section>

        {/* New Arrivals Slider */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12" data-aos="fade-up">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">New Arrivals</h2>
                <p className="text-gray-600">Discover our latest collection of premium footwear</p>
              </div>
              <Link
                href="/products"
                className="group text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors duration-300"
              >
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : getProductsByType('new').length > 0 ? (
              <div data-aos="fade-up" data-aos-delay="200">
                <Slider {...getDynamicSliderSettings(getProductsByType('new').length)} className="product-slider">
                  {getProductsByType('new').map((product, index) => (
                    <div key={product.id || index} className="px-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-2 max-w-sm mx-auto">
                        <div className="relative h-64 overflow-hidden">
                          {/* Product Image */}
                          {product.image ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}${product.image}`}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">No Image</span>
                            </div>
                          )}

                          <div className="absolute top-4 right-4">
                            <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                              {product.category || 'New'}
                            </span>
                          </div>

                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button 
                              onClick={() => handleQuickView(product)}
                              className="px-6 py-3 bg-white text-blue-900 font-semibold rounded-full shadow-lg transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                            >
                              Quick View
                            </button>
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                            {product.name || 'Product Name'}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 font-medium">{product.rating || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-gray-900">
                              ${product.price || 0}
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="ml-2 text-sm text-gray-500 line-through">${product.originalPrice}</span>
                              )}
                            </span>
                            <button className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-all duration-300 hover:scale-110">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
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
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8" data-aos="fade-up">
              <h2 className="text-3xl font-bold text-gray-900">Bestsellers</h2>
              <Link
                href="/bestsellers"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : getProductsByType('bestseller').length > 0 ? (
              <div data-aos="fade-up" data-aos-delay="200">
                <Slider {...getDynamicSliderSettings(getProductsByType('bestseller').length)} className="bestseller-slider">
                  {getProductsByType('bestseller').map((product, index) => (
                    <div key={product.id || index} className="px-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group">
                        <div className="relative h-64 overflow-hidden">
                          {/* Product Image */}
                          {product.image ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}${product.image}`}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">No Image</span>
                            </div>
                          )}

                          <div className="absolute top-0 left-0 p-2">
                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                              </svg>
                              Hot
                            </span>
                          </div>

                          {product.sold && (
                            <div className="absolute bottom-0 right-0 p-2 bg-white/80 backdrop-blur-sm rounded-tl-lg text-xs font-medium text-gray-700">
                              {product.sold} sold
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleQuickView(product)}
                                className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition"
                                title="Quick View"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex justify-between mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{product.name || 'Product Name'}</h3>
                            <span className="text-sm font-medium text-gray-600">{product.category || 'Category'}</span>
                          </div>

                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{product.rating || 0}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">
                              ${product.price || 0}
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="ml-2 text-sm text-gray-500 line-through">${product.originalPrice}</span>
                              )}
                            </span>
                            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition flex items-center gap-1">
                              Add
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
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
        <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12" data-aos="fade-up">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Trending Now</h2>
                <p className="text-gray-600">Products that are currently trending among our customers</p>
              </div>
              <Link
                href="/trending"
                className="group text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 transition-colors duration-300"
              >
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading trending products...</p>
              </div>
            ) : getProductsByType('trending').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-aos="fade-up" data-aos-delay="200">
                {getProductsByType('trending').slice(0, 6).map((product, index) => (
                  <div key={product.id || index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                    <div className="relative h-64 overflow-hidden">
                      {/* Product Image */}
                      {product.image ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${product.image}`}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">No Image</span>
                        </div>
                      )}

                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                          Trending
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <button 
                          onClick={() => handleQuickView(product)}
                          className="px-6 py-2 bg-white text-purple-900 font-semibold rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                        {product.name || 'Product Name'}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{product.rating || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">
                          ${product.price || 0}
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="ml-2 text-sm text-gray-500 line-through">${product.originalPrice}</span>
                          )}
                        </span>
                        <button className="p-3 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-full transition-all duration-300 hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No trending products available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Featured Products Hero Slider */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-aos="fade-up">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading featured products...</p>
              </div>
            ) : getProductsByType('featured').length > 0 ? (
              <Slider {...featuredSliderSettings} className="featured-slider">
                {getProductsByType('featured').map((product) => (
                  <div key={product.id} className="relative">
                    <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent z-10"></div>

                      {/* Product Image */}
                      {product.image ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${product.image}`}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}

                      <div className="absolute left-8 bottom-8 z-20 max-w-lg">
                        <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full mb-3">
                          {product.badge || 'Featured'}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">{product.name || 'Product Name'}</h2>
                        <p className="text-xl text-white mb-4">${product.price || 0}</p>
                        <p className="text-white mb-4">{product.description.slice(0, 100) || 'Product Description'}</p>
                        {/* {product.colors && product.colors.length > 0 && (
                          <div className="flex gap-2 mb-4">
                            {product.colors.map((color) => (
                              <div
                                key={color}
                                className="w-6 h-6 rounded-full border-2 border-white"
                                style={{ backgroundColor: color }}
                              ></div>
                            ))}
                          </div>
                        )} */}
                        <button className="px-6 py-2 bg-white text-blue-900 font-semibold rounded-full shadow hover:bg-blue-50 transition">
                          Shop Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No featured products available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Special Offers Section */}
        <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12" data-aos="fade-up">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Special Offers</h2>
                <p className="text-gray-600">Limited time deals and exclusive offers just for you</p>
              </div>
              <Link
                href="/offers"
                className="group text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 transition-colors duration-300"
              >
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading special offers...</p>
              </div>
            ) : (getProductsByType('special').length > 0 || getProductsByType('discounted').length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up" data-aos-delay="200">
                {/* Combine special and discounted products */}
                {[...getProductsByType('special'), ...getProductsByType('discounted')].slice(0, 8).map((product, index) => (
                  <div key={product.id || index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                    <div className="relative h-48 overflow-hidden">
                      {/* Product Image */}
                      {product.image ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${product.image}`}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">No Image</span>
                        </div>
                      )}

                      {/* Discount Badge */}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-2 left-2">
                          <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button 
                          onClick={() => handleQuickView(product)}
                          className="px-4 py-2 bg-white text-orange-900 font-semibold rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
                        {product.name || 'Product Name'}
                      </h3>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">${product.price || 0}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>

                      <button className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Running Collection", image: "/images/categories/running.jpg", color: "from-blue-400 to-blue-600" },
                { name: "Casual Wear", image: "/images/categories/casual.jpg", color: "from-purple-400 to-purple-600" },
                { name: "Athletic Performance", image: "/images/categories/athletic.jpg", color: "from-green-400 to-green-600" }
              ].map((category, index) => (
                <div
                  key={index}
                  className="relative h-80 rounded-xl overflow-hidden shadow-md group cursor-pointer"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  {/* Replace with actual images */}
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Image: {`${process.env.NEXT_PUBLIC_API_URL}${category.image}`}</span>
                  </div>

                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-60 group-hover:opacity-70 transition`}></div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                    <button className="mt-4 px-6 py-2 bg-white text-gray-900 font-medium rounded-full shadow transform group-hover:scale-105 transition">
                      Explore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New Featured Product Section like the image */}
        <section className="py-16 bg-gradient-to-r from-gray-900 to-black relative overflow-hidden">
          {/* Diagonal geometric elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[80%] bg-gray-800 transform rotate-12 z-0"></div>
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[70%] bg-gray-800 transform -rotate-12 z-0"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Product Image */}
              <div
                className="relative"
                data-aos="fade-right"
                data-aos-delay="100"
              >
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] h-[20px] bg-gradient-to-r from-yellow-400 to-yellow-200 filter blur-xl opacity-70 rounded-full"></div>

                <Image
                  src="/images/shoes/featured-shoe.png"
                  alt="EVAPOR8 2.0"
                  width={600}
                  height={400}
                  className="relative z-10"
                />

                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <div className="inline-block bg-black/80 backdrop-blur-sm px-6 py-2 rounded-full">
                    <Image
                      src="/images/logo-evapor8.png"
                      alt="EVAPOR8 2.0"
                      width={200}
                      height={50}
                    />
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="text-white" data-aos="fade-left" data-aos-delay="300">
                <div className="mb-2">
                  <span className="text-sm text-yellow-400 font-medium tracking-wider">REVOLUTIONARY TECHNOLOGY</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
                  EVAPOR8 2.0 – STAY COOL, <br />
                  <span className="text-yellow-400">MOVE FAST</span>
                </h2>

                <div className="w-20 h-1 bg-yellow-400 mb-6 mt-4"></div>

                <p className="text-gray-300 mb-8 text-lg">
                  Engineered for peak breathability and all-day comfort, Evapor8 2.0
                  keeps you light on your feet with its ultra-breathable design and
                  dynamic support.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                    <span>Ultra-lightweight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                    <span>Breathable mesh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                    <span>Dynamic support</span>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-2xl font-bold">$149.99</span>
                  <span className="ml-2 text-gray-400 line-through">$189.99</span>
                  <span className="ml-3 bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded">SAVE 20%</span>
                </div>

                <button className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black text-lg font-semibold rounded-full shadow-lg hover:shadow-yellow-400/30 transition transform hover:scale-105">
                  SHOP NOW
                </button>

                <div className="mt-4 text-sm text-gray-400">
                  *Now available in 3 colors
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter - Enhanced */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-blue-200/50 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -top-20 w-60 h-60 bg-purple-200/50 rounded-full blur-3xl"></div>
          </div>
          <div
            className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
            data-aos="fade-up"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-800">Join Our Community</h2>
            <p className="text-xl text-gray-600 mb-8">
              Subscribe to get special offers, free giveaways, and new release notifications
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-full shadow-sm text-lg"
              />
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Quick View Modal */}
      <Modal 
        isOpen={isQuickViewOpen} 
        onClose={handleCloseQuickView}
        size="xl"
      >
        {selectedProduct && (
          <ProductQuickView product={selectedProduct} />
        )}
      </Modal>
    </Layout>
  );
}

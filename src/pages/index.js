import Image from "next/image";

import { Geist, Geist_Mono } from "next/font/google";

import { useEffect, useState } from "react";

import Link from "next/link";

import Slider from "react-slick";

import Layout from "../components/Layout";

import Modal from "../components/Modal";


import productsAPI from "../APIs/eproducts";

import ProductCard from "../components/ProductCard";

import PromotionModal from "../components/PromotionModal";

import categoriesAPI from "../APIs/categories";



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


  const [productsByType, setProductsByType] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  const [categories, setCategories] = useState([]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);

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

  // Function to fetch categories
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

  useEffect(() => {

    fetchProducts();
    fetchCategories();

  }, []);



  // Show promotion modal automatically when page loads

  useEffect(() => {

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



  const fetchProducts = async () => {

    try {

      setIsLoading(true);

      

      // Fetch products by different types

      const [featuredRes, newRes, bestsellerRes, trendingRes, specialRes, discountedRes] = await Promise.all([

        productsAPI.getProducts({ type: "featured" }),

        productsAPI.getProducts({ type: "new" }),

        productsAPI.getProducts({ type: "bestseller" }),

        productsAPI.getProducts({ type: "trending" }),

        productsAPI.getProducts({ type: "special" }),

        productsAPI.getProducts({ type: "discounted" })

      ]);



      console.log("fetching products ---", { featuredRes, newRes, bestsellerRes, trendingRes, specialRes, discountedRes });

      

      // Set products by type

      setProductsByType({

        featured: featuredRes?.data?.products || [],

        new: newRes?.data?.products || [],

        bestseller: bestsellerRes?.data?.products || [],

        trending: trendingRes?.data?.products || [],

        special: specialRes?.data?.products || [],

        discounted: discountedRes?.data?.products || []

      });

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

      dots: false, // No dots on desktop - always show 4 products

      infinite: false, // No infinite scroll on desktop

      speed: 500,

      slidesToShow: 4, // Always show 4 products on desktop

      slidesToScroll: 1,

      autoplay: false,

      centerMode: false,

      centerPadding: '0px',

      responsive: [

        {

          breakpoint: 1024,

          settings: {

            slidesToShow: 4, // Always show 4 products on large screens

            dots: false, // Never show dots on large screens

            infinite: false, // Never infinite scroll on large screens

            centerMode: false,

            centerPadding: '0px',

          }

        },

        {

          breakpoint: 768,

          settings: {

            slidesToShow: 3, // Show 3 products on tablet

            dots: productCount > 3, // Dots only if more than 3 products

            infinite: productCount > 3,

            centerMode: false,

            centerPadding: '0px',

          }

        },

        {

          breakpoint: 640,

          settings: {

            slidesToShow: 2, // Show 2 products on mobile

            dots: productCount > 2, // Dots only if more than 2 products

            infinite: productCount > 2,

            centerMode: false,

            centerPadding: '0px',

          }

        },

        {

          breakpoint: 480,

          settings: {

            slidesToShow: 1, // Show 1 product on small mobile

            dots: productCount > 1, // Dots only if more than 1 product

            infinite: productCount > 1,

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

                href="/categories/all?isNew=true"

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

                    <div key={product._id || index} className="px-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>

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

        <section className="py-12 bg-white">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex justify-between items-center mb-8" data-aos="fade-up">

              <h2 className="text-3xl font-bold text-gray-900">Bestsellers</h2>

              <Link

                href="/categories/all?isBestSeller=true"

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

                    <div key={product._id || index} className="px-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>

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

        <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex justify-between items-center mb-12" data-aos="fade-up">

              <div>

                <h2 className="text-4xl font-bold text-gray-900 mb-2">Trending Now</h2>

                <p className="text-gray-600">Products that are currently trending among our customers</p>

              </div>

              <Link

                href="/categories/all?isTrending=true"

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

              <div data-aos="fade-up" data-aos-delay="200">

                <Slider {...getDynamicSliderSettings(getProductsByType('trending').length)} className="trending-slider">

                  {getProductsByType('trending').map((product, index) => (

                    <div key={product._id || index} className="px-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>

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



        {/* Featured Products Hero Slider - COMMENTED OUT */}
        {false && (
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

                  <div key={product._id} className="relative">

                    <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-lg">

                      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent z-10"></div>



                      {/* Product Image */}

                      {product.images && product.images.length > 0 ? (

                        <Image

                          src={getImageUrl(product.images[0])}

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

                          Featured

                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">{product.name || 'Product Name'}</h2>

                        <p className="text-xl text-white mb-4">PKR {product.price || 0}</p>

                        <p className="text-white mb-4">{product.description?.slice(0, 100) || 'Product Description'}</p>

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
        )}



        {/* Special Offers Section */}

        <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex justify-between items-center mb-12" data-aos="fade-up">

              <div>

                <h2 className="text-4xl font-bold text-gray-900 mb-2">Special Offers</h2>

                <p className="text-gray-600">Limited time deals and exclusive offers just for you</p>

              </div>

              <Link

                href="/categories/all?isSpecial=true"

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

              <div data-aos="fade-up" data-aos-delay="200">

                <Slider {...getDynamicSliderSettings([...getProductsByType('special'), ...getProductsByType('discounted')].length)} className="special-offers-slider">

                  {/* Combine special and discounted products */}

                  {[...getProductsByType('special'), ...getProductsByType('discounted')].map((product, index) => (

                    <div key={product._id || index} className="px-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>

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

            {categoriesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="relative h-80 rounded-xl overflow-hidden shadow-md bg-gray-200 animate-pulse"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((category, index) => {
                  const { color, imageUrl } = getCategoryStyle(category.name);
                  return (
                    <Link
                      key={category._id || index}
                      href={`/categories/${category.slug}`}
                      className="relative h-80 rounded-xl overflow-hidden shadow-md group cursor-pointer"
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                    >
                      {/* Dynamic Background Image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url(${imageUrl})`
                        }}
                      ></div>

                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-60 group-hover:opacity-70 transition`}></div>

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                          {category.name}
                        </h3>
                        <button className="mt-4 px-6 py-2 bg-white text-gray-900 font-medium rounded-full shadow transform group-hover:scale-105 transition">
                          Explore
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

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

                  <span className="text-2xl font-bold">PKR 149.99</span>

                  <span className="ml-2 text-gray-400 line-through">PKR 189.99</span>

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







      {/* Promotion Modal */}

      <PromotionModal 

        isOpen={isPromotionModalOpen} 

        onClose={handleClosePromotionModal}

      />

    </Layout>

  );

}
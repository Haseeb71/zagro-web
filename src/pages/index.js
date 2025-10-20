import Image from "next/image";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/router";

import Slider from "react-slick";

import Layout from "../components/Layout";

import Modal from "../components/Modal";

import Newsletter from "../components/Newsletter";


import productsAPI from "../APIs/eproducts";

import ProductCard from "../components/ProductCard";

import PromotionModal from "../components/PromotionModal";

import categoriesAPI from "../APIs/categories";

import promotionsAPI from "../APIs/promotions";

import LogoLoop from "../components/LogoLoop";

import { SiNike, SiAdidas, SiPuma, SiAmazon, SiApple, SiGoogle, SiMinds, SiSpotify } from 'react-icons/si';



export default function Home() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  const [productsByType, setProductsByType] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  const [categories, setCategories] = useState([]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Banner click handler
  const handleBannerClick = (redirectLink) => {
    router.push(redirectLink);
  };

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

    // Check for available promotions before showing modal
    const checkAndShowPromotions = async () => {
      try {
        const response = await promotionsAPI.getPromotions();
        if (response.data && response.data.promotions) {
          // Filter only active promotions
          const activePromotions = response.data.promotions.filter(promo => promo.isActive);
          
          // Only show modal if there's at least one active promotion
          if (activePromotions.length > 0) {
            setIsPromotionModalOpen(true);
          }
        }
      } catch (error) {
        console.error('Error checking promotions:', error);
        // Don't show modal if there's an error fetching promotions
      }
    };

    // Show promotion modal after a short delay to ensure page is loaded
    const timer = setTimeout(() => {
      checkAndShowPromotions();
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



  // Banner slider settings

  const bannerSliderSettings = {

    dots: false,

    infinite: true,

    speed: 1000,

    slidesToShow: 1,

    slidesToScroll: 1,

    autoplay: true,

    autoplaySpeed: 5000,

    arrows: false,

    fade: true,

    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',

    pauseOnHover: true,

    pauseOnFocus: true,

  };



  // Enhanced banner images with more content - using proper static paths

  const bannerImages = [
    {
      id: 1,
      image: "/banner1.jpg",
      redirectLink: "/categories/shoes"
    },
    {
      id: 2,
      image: "/banner2.jpg",
      redirectLink: "/categories/sneakers"
    },
    {
      id: 3,
      image: "/banner3.jpg",
      redirectLink: "/categories/boots"
    }
  ];

  // Logo data for LogoLoop component - Shoe brands and partners
  // Easy to manage: Add new logos by adding objects to this array
  const shoeBrandLogos = [
    // { node: <SiNike />, title: "Nike", href: "https://nike.com" },
    // { node: <SiAdidas />, title: "Adidas", href: "https://adidas.com" },
    // { node: <SiPuma />, title: "Puma", href: "https://puma.com" },
    // { node: <SiAmazon />, title: "Amazon", href: "https://amazon.com" },
    
    // Image-based logos (using your own images)
    { 
      src: "/formal.png", 
      alt: "Formal Footwear", 
      title: "Formal Footwear",
      href: "#"
    },
    { 
      src: "/formal3.jpg", 
      alt: "Formal Footwear", 
      title: "Formal Footwear",
      href: "#"
    },

    // { node: <SiMinds />, title: "Microsoft", href: "https://microsoft.com" },
    // { node: <SiSpotify />, title: "Spotify", href: "https://spotify.com" },
  ];






  // Slider settings

  const featuredSliderSettings = {

    dots: false,

    infinite: true,

    speed: 500,

    slidesToShow: 1,

    slidesToScroll: 1,

    autoplay: true,

    autoplaySpeed: 5000,

    arrows: false,

  };


  const getDynamicSliderSettings = (productCount) => {

    const baseSettings = {

      dots: false, 

      infinite: false, 

      speed: 500,

      slidesToShow: 4,

      slidesToScroll: 1,

      autoplay: false,

      arrows: false,

      centerMode: false,

      centerPadding: '0px',

      responsive: [

        {

          breakpoint: 1024,

          settings: {

            slidesToShow: 4,

            dots: false,

            arrows: false,

            infinite: false,

            centerMode: false,

            centerPadding: '0px',

          }

        },

        {

          breakpoint: 768,

          settings: {

            slidesToShow: 3,

            dots: false,

            arrows: false,

            infinite: productCount > 3,

            centerMode: false,

            centerPadding: '0px',

          }

        },

        {

          breakpoint: 640,

          settings: {

            slidesToShow: 2,

            dots: false,

            arrows: false,

            infinite: productCount > 2,

            centerMode: false,

            centerPadding: '0px',

          }

        },

        {

          breakpoint: 480,

          settings: {

            slidesToShow: 2,

            dots: false,

            arrows: false,

            infinite: productCount > 2,

            centerMode: false,

            centerPadding: '0px',

          }

        }

      ]

    };




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

        {/* Hero Banner Slider - Image Only */}
        <section className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden">

          <Slider {...bannerSliderSettings} className="h-full">

            {bannerImages.map((banner, index) => (

              <div key={banner.id} className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] cursor-pointer" onClick={() => handleBannerClick(banner.redirectLink)}>

                {/* Background image */}

                <div

                  className="absolute inset-0 w-full h-full"

                  style={{

                    backgroundImage: `url(${banner.image})`,

                    backgroundPosition: 'center',

                    backgroundSize: 'cover',

                    backgroundRepeat: 'no-repeat',

                  }}

                />

              </div>

            ))}

          </Slider>

        </section>

        {/* Logo Loop Section */}
        <section className="pt-4 sm:pt-6 md:pt-8 pb-0 bg-gray-50">
          <div className="px-2 sm:px-4 md:px-6 lg:px-8">
            <div style={{ height: '80px', position: 'relative', overflow: 'hidden' }} className="sm:h-[100px] md:h-[120px]">
              <LogoLoop
                logos={shoeBrandLogos}
                speed={120}
                direction="left"
                logoHeight={40}
                gap={60}
                pauseOnHover
                scaleOnHover
                fadeOut
                fadeOutColor="#f9fafb"
                ariaLabel="Shoe brand partners"
              />
            </div>
          </div>
        </section>

        {/* New Arrivals Slider */}

        <section className="py-8 sm:py-12 bg-white">

          <div className="px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4" data-aos="fade-up">

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">New Arrivals</h2>

              <Link

                href="/categories/all?isNew=true"

                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 self-start sm:self-auto"

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

            ) : getProductsByType('new').length > 0 ? (

              <div data-aos="fade-up" data-aos-delay="200">

                <Slider {...getDynamicSliderSettings(getProductsByType('new').length)} className="bestseller-slider">

                  {getProductsByType('new').map((product, index) => (

                    <div key={product._id || index} className="px-1" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>

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

                href="/categories/all?isBestSeller=true"

                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 self-start sm:self-auto"

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

            ) : getProductsByType('bestseller').length > 0 ? (

              <div data-aos="fade-up" data-aos-delay="200">

                <Slider {...getDynamicSliderSettings(getProductsByType('bestseller').length)} className="bestseller-slider">

                  {getProductsByType('bestseller').map((product, index) => (

                    <div key={product._id || index} className="px-1" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>

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

                href="/categories/all?isTrending=true"

                className="group text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 transition-colors duration-300 self-start sm:self-auto"

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

            ) : getProductsByType('trending').length > 0 ? (

              <div data-aos="fade-up" data-aos-delay="200">

                <Slider {...getDynamicSliderSettings(getProductsByType('trending').length)} className="trending-slider">

                  {getProductsByType('trending').map((product, index) => (

                    <div key={product._id || index} className="px-1" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>

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

            <div className="px-4 sm:px-6 lg:px-8" data-aos="fade-up">

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

                          <p className="text-2xl text-white mb-4 font-alumni-xl">Rs {product.price || 0}</p>

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

        <section className="py-12 sm:py-16 bg-gradient-to-r from-orange-50 to-red-50">

          <div className="px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-12 gap-4" data-aos="fade-up">

              <div>

                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Special Offers</h2>

                <p className="text-sm sm:text-base text-gray-600">Limited time deals and exclusive offers just for you</p>

              </div>

              <Link

                href="/categories/all?isSpecial=true"

                className="group text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 transition-colors duration-300 self-start sm:self-auto"

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

                <p className="mt-4 text-gray-600">Loading special offeRs..</p>

              </div>

            ) : (getProductsByType('special').length > 0 || getProductsByType('discounted').length > 0) ? (

              <div data-aos="fade-up" data-aos-delay="200">

                <Slider {...getDynamicSliderSettings([...getProductsByType('special'), ...getProductsByType('discounted')].length)} className="special-offers-slider">

                  {/* Combine special and discounted products */}

                  {[...getProductsByType('special'), ...getProductsByType('discounted')].map((product, index) => (

                    <div key={product._id || index} className="px-1" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>

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

        {/* Promotional Images Section */}
        <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Promotional Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Promo Card 1 - Angular Cut Top Right */}
              <div 
                className="group relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-3"
                data-aos="fade-up"
                data-aos-delay="100"
                style={{
                  clipPath: 'polygon(0 0, 100% 8%, 100% 100%, 0 100%)',
                }}
              >
                <div className="relative h-[400px] sm:h-[450px] overflow-hidden">
                  <img
                    src="/prom1.jpeg"
                    alt="Promotional Banner 1"
                    className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-125 group-hover:rotate-2 brightness-95 group-hover:brightness-110"
                  />
                  {/* Subtle Overlay with animated gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                </div>
              </div>

              {/* Promo Card 2 - Diagonal Cut Bottom */}
              <div 
                className="group relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-700 transform hover:scale-105 hover:translate-y-2"
                data-aos="fade-up"
                data-aos-delay="200"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 92%, 0 100%)',
                }}
              >
                <div className="relative h-[400px] sm:h-[450px] overflow-hidden">
                  <img
                    src="/prom2.jpeg"
                    alt="Promotional Banner 2"
                    className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-125 group-hover:-rotate-2 brightness-95 group-hover:brightness-110"
                  />
                  {/* Subtle Overlay with animated gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tl from-pink-500/20 via-transparent to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/30 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-out delay-100"></div>
                </div>
              </div>

              {/* Promo Card 3 - Angular Cut Top Left */}
              <div 
                className="group relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-3"
                data-aos="fade-up"
                data-aos-delay="300"
                style={{
                  clipPath: 'polygon(0 8%, 100% 0, 100% 100%, 0 100%)',
                }}
              >
                <div className="relative h-[400px] sm:h-[450px] overflow-hidden">
                  <img
                    src="/prom3.jpeg"
                    alt="Promotional Banner 3"
                    className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-125 group-hover:rotate-2 brightness-95 group-hover:brightness-110"
                  />
                  {/* Subtle Overlay with animated gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 via-transparent to-orange-500/20 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out delay-200"></div>
                </div>
              </div>

            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-20 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-20 h-20 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </section>

        <style jsx>{`
          @keyframes blob {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(20px, -20px) scale(1.1);
            }
            50% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            75% {
              transform: translate(20px, 20px) scale(1.05);
            }
          }
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>



        {/* Newsletter - Enhanced */}

        <Newsletter />

      </div>







      {/* Promotion Modal */}

      <PromotionModal

        isOpen={isPromotionModalOpen}

        onClose={handleClosePromotionModal}

        onMaybeLater={handleMaybeLater}

      />

    </Layout>

  );

}
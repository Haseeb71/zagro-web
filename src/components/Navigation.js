import Link from 'next/link';
import { useState, useEffect } from 'react';
import RatingStars from './RatingStars';
import CartSlider from './CartSlider';
import productsAPI from '../APIs/eproducts';
import categoriesAPI from '../APIs/categories';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { toggleCart } from '@/redux/slices/cartSlice';

export default function Navigation() {
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [scrollPosition, setScrollPosition] = useState({ men: 0, women: 0, kids: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState({ men: false, women: false, kids: false });
  const [canScrollRight, setCanScrollRight] = useState({ men: false, women: false, kids: false });

  // Get cart data from Redux
  const { isOpen: isCartOpen, totalItems } = useAppSelector(state => state.cart);



  // Sample products data
  const sampleProducts = [
    {
      id: 1,
      name: "Nike Air Max 270",
      price: 129.99,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop&crop=center"
    },
    {
      id: 2,
      name: "Adidas Ultraboost 21",
      price: 179.99,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=150&h=150&fit=crop&crop=center"
    },
    {
      id: 3,
      name: "Puma RS-X",
      price: 89.99,
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=150&h=150&fit=crop&crop=center"
    },
    {
      id: 4,
      name: "New Balance 574",
      price: 79.99,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=150&h=150&fit=crop&crop=center"
    },
    {
      id: 5,
      name: "Converse Chuck Taylor",
      price: 59.99,
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=150&h=150&fit=crop&crop=center"
    },
    {
      id: 6,
      name: "Vans Old Skool",
      price: 64.99,
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=150&h=150&fit=crop&crop=center"
    },
    {
      id: 7,
      name: "Reebok Classic",
      price: 69.99,
      rating: 4.1,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop&crop=center"
    },
    {
      id: 8,
      name: "ASICS Gel-Kayano",
      price: 159.99,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=150&h=150&fit=crop&crop=center"
    },
    {
      id: 9,
      name: "Brooks Ghost 13",
      price: 119.99,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=150&h=150&fit=crop&crop=center"
    },
    {
      id: 10,
      name: "Hoka Clifton 8",
      price: 129.99,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=150&h=150&fit=crop&crop=center"
    },
    {
      id: 11,
      name: "Saucony Ride 14",
      price: 109.99,
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=150&h=150&fit=crop&crop=center"
    },
    {
      id: 12,
      name: "Mizuno Wave Rider",
      price: 119.99,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=150&h=150&fit=crop&crop=center"
    }
  ];

  // Search products using API
  const searchProducts = async (query) => {
    console.log("searchProducts called with query:", query);

    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      setSearchResults([]); // Clear previous results while searching

      // Add a minimum loading time to ensure loading state is visible
      const startTime = Date.now();
      const minLoadingTime = 800; // 800ms minimum loading time

      console.log("Calling API with query:", query);
      const response = await productsAPI.getSearchedProducts(query);

      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      console.log("Search response:", response);

      if (response && response.data && response.data.products) {
        setSearchResults(response.data.products);
        setSearchError(null);
      } else if (response && response.error) {
        setSearchResults([]);
        setSearchError(response.error?.response?.data?.message || 'Search failed');
      } else {
        setSearchResults([]);
        setSearchError('No products found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        console.log("Triggering search for:", searchQuery);
        searchProducts(searchQuery);
      } else {
        setSearchResults([]);
        setSearchError(null);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // You can add localStorage persistence here
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen && !event.target.closest('.user-dropdown')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isUserDropdownOpen) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isUserDropdownOpen]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAllCategories();
        console.log('Categories API response:', response);
        if (response && response.data && response.data.categories) {
          console.log('Setting categories:', response.data.categories);
          setCategories(response.data.categories);
        } else {
          console.log('Categories response structure:', response);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Handle hover with delay
  const handleMouseEnter = (category) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredCategory(category);
    // Check scroll state when dropdown opens
    setTimeout(() => checkScrollState(category), 100);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredCategory(null);
    }, 150); // 150ms delay before closing
    setHoverTimeout(timeout);
  };

  // Handle logout
  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    setIsUserDropdownOpen(false);
  };

  // Handle profile navigation
  const handleProfile = () => {
    // Add your profile navigation logic here
    console.log('Navigating to profile...');
    setIsUserDropdownOpen(false);
  };

  // Handle scroll for categories
  const handleScroll = (category, event) => {
    const container = event.target;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    
    setScrollPosition(prev => ({ ...prev, [category]: scrollLeft }));
    setCanScrollLeft(prev => ({ ...prev, [category]: scrollLeft > 0 }));
    setCanScrollRight(prev => ({ ...prev, [category]: scrollLeft < scrollWidth - clientWidth - 1 }));
  };

  // Scroll to specific direction
  const scrollTo = (category, direction) => {
    const container = document.querySelector(`[data-category="${category}"]`);
    if (container) {
      const scrollAmount = 200; // pixels to scroll
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll state when dropdown opens
  const checkScrollState = (category) => {
    const container = document.querySelector(`[data-category="${category}"]`);
    if (container) {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      
      setCanScrollLeft(prev => ({ ...prev, [category]: scrollLeft > 0 }));
      setCanScrollRight(prev => ({ ...prev, [category]: scrollLeft < scrollWidth - clientWidth - 1 }));
    }
  };

  return (
    <>
      {/* Custom CSS for floating animation */}
      <style jsx>{`
        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
         
         .slide-in-left {
           animation: slideInLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
         }
         
         @keyframes slideInLeft {
           from {
             transform: translateX(-100%);
             opacity: 0;
           }
           to {
             transform: translateX(0);
             opacity: 1;
           }
         }

         .line-clamp-2 {
           display: -webkit-box;
           -webkit-line-clamp: 2;
           -webkit-box-orient: vertical;
           overflow: hidden;
         }

         .animate-fadeIn {
           animation: fadeIn 0.3s ease-out;
         }

         @keyframes fadeIn {
           from {
             opacity: 0;
             transform: translateY(-10px);
           }
           to {
             opacity: 1;
             transform: translateY(0);
           }
         }

         .scrollbar-hide {
           -ms-overflow-style: none;
           scrollbar-width: none;
         }

         .scrollbar-hide::-webkit-scrollbar {
           display: none;
         }

         .scroll-container {
           position: relative;
         }

         .scroll-fade-left {
           position: absolute;
           left: 0;
           top: 0;
           bottom: 0;
           width: 20px;
           background: linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0));
           pointer-events: none;
           z-index: 10;
         }

         .scroll-fade-right {
           position: absolute;
           right: 0;
           top: 0;
           bottom: 0;
           width: 20px;
           background: linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0));
           pointer-events: none;
           z-index: 10;
         }

         .scroll-button {
           position: absolute;
           top: 50%;
           transform: translateY(-50%);
           z-index: 20;
           background: rgba(255,255,255,0.9);
           border: 1px solid rgba(0,0,0,0.1);
           border-radius: 50%;
           width: 32px;
           height: 32px;
           display: flex;
           align-items: center;
           justify-content: center;
           cursor: pointer;
           transition: all 0.2s ease;
           box-shadow: 0 2px 8px rgba(0,0,0,0.1);
         }

         .scroll-button:hover {
           background: rgba(255,255,255,1);
           box-shadow: 0 4px 12px rgba(0,0,0,0.15);
           transform: translateY(-50%) scale(1.1);
         }

         .scroll-button-left {
           left: 8px;
         }

         .scroll-button-right {
           right: 8px;
         }

         .scroll-button:disabled {
           opacity: 0.3;
           cursor: not-allowed;
           transform: translateY(-50%) scale(1);
         }

         .scroll-hint {
           position: absolute;
           bottom: 8px;
           right: 8px;
           background: rgba(0,0,0,0.7);
           color: white;
           padding: 4px 8px;
           border-radius: 12px;
           font-size: 10px;
           font-weight: 500;
           opacity: 0;
           animation: fadeInOut 3s ease-in-out;
         }

         @keyframes fadeInOut {
           0%, 100% { opacity: 0; }
           20%, 80% { opacity: 1; }
         }

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
      `}</style>

      {/* Navigation - Fixed Header */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 floating-animation hover:text-blue-700 transition-colors duration-300">
                Zagro Footwear
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
                Home
              </Link>

              {/* Men Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('men')}
                onMouseLeave={handleMouseLeave}
              >
                <Link href="/categories/men" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
                Men
              </Link>
                {hoveredCategory === 'men' && (
                  <div
                    className="absolute top-full left-0 mt-3 w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-6 z-50 animate-fadeIn backdrop-blur-sm"
                    onMouseEnter={() => handleMouseEnter('men')}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Header */}
                    <div className="px-6 pb-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900">
                        {hoveredCategory === 'men' && "Men's Collection"}
                        {hoveredCategory === 'women' && "Women's Collection"}
                        {hoveredCategory === 'kids' && "Kids Collection"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {hoveredCategory === 'men' && "Explore our premium footwear range for men"}
                        {hoveredCategory === 'women' && "Discover elegant and comfortable footwear for women"}
                        {hoveredCategory === 'kids' && "Fun and comfortable shoes for little ones"}
                      </p>
                    </div>

                    {/* Categories Row */}
                    <div className="px-6 pt-4">
                      <div className="scroll-container">
                        <div 
                          className="flex space-x-4 overflow-x-auto scrollbar-hide"
                          data-category="men"
                          onScroll={(e) => handleScroll('men', e)}
                        >
                          {console.log('Rendering categories:', categories)}
                          {categories.length > 0 ? categories.map((category, index) => (
                          <Link
                            key={category._id}
                            href={`/categories/${category.slug}?gender=men`}
                            className="flex-shrink-0 w-48 p-4 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group border border-transparent hover:border-blue-100 hover:shadow-lg"
                            style={{
                              animationDelay: `${index * 100}ms`,
                              animation: 'fadeInUp 0.4s ease-out forwards'
                            }}
                          >
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300 mx-auto mb-3">
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="text-center">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 text-sm mb-1">
                                {category.name}
                              </h4>
                              <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed line-clamp-2">
                                {category.description}
                              </p>
                              <div className="flex items-center justify-center mt-2">
                                <span className="text-xs font-medium text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                                  Shop Now →
                                </span>
                              </div>
                            </div>
                          </Link>
                        )) : (
                          <div className="flex items-center justify-center w-full py-8 text-gray-500">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                            <p className="text-sm">Loading categories...</p>
                          </div>
                        )}
                        </div>
                        
                        {/* Scroll Indicators */}
                        {canScrollLeft.men && (
                          <div className="scroll-fade-left"></div>
                        )}
                        {canScrollRight.men && (
                          <div className="scroll-fade-right"></div>
                        )}
                        
                        {/* Scroll Buttons */}
                        {canScrollLeft.men && (
                          <button
                            className="scroll-button scroll-button-left"
                            onClick={() => scrollTo('men', 'left')}
                            aria-label="Scroll left"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        )}
                        {canScrollRight.men && (
                          <button
                            className="scroll-button scroll-button-right"
                            onClick={() => scrollTo('men', 'right')}
                            aria-label="Scroll right"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                        
                        {/* Scroll Hint */}
                        {canScrollRight.men && (
                          <div className="scroll-hint">
                            ← Swipe to see more →
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pt-4 border-t border-gray-100 mt-4">
                      <Link
                        href={`/categories/${hoveredCategory}`}
                        className={`block w-full text-center py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${hoveredCategory === 'men'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                          : hoveredCategory === 'women'
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-700 hover:to-rose-700'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                          }`}
                      >
                        {hoveredCategory === 'men' && "View All Men's Shoes"}
                        {hoveredCategory === 'women' && "View All Women's Shoes"}
                        {hoveredCategory === 'kids' && "View All Kids' Shoes"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Women Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('women')}
                onMouseLeave={handleMouseLeave}
              >
                <Link href="/categories/women" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
                Women
              </Link>
                {hoveredCategory === 'women' && (
                  <div
                    className="absolute top-full left-0 mt-3 w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-6 z-50 animate-fadeIn backdrop-blur-sm"
                    onMouseEnter={() => handleMouseEnter('women')}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Header */}
                    <div className="px-6 pb-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900">
                        {hoveredCategory === 'men' && "Men's Collection"}
                        {hoveredCategory === 'women' && "Women's Collection"}
                        {hoveredCategory === 'kids' && "Kids Collection"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {hoveredCategory === 'men' && "Explore our premium footwear range for men"}
                        {hoveredCategory === 'women' && "Discover elegant and comfortable footwear for women"}
                        {hoveredCategory === 'kids' && "Fun and comfortable shoes for little ones"}
                      </p>
                    </div>

                    {/* Categories Row */}
                    <div className="px-6 pt-4">
                      <div className="scroll-container">
                        <div 
                          className="flex space-x-4 overflow-x-auto scrollbar-hide"
                          data-category="women"
                          onScroll={(e) => handleScroll('women', e)}
                        >
                          {categories.length > 0 ? categories.map((category, index) => (
                          <Link
                            key={category._id}
                            href={`/categories/${category.slug}?gender=women`}
                            className="flex-shrink-0 w-48 p-4 rounded-xl hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 transition-all duration-300 group border border-transparent hover:border-pink-100 hover:shadow-lg"
                            style={{
                              animationDelay: `${index * 100}ms`,
                              animation: 'fadeInUp 0.4s ease-out forwards'
                            }}
                          >
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300 mx-auto mb-3">
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="text-center">
                              <h4 className="font-semibold text-gray-900 group-hover:text-pink-700 transition-colors duration-300 text-sm mb-1">
                                {category.name}
                              </h4>
                              <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed line-clamp-2">
                                {category.description}
                              </p>
                              <div className="flex items-center justify-center mt-2">
                                <span className="text-xs font-medium text-pink-600 group-hover:text-pink-700 transition-colors duration-300">
                                  Shop Now →
                                </span>
                              </div>
                            </div>
                          </Link>
                        )) : (
                          <div className="flex items-center justify-center w-full py-8 text-gray-500">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                            <p className="text-sm">Loading categories...</p>
                          </div>
                        )}
                        </div>
                        
                        {/* Scroll Indicators */}
                        {canScrollLeft.women && (
                          <div className="scroll-fade-left"></div>
                        )}
                        {canScrollRight.women && (
                          <div className="scroll-fade-right"></div>
                        )}
                        
                        {/* Scroll Buttons */}
                        {canScrollLeft.women && (
                          <button
                            className="scroll-button scroll-button-left"
                            onClick={() => scrollTo('women', 'left')}
                            aria-label="Scroll left"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        )}
                        {canScrollRight.women && (
                          <button
                            className="scroll-button scroll-button-right"
                            onClick={() => scrollTo('women', 'right')}
                            aria-label="Scroll right"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pt-4 border-t border-gray-100 mt-4">
                      <Link
                        href={`/categories/${hoveredCategory}`}
                        className={`block w-full text-center py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${hoveredCategory === 'men'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                          : hoveredCategory === 'women'
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-700 hover:to-rose-700'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                          }`}
                      >
                        {hoveredCategory === 'men' && "View All Men's Shoes"}
                        {hoveredCategory === 'women' && "View All Women's Shoes"}
                        {hoveredCategory === 'kids' && "View All Kids' Shoes"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Kids Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('kids')}
                onMouseLeave={handleMouseLeave}
              >
                <Link href="/categories/kids" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
                Kids
              </Link>
                {hoveredCategory === 'kids' && (
                  <div
                    className="absolute top-full left-0 mt-3 w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-6 z-50 animate-fadeIn backdrop-blur-sm"
                    onMouseEnter={() => handleMouseEnter('kids')}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Header */}
                    <div className="px-6 pb-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900">
                        {hoveredCategory === 'men' && "Men's Collection"}
                        {hoveredCategory === 'women' && "Women's Collection"}
                        {hoveredCategory === 'kids' && "Kids Collection"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {hoveredCategory === 'men' && "Explore our premium footwear range for men"}
                        {hoveredCategory === 'women' && "Discover elegant and comfortable footwear for women"}
                        {hoveredCategory === 'kids' && "Fun and comfortable shoes for little ones"}
                      </p>
                    </div>

                    {/* Categories Row */}
                    <div className="px-6 pt-4">
                      <div className="scroll-container">
                        <div 
                          className="flex space-x-4 overflow-x-auto scrollbar-hide"
                          data-category="kids"
                          onScroll={(e) => handleScroll('kids', e)}
                        >
                          {categories.length > 0 ? categories.map((category, index) => (
                          <Link
                            key={category._id}
                            href={`/categories/${category.slug}?gender=kids`}
                            className="flex-shrink-0 w-48 p-4 rounded-xl hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group border border-transparent hover:border-green-100 hover:shadow-lg"
                            style={{
                              animationDelay: `${index * 100}ms`,
                              animation: 'fadeInUp 0.4s ease-out forwards'
                            }}
                          >
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300 mx-auto mb-3">
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="text-center">
                              <h4 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-300 text-sm mb-1">
                                {category.name}
                              </h4>
                              <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed line-clamp-2">
                                {category.description}
                              </p>
                              <div className="flex items-center justify-center mt-2">
                                <span className="text-xs font-medium text-green-600 group-hover:text-green-700 transition-colors duration-300">
                                  Shop Now →
                                </span>
                              </div>
                            </div>
                          </Link>
                        )) : (
                          <div className="flex items-center justify-center w-full py-8 text-gray-500">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                            <p className="text-sm">Loading categories...</p>
                          </div>
                        )}
                        </div>
                        
                        {/* Scroll Indicators */}
                        {canScrollLeft.kids && (
                          <div className="scroll-fade-left"></div>
                        )}
                        {canScrollRight.kids && (
                          <div className="scroll-fade-right"></div>
                        )}
                        
                        {/* Scroll Buttons */}
                        {canScrollLeft.kids && (
                          <button
                            className="scroll-button scroll-button-left"
                            onClick={() => scrollTo('kids', 'left')}
                            aria-label="Scroll left"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        )}
                        {canScrollRight.kids && (
                          <button
                            className="scroll-button scroll-button-right"
                            onClick={() => scrollTo('kids', 'right')}
                            aria-label="Scroll right"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pt-4 border-t border-gray-100 mt-4">
                      <Link
                        href={`/categories/${hoveredCategory}`}
                        className={`block w-full text-center py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${hoveredCategory === 'men'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                          : hoveredCategory === 'women'
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-700 hover:to-rose-700'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                          }`}
                      >
                        {hoveredCategory === 'men' && "View All Men's Shoes"}
                        {hoveredCategory === 'women' && "View All Women's Shoes"}
                        {hoveredCategory === 'kids' && "View All Kids' Shoes"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tablet Navigation - Compact */}
            <div className="hidden md:flex lg:hidden items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium text-sm">
                Home
              </Link>
              <Link href="/men" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium text-sm">
                Men
              </Link>
              <Link href="/women" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium text-sm">
                Women
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button
                className="p-2 text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-110 hover:bg-blue-50 rounded-full"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <button
                onClick={toggleDarkMode}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-3 group"
              >
                {isDarkMode ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 group-hover:text-yellow-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </>
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={() => {
                  console.log('Cart button clicked, toggling cart');
                  dispatch(toggleCart());
                }}
                className="p-2 text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-110 hover:bg-blue-50 rounded-full relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-blue-600 rounded-full animate-pulse">
                  {totalItems}
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 bg-white slide-in-left">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  Home
                </Link>
                <Link href="/men" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  Men
                </Link>
                <Link href="/women" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  Women
                </Link>
                <Link href="/kids" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  Kids
                </Link>

                {/* Mobile User Menu Items */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                 <button
                    onClick={toggleDarkMode}
                    className="w-full px-3 py-2 text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300 flex items-center space-x-3"
                  >
                    {isDarkMode ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-md slide-in-left">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-12 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    autoFocus
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {!isSearching && searchQuery.length === 0 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        Type to search
                      </span>
                    </div>
                  )}
                  {!isSearching && searchQuery.length > 0 && searchResults.length === 0 && !searchError && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        No results
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchError(null);
                  }}
                  className="px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>

              {/* Search Results Dropdown */}
              {searchQuery.length > 0 && (
                <div className="mt-4">
                  {/* Loading State - Show when searching */}
                  {isSearching && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Searching...</h3>
                      <p className="text-gray-500">Looking for products matching "{searchQuery}"</p>
                    </div>
                  )}

                  {/* Error State */}
                  {!isSearching && searchError && (
                    <div className="bg-white rounded-lg border border-red-200 shadow-lg p-8 text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Search Error</h3>
                      <p className="text-red-600 mb-4">{searchError}</p>
                      <button
                        onClick={() => searchProducts(searchQuery)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Search Results */}
                  {!isSearching && !searchError && searchResults.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-lg max-h-96 overflow-y-auto">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-gray-700">
                            Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''} for "<span className="text-blue-600">{searchQuery}</span>"
                          </h3>
                          <span className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded-full font-medium">
                            {searchResults.length} results
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {searchResults.map((product) => (
                            <div
                              key={product._id}
                              className="bg-white rounded-xl p-4 hover:bg-gray-50 transition-all duration-300 cursor-pointer group border border-gray-200 hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1"
                              onClick={() => setIsSearchOpen(false)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 relative">
                                  {product.images && product.images.length > 0 ? (
                                    <img
                                      src={product.images[0].url}
                                      alt={product.images[0].alt || product.name}
                                      className="w-24 h-24 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300 shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                                      <span className="text-xs text-gray-500">No Image</span>
                                    </div>
                                  )}
                                  {/* Price Tag - Top Right */}
                                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg z-10">
                                    ${product.price}
                                  </div>
                                  {/* Discount Tag - Top Left */}
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <div className="absolute -top-1 -left-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg z-10">
                                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2">
                                    {product.name}
                                  </h4>
                                  <div className="mb-3">
                                    <RatingStars rating={product.rating} size="sm" showRating={false} />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full">
                                      {product.brand || 'Brand'}
                                    </span>
                                    <Link
                                      href={`/products/${product._id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsSearchOpen(false);
                                      }}
                                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                    >
                                      View
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                        ))}
                        </div>
                        
                        {/* Scroll Indicators */}
                        {canScrollLeft.men && (
                          <div className="scroll-fade-left"></div>
                        )}
                        {canScrollRight.men && (
                          <div className="scroll-fade-right"></div>
                        )}
                        
                        {/* Scroll Buttons */}
                        {canScrollLeft.men && (
                          <button
                            className="scroll-button scroll-button-left"
                            onClick={() => scrollTo('men', 'left')}
                            aria-label="Scroll left"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        )}
                        {canScrollRight.men && (
                          <button
                            className="scroll-button scroll-button-right"
                            onClick={() => scrollTo('men', 'right')}
                            aria-label="Scroll right"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {!isSearching && !searchError && searchResults.length === 0 && searchQuery.trim() && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-500 mb-4">We couldn't find any products matching "{searchQuery}"</p>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                        <span>Try:</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">Nike</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">Adidas</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">Running</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Cart Slider */}
      <CartSlider
        isOpen={isCartOpen}
        onClose={() => dispatch(toggleCart())}
      />
    </>
  );
} 
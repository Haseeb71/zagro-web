import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import categoriesAPI from '../APIs/categories';
import eproductsAPI from '../APIs/eproducts';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { openCart } from '../redux/slices/cartSlice';

export default function Navigation() {
  const dispatch = useAppDispatch();
  const { totalItems } = useAppSelector(state => state.cart);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [subCategories, setSubCategories] = useState({});
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState({});
  const [hoveredSecondaryCategory, setHoveredSecondaryCategory] = useState(null);
  const [secondarySubCategories, setSecondarySubCategories] = useState({});
  const [isLoadingSecondarySubCategories, setIsLoadingSecondarySubCategories] = useState({});
  const dropdownTimeoutRef = useRef(null);
  const secondaryDropdownTimeoutRef = useRef(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);

  // Maximum categories to show initially
  const MAX_VISIBLE_CATEGORIES = 3;

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Pre-fetch subcategories for visible categories to reduce loading glitch
  useEffect(() => {
    if (categories.length > 0) {
      const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);
      visibleCategories.forEach((category) => {
        const categoryId = category.id || category._id;
        // Only fetch if not already loaded or loading
        if (!subCategories[categoryId] && !isLoadingSubCategories[categoryId]) {
          fetchSubCategories(categoryId);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  // Helper function to get promotional image based on category
  const getPromotionalImage = (category) => {
    const categoryName = category?.name?.toLowerCase() || '';
    
    // Map category names to promotional images
    const imageMap = {
      'men': '/formal.png',
      'women': '/banner1.jpg',
      'shoes': '/formal2.jpeg',
      'accessories': '/formal3.jpg',
      'padel': '/banner2.jpg',
      'default': '/formal.png'
    };

    // Find matching image or return default
    for (const [key, imagePath] of Object.entries(imageMap)) {
      if (categoryName.includes(key)) {
        return imagePath;
      }
    }
    
    return imageMap.default;
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
      if (secondaryDropdownTimeoutRef.current) {
        clearTimeout(secondaryDropdownTimeoutRef.current);
      }
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside navigation elements
      const navElement = document.querySelector('nav');
      const secondaryNavElement = document.querySelector('.fixed.top-16');

      if (navElement && !navElement.contains(event.target) &&
        secondaryNavElement && !secondaryNavElement.contains(event.target)) {
        forceCloseDropdown();
      }
    };

    if (hoveredCategory) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hoveredCategory]);

  // Safety mechanism - force close dropdown after 10 seconds
  useEffect(() => {
    if (hoveredCategory) {
      const safetyTimeout = setTimeout(() => {
        console.warn('Dropdown stuck open, forcing close');
        forceCloseDropdown();
      }, 10000); // 10 seconds

      return () => {
        clearTimeout(safetyTimeout);
      };
    }
  }, [hoveredCategory]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await categoriesAPI.getAllCategories();

      if (response?.data?.categories) {
        setCategories(response.data.categories);
      } else if (response?.data) {
        // Handle case where categories are directly in data
        setCategories(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };


  // Fetch subcategories for a specific category
  const fetchSubCategories = async (categoryId) => {
    if (subCategories[categoryId] || isLoadingSubCategories[categoryId]) {
      return; // Already loaded or loading
    }

    try {
      setIsLoadingSubCategories(prev => ({ ...prev, [categoryId]: true }));
      const response = await categoriesAPI.getAllSubCategoriesByCategory(categoryId);

      if (response?.data?.subCategories) {
        setSubCategories(prev => ({
          ...prev,
          [categoryId]: response.data.subCategories
        }));
      } else if (response?.data) {
        setSubCategories(prev => ({
          ...prev,
          [categoryId]: Array.isArray(response.data) ? response.data : []
        }));
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubCategories(prev => ({ ...prev, [categoryId]: [] }));
    } finally {
      setIsLoadingSubCategories(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  // Handle category hover
  const handleCategoryHover = (category) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setHoveredCategory(category);
    fetchSubCategories(category.id || category._id);
  };

  // Handle category leave
  const handleCategoryLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200); // Small delay to allow moving to dropdown
  };

  // Handle dropdown hover - keep it open
  const handleDropdownHover = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  // Handle dropdown leave - close dropdown
  const handleDropdownLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  // Manual close function
  const closeDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setHoveredCategory(null);
  };

  // Force close dropdown - for cleanup
  const forceCloseDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setHoveredCategory(null);
  };

  // Fetch subcategories for secondary navigation
  const fetchSecondarySubCategories = async (categoryId) => {
    if (secondarySubCategories[categoryId] || isLoadingSecondarySubCategories[categoryId]) {
      return; // Already loaded or loading
    }

    try {
      setIsLoadingSecondarySubCategories(prev => ({ ...prev, [categoryId]: true }));
      const response = await categoriesAPI.getAllSubCategoriesByCategory(categoryId);

      if (response?.data?.subCategories) {
        setSecondarySubCategories(prev => ({
          ...prev,
          [categoryId]: response.data.subCategories
        }));
      } else if (response?.data) {
        setSecondarySubCategories(prev => ({
          ...prev,
          [categoryId]: Array.isArray(response.data) ? response.data : []
        }));
      }
    } catch (error) {
      console.error('Error fetching secondary subcategories:', error);
      setSecondarySubCategories(prev => ({ ...prev, [categoryId]: [] }));
    } finally {
      setIsLoadingSecondarySubCategories(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  // Handle secondary category hover
  const handleSecondaryCategoryHover = (category) => {
    if (secondaryDropdownTimeoutRef.current) {
      clearTimeout(secondaryDropdownTimeoutRef.current);
    }
    setHoveredSecondaryCategory(category);
    fetchSecondarySubCategories(category.id || category._id);
  };

  // Handle secondary category leave
  const handleSecondaryCategoryLeave = () => {
    secondaryDropdownTimeoutRef.current = setTimeout(() => {
      setHoveredSecondaryCategory(null);
    }, 200); // Small delay to allow moving to dropdown
  };

  // Handle secondary dropdown hover - keep it open
  const handleSecondaryDropdownHover = () => {
    if (secondaryDropdownTimeoutRef.current) {
      clearTimeout(secondaryDropdownTimeoutRef.current);
    }
  };

  // Handle secondary dropdown leave - close dropdown
  const handleSecondaryDropdownLeave = () => {
    secondaryDropdownTimeoutRef.current = setTimeout(() => {
      setHoveredSecondaryCategory(null);
    }, 200);
  };




  return (
    <>
      {/* Custom CSS for floating animation and dropdown */}
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
        
        /* Mega Menu Dropdown Animations */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .mega-menu-dropdown {
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .dropdown-enter {
          opacity: 0;
          transform: translateY(-10px);
        }
        .dropdown-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.2s ease-out, transform 0.2s ease-out;
        }
        .dropdown-exit {
          opacity: 1;
          transform: translateY(0);
        }
        .dropdown-exit-active {
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.15s ease-in, transform 0.15s ease-in;
        }
        
         .category-dropdown {
           position: absolute;
           top: 100%;
           left: 0;
           right: 0;
           width: 100%;
           background: white;
           border-radius: 0;
           box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
           border: none;
           z-index: 1000;
           overflow: hidden;
           opacity: 0;
           transform: translateY(-15px);
           transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
           pointer-events: none;
         }
         
         .category-dropdown.show {
           opacity: 1;
           transform: translateY(0);
           pointer-events: auto;
         }
         
         .dropdown-header {
           display: none;
         }
         
         .dropdown-title {
           display: none;
         }
         
         .close-btn {
           display: none;
         }
        
        .subcategory-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding: 20px 10px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .subcategory-item {
          padding: 12px 20px;
          transition: all 0.2s ease;
          text-decoration: none;
          color: #333;
          font-size: 14px;
          font-weight: 400;
          text-transform: none;
          letter-spacing: 0;
          border: none;
          display: block;
          text-align: left;
          background: none;
          opacity: 0;
          transform: translateY(5px);
          animation: slideInUp 0.3s ease forwards;
        }
        
        .subcategory-item:nth-child(1) { animation-delay: 0.05s; }
        .subcategory-item:nth-child(2) { animation-delay: 0.1s; }
        .subcategory-item:nth-child(3) { animation-delay: 0.15s; }
        .subcategory-item:nth-child(4) { animation-delay: 0.2s; }
        .subcategory-item:nth-child(5) { animation-delay: 0.25s; }
        .subcategory-item:nth-child(6) { animation-delay: 0.3s; }
        
        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .subcategory-item:hover {
          background: #f8f9fa;
          color: #333;
          transform: translateY(-1px);
        }
        
         .category-container {
           position: relative;
         }
         
         .navigation-container {
           position: relative;
         }
        
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Enhanced subcategory card styles */
        .subcategory-card {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .subcategory-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(66, 220, 0, 0.15);
        }
        
        /* Promotional image styles */
        .promo-image-wrapper {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .promo-image-wrapper:hover {
          box-shadow: 0 12px 24px rgba(141, 159, 133, 0.2);
          transform: translateY(-2px);
        }
        
         .scrollbar-hide {
           -ms-overflow-style: none;
           scrollbar-width: none;
         }
         
         .scrollbar-hide::-webkit-scrollbar {
           display: none;
         }
         
         .secondary-nav-item {
           position: relative;
           transition: all 0.3s ease;
         }
         
         .secondary-nav-item::after {
           content: '';
           position: absolute;
           bottom: -2px;
           left: 0;
           width: 0;
           height: 2px;
           background: #3b82f6;
           transition: width 0.3s ease;
         }
         
         .secondary-nav-item:hover::after {
           width: 100%;
         }
         
         .secondary-nav-dropdown {
           transform: translateY(-10px);
           opacity: 0;
           visibility: hidden;
           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
         }
         
         .secondary-nav-group:hover .secondary-nav-dropdown {
           transform: translateY(0);
           opacity: 1;
           visibility: visible;
         }
         
         @media (max-width: 768px) {
           .category-dropdown {
             position: static;
             box-shadow: none;
             border: none;
             border-top: 1px solid #e5e7eb;
             border-radius: 0;
             margin-top: 8px;
             min-width: auto;
           }
           
           .subcategory-grid {
             grid-template-columns: 1fr;
             gap: 0;
             padding: 16px 0;
           }
           
           .subcategory-item {
             padding: 10px 16px;
             font-size: 14px;
           }
         }
      `}</style>

      {/* Navigation - Fixed Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300" style={{backgroundColor: 'rgb(141,159,133)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-white floating-animation hover:text-gray-200 transition-colors duration-300">
                <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="navigation-container hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white hover:text-gray-200 transition-colors duration-300 font-medium">
                Home
              </Link>
              <Link href="/order-status" className="text-white hover:text-gray-200 transition-colors duration-300 font-medium">
                Order Status
              </Link>

              {/* Dynamic Categories */}
              {isLoadingCategories ? (
                // Loading skeleton
                <>
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </>
              ) : (
                <>
                  {categories.slice(0, MAX_VISIBLE_CATEGORIES).map((category, index) => {
                    const categoryId = category.id || category._id;
                    const isHovered = hoveredCategory && (hoveredCategory.id || hoveredCategory._id) === categoryId;
                    const categorySubCategories = subCategories[categoryId] || [];
                    const isLoadingSubs = isLoadingSubCategories[categoryId];

                    return (
                      <div
                        key={categoryId || index}
                        className="category-container"
                        onMouseEnter={() => handleCategoryHover(category)}
                        onMouseLeave={handleCategoryLeave}
                      >
                        <Link
                          href={`/categories/${category.slug || category.name?.toLowerCase() || 'category'}`}
                          className="text-white hover:text-gray-200 transition-colors duration-300 font-medium flex items-center space-x-1"
                        >
                          <span>{category.name}</span>
                        </Link>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4">

              {/* Cart Button */}
              <button
                onClick={() => dispatch(openCart())}
                className="p-1 sm:p-2 text-white hover:text-gray-200 transition-colors duration-300 hover:scale-110 hover:bg-white/20 rounded-full relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold leading-none text-white transform bg-blue-600 rounded-full animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>


              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-1 sm:p-2 text-white hover:text-gray-200 transition-colors duration-300"
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  if (isMenuOpen) {
                    setExpandedMobileCategory(null);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors duration-300">
                  Home
                </Link>
                <Link href="/order-status" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors duration-300">
                  Order Status
                </Link>

                {/* Dynamic Categories for Mobile */}
                {isLoadingCategories ? (
                  // Loading skeleton for mobile
                  <>
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-3"></div>
                    ))}
                  </>
                ) : (
                  <>
                    {categories.slice(0, MAX_VISIBLE_CATEGORIES).map((category, index) => {
                      const categoryId = category.id || category._id;
                      const isExpanded = expandedMobileCategory && (expandedMobileCategory.id || expandedMobileCategory._id) === categoryId;
                      const categorySubCategories = subCategories[categoryId] || [];
                      const isLoadingSubs = isLoadingSubCategories[categoryId];

                      return (
                      <div key={categoryId || index}>
                          <div className="flex items-center justify-between px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors duration-300">
                            <Link
                              href={`/categories/${category.slug || category.name?.toLowerCase() || 'category'}`}
                              className="flex-1"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                            <button
                              onClick={() => {
                                if (isExpanded) {
                                  setExpandedMobileCategory(null);
                                } else {
                                  setExpandedMobileCategory(category);
                                  if (categorySubCategories.length === 0) {
                                    fetchSubCategories(categoryId);
                                  }
                                }
                              }}
                              className="ml-2 p-1 hover:bg-gray-200 rounded transition-all duration-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Subcategories - Mobile */}
                          {isExpanded && (
                            <div className="pl-6 pr-3 py-2 bg-gray-50 rounded-md ml-3 mr-3 mb-2">
                              {isLoadingSubs ? (
                                <div className="flex items-center py-2">
                                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="ml-2 text-gray-500 text-sm">Loading...</span>
                                </div>
                              ) : categorySubCategories.length > 0 ? (
                                categorySubCategories.map((subCategory, subIndex) => (
                                  <Link
                                    key={subCategory.id || subCategory._id || subIndex}
                                    href={`/categories/${category.slug || category.name?.toLowerCase()}/${subCategory.slug || subCategory.name?.toLowerCase()}`}
                                    className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors duration-200 text-sm"
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setExpandedMobileCategory(null);
                                    }}
                                  >
                                    {subCategory.name}
                                  </Link>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-gray-500 text-sm">
                                  No subcategories available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

      </nav>

      {/* Mega Menu Dropdown - Show Subcategories when Category is Hovered */}
      {hoveredCategory && (() => {
        const categoryId = hoveredCategory.id || hoveredCategory._id;
        const categorySubCategories = subCategories[categoryId] || [];
        const isLoadingSubs = isLoadingSubCategories[categoryId];

        return (
          <div
            className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg transition-all duration-300 ease-in-out mega-menu-dropdown"
            onMouseEnter={handleDropdownHover}
            onMouseLeave={handleDropdownLeave}
            style={{
              opacity: 1,
              transform: 'translateY(0)',
              animation: 'slideDown 0.3s ease-out'
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Desktop Mega Menu */}
              <div className="hidden md:grid md:grid-cols-12 gap-8">
                {/* Left side - Subcategories (takes 8 columns) */}
                <div className="col-span-8">
                  {isLoadingSubs ? (
                    // Loading skeleton for subcategories
                    <div className="grid grid-cols-3 gap-4">
                      {[...Array(6)].map((_, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 animate-pulse"
                          style={{
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-5 w-5 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : categorySubCategories.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {categorySubCategories.map((subCategory, index) => (
                        <Link
                          key={subCategory.id || subCategory._id || index}
                          href={`/categories/${hoveredCategory.slug || hoveredCategory.name?.toLowerCase()}/${subCategory.slug || subCategory.name?.toLowerCase()}`}
                          className="group relative p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-green-600 rounded-xl transition-all duration-300 hover:shadow-md overflow-hidden"
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`
                          }}
                        >
                          {/* Animated background gradient on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Content */}
                          <div className="relative flex items-center justify-between">
                            <span className="text-gray-800 font-semibold text-sm uppercase tracking-wider group-hover:text-green-700 transition-colors duration-200">
                              {subCategory.name}
                            </span>
                            
                            {/* Arrow icon */}
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-5 w-5 text-gray-400 group-hover:text-green-600 transform group-hover:translate-x-1 transition-all duration-200" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          
                          {/* Bottom accent line */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    // No subcategories available
                    <div className="flex items-center justify-center w-full py-12">
                      <span className="text-gray-500 text-sm">No subcategories available for {hoveredCategory.name}</span>
                    </div>
                  )}
                </div>

                {/* Right side - Promotional Image (takes 4 columns) */}
                <div className="col-span-4">
                  {isLoadingSubs ? (
                    // Skeleton loader for promotional image
                    <div className="relative h-full min-h-[300px] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse border-2 border-gray-200 shadow-xl">
                    </div>
                  ) : (
                    <Link 
                      href={`/categories/${hoveredCategory.slug || hoveredCategory.name?.toLowerCase()}`}
                      className="block relative h-full min-h-[300px] rounded-xl overflow-hidden shadow-xl group cursor-pointer border-2 border-gray-200 hover:border-green-600"
                      style={{
                        opacity: 0,
                        animation: 'fadeInRight 0.4s ease-out 0.2s forwards'
                      }}
                    >
                      <img 
                        src={getPromotionalImage(hoveredCategory)} 
                        alt={`${hoveredCategory.name} Promotion`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Subtle overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden">
                <div className="flex flex-col space-y-2">
                  {isLoadingSubs ? (
                    // Loading skeleton for mobile
                    <div className="flex items-center justify-center w-full py-4">
                      <div className="loading-spinner"></div>
                      <span className="ml-2 text-gray-500 text-sm">Loading...</span>
                    </div>
                  ) : categorySubCategories.length > 0 ? (
                    <>
                      {/* Show subcategories for mobile */}
                      {categorySubCategories.map((subCategory, index) => (
                        <Link
                          key={subCategory.id || subCategory._id || index}
                          href={`/categories/${hoveredCategory.slug || hoveredCategory.name?.toLowerCase()}/${subCategory.slug || subCategory.name?.toLowerCase()}`}
                          className="p-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium text-sm uppercase tracking-wide"
                        >
                          {subCategory.name}
                        </Link>
                      ))}
                    </>
                  ) : (
                    // No subcategories available for mobile
                    <div className="flex items-center justify-center w-full py-4">
                      <span className="text-gray-500 text-sm">No subcategories available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
} 
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
  const dropdownTimeoutRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearchResults, setHasMoreSearchResults] = useState(true);
  const [isLoadingMoreSearch, setIsLoadingMoreSearch] = useState(false);
  
  // Maximum categories to show initially
  const MAX_VISIBLE_CATEGORIES = 3;

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

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
    dropdownTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200); // Small delay to allow moving to dropdown
  };

  // Handle dropdown hover - keep it open
  const handleDropdownHover = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
  };

  // Handle dropdown leave - close dropdown
  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  // Manual close function
  const closeDropdown = () => {
    setHoveredCategory(null);
  };

  // Search products using API
  const searchProducts = async (query, page = 1, append = false) => {
    console.log("searchProducts called with query:", query, "page:", page);

    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    try {
      if (page === 1) {
        setIsSearching(true);
        setSearchError(null);
        if (!append) {
          setSearchResults([]); // Clear previous results while searching
        }
      } else {
        setIsLoadingMoreSearch(true);
      }

      // Add a minimum loading time to ensure loading state is visible
      const startTime = Date.now();
      const minLoadingTime = 800; // 800ms minimum loading time

      console.log("Calling API with query:", query, "page:", page);
      const response = await eproductsAPI.getProductsByFilters({
        search: query,
        page: page,
        perPage: 12
      });

      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      console.log("Search response:", response);

      if (response && response.data && response.data.products) {
        const newProducts = response.data.products;
        console.log("Search products data:", newProducts[0]); // Debug: log first product structure
        if (append) {
          setSearchResults(prev => [...prev, ...newProducts]);
        } else {
          setSearchResults(newProducts);
        }
        setSearchError(null);
        
        // Check if there are more results
        const totalPages = response.data.totalPages || 1;
        setHasMoreSearchResults(page < totalPages);
        setSearchPage(page);
      } else if (response && response.error) {
        if (!append) {
          setSearchResults([]);
          setSearchError(response.error?.response?.data?.message || 'Search failed');
        }
      } else {
        if (!append) {
          setSearchResults([]);
          setSearchError('No products found');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      if (!append) {
        setSearchError('Search failed. Please try again.');
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
      setIsLoadingMoreSearch(false);
    }
  };

  // Load more search results
  const loadMoreSearchResults = () => {
    if (!isLoadingMoreSearch && hasMoreSearchResults && searchQuery.trim()) {
      searchProducts(searchQuery, searchPage + 1, true);
    }
  };

  // Helper function to get proper image URL (same as main page)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:5000'}/${imagePath.replace(/\\/g, '/')}`;
  };

  // Helper function to get product image with fallbacks
  const getProductImage = (product) => {
    // Try different possible image structures
    if (product.images && product.images.length > 0) {
      const image = product.images[0];
      if (typeof image === 'string') {
        return getImageUrl(image);
      } else if (image.url) {
        return getImageUrl(image.url);
      } else if (image.path) {
        return getImageUrl(image.path);
      }
    }
    
    // Fallback to other possible image fields
    if (product.image) {
      return getImageUrl(product.image);
    }
    
    return null;
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        console.log("Triggering search for:", searchQuery);
        searchProducts(searchQuery, 1, false);
      } else {
        setSearchResults([]);
        setSearchError(null);
        setSearchPage(1);
        setHasMoreSearchResults(true);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 floating-animation hover:text-blue-700 transition-colors duration-300">
                <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="navigation-container hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
                Home
              </Link>
              <Link href="/order-status" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
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
                      className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium flex items-center space-x-1"
                    >
                          <span>{category.name}</span>
                        </Link>
                      </div>
                    );
                  })}
                </>
              )}
              
              {/* Global Dropdown - positioned at navigation level */}
              {hoveredCategory && (
                <div 
                  className={`category-dropdown ${hoveredCategory ? 'show' : ''}`}
                  onMouseEnter={handleDropdownHover}
                  onMouseLeave={handleDropdownLeave}
                >
                  {/* Dropdown Content */}
                  {(() => {
                    const categoryId = hoveredCategory.id || hoveredCategory._id;
                    const categorySubCategories = subCategories[categoryId] || [];
                    const isLoadingSubs = isLoadingSubCategories[categoryId];
                    
                    return isLoadingSubs ? (
                      <div className="flex items-center justify-center p-12">
                        <div className="loading-spinner"></div>
                        <span className="ml-3 text-gray-500 text-sm">Loading subcategories...</span>
                      </div>
                    ) : categorySubCategories.length > 0 ? (
                      <div className="subcategory-grid">
                        {categorySubCategories.map((subCategory, subIndex) => (
                          <Link
                            key={subCategory.id || subCategory._id || subIndex}
                            href={`/categories/${hoveredCategory.slug || hoveredCategory.name?.toLowerCase()}/${subCategory.slug || subCategory.name?.toLowerCase()}`}
                            className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium subcategory-item"
                          >
                            {subCategory.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <p className="text-sm">No subcategories available</p>
                      </div>
                    );
                  })()}
                </div>
              )}
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

              {/* Cart Button */}
              <button 
                onClick={() => dispatch(openCart())}
                className="p-2 text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-110 hover:bg-blue-50 rounded-full relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-blue-600 rounded-full animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Account Button */}
              <button className="p-2 text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-110 hover:bg-blue-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors duration-300"
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
            <div className="md:hidden border-t border-gray-100 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  Home
                </Link>
                <Link href="/order-status" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300">
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
                      const isHovered = hoveredCategory && (hoveredCategory.id || hoveredCategory._id) === categoryId;
                      const categorySubCategories = subCategories[categoryId] || [];
                      const isLoadingSubs = isLoadingSubCategories[categoryId];
                      
                      return (
                        <div key={categoryId || index}>
                           <div 
                             className="flex items-center justify-between px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300 cursor-pointer"
                             onClick={() => {
                               if (isHovered) {
                                 closeDropdown();
                               } else {
                                 handleCategoryHover(category);
                                 if (categorySubCategories.length === 0) {
                                   fetchSubCategories(categoryId);
                                 }
                               }
                             }}
                           >
                      <Link 
                        href={`/categories/${category.slug || category.name?.toLowerCase() || 'category'}`}
                              className="flex-1"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                            {categorySubCategories.length > 0 && (
                              <svg 
                                className={`w-4 h-4 transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
                          
                          {/* Mobile Subcategories */}
                          {isHovered && (
                            <div className="ml-4 mt-1 space-y-1">
                              {isLoadingSubs ? (
                                <div className="flex items-center px-3 py-2">
                                  <div className="loading-spinner"></div>
                                  <span className="ml-2 text-gray-500 text-sm">Loading...</span>
                                </div>
                               ) : categorySubCategories.length > 0 ? (
                                 categorySubCategories.map((subCategory, subIndex) => (
                                   <Link
                                     key={subCategory.id || subCategory._id || subIndex}
                                     href={`/categories/${category.slug || category.name?.toLowerCase()}/${subCategory.slug || subCategory.name?.toLowerCase()}`}
                                     className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300"
                                     onClick={() => setIsMenuOpen(false)}
                                   >
                                     {subCategory.name}
                                   </Link>
                                 ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">
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
                    setSearchPage(1);
                    setHasMoreSearchResults(true);
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
                                  {getProductImage(product) ? (
                                    <img
                                      src={getProductImage(product)}
                                      alt={product.name}
                                      className="w-24 h-24 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300 shadow-sm"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center" style={{ display: getProductImage(product) ? 'none' : 'flex' }}>
                                    <span className="text-xs text-gray-500">No Image</span>
                                  </div>
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
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <svg
                                          key={i}
                                          className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full">
                                      {product.brand || 'Brand'}
                                    </span>
                                    <Link
                                      href={`/product?id=${product._id}`}
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
                        
                        {/* Load More Button */}
                        {hasMoreSearchResults && (
                          <div className="mt-4 text-center">
                            <button
                              onClick={loadMoreSearchResults}
                              disabled={isLoadingMoreSearch}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              {isLoadingMoreSearch ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Loading...</span>
                                </div>
                              ) : (
                                'Load More Results'
                              )}
                            </button>
                          </div>
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
    </>
  );
} 
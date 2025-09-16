import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ProductCard from '../../components/ProductCard';
import Loader from '../../components/loader/loader';
import { getCategoryById, getCategoryMetadata } from '../../config/categories';
import { Bars3Icon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import productsAPI from '../../APIs/eproducts';
import categoriesAPI from '../../APIs/categories';
import { useAppDispatch } from '../../redux/hooks';
import { addToCart } from '../../redux/slices/cartSlice';

// This is the main category page that handles all category types
// It uses dynamic routing to show different categories based on URL parameter
export default function CategoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { category } = router.query;

  // State management for the page
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Category pagination state
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [totalCategories, setTotalCategories] = useState(0);
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);
  const [allCategoriesLoaded, setAllCategoriesLoaded] = useState(false);
  const [filters, setFilters] = useState({
    gender: [],
    category: [],
    brand: [],
    size: [],
    price: [],
    color: []
  });

  // Get category information based on URL parameter
  const categoryInfo = category ? getCategoryById(category) : null;

  const fetchCategories = async (page = 1, isLoadMore = false) => {
    try {
      setIsLoadingCategories(true);
      const response = await categoriesAPI.getAllCategories(page);

      if (response.data && response.data.categories) {
        const newCategories = response.data.categories;
        const pagination = response.data.pagination;

        // Update total categories count
        setTotalCategories(pagination.totalCategories);

        if (isLoadMore) {
          // Append new categories to existing ones
          setCategories(prev => [...prev, ...newCategories]);
        } else {
          // Replace categories for first load
          setCategories(newCategories);
        }

        // Check if all categories are loaded
        const totalLoaded = isLoadMore ? categories.length + newCategories.length : newCategories.length;
        console.log(`Categories loaded: ${totalLoaded}/${pagination.totalCategories}`);

        if (totalLoaded >= pagination.totalCategories || newCategories.length === 0) {
          setAllCategoriesLoaded(true);
          setIsLoadingCategories(false);
          console.log('All categories loaded successfully!');
        } else {
          // Load next page
          setCurrentCategoryPage(page + 1);
          setTimeout(() => {
            fetchCategories(page + 1, true);
          }, 100); // Small delay to prevent overwhelming the API
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setIsLoadingCategories(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async (isLoadMore = false) => {
    if (!category) return;

    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      let response;

      // Handle special categories - use filter API with unisex gender
      if (category === 'new-arrivals') {
        const filterParams = {
          gender: 'unisex',
          page: currentPage,
          limit: 12,
          sortBy: sortBy // Allow user to override default sorting
        };
        response = await productsAPI.getFilteredProducts(filterParams);
      } else if (category === 'best-sellers') {
        const filterParams = {
          gender: 'unisex',
          page: currentPage,
          limit: 12,
          sortBy: sortBy // Allow user to override default sorting
        };
        response = await productsAPI.getFilteredProducts(filterParams);
      } else if (category === 'trending') {
        const filterParams = {
          gender: 'unisex',
          page: currentPage,
          limit: 12,
          sortBy: sortBy // Allow user to override default sorting
        };
        response = await productsAPI.getFilteredProducts(filterParams);
      } else {
        // Regular category filtering
        const filterParams = {
          page: currentPage,
          limit: 12,
          sortBy: sortBy
        };

        // Check if category is a gender or product category
        const genderCategories = ['men', 'women', 'kids', 'unisex'];
        const productCategories = ['sneakers', 'boots', 'sandals', 'casual', 'athletic', 'formal'];

        if (genderCategories.includes(category.toLowerCase())) {
          // It's a gender category
          filterParams.gender = category;
        } else if (productCategories.includes(category.toLowerCase())) {
          // It's a product category
          filterParams.category = category;
        } else {
          // Default: treat as gender for backward compatibility
          filterParams.gender = category;
        }

        response = await productsAPI.getFilteredProducts(filterParams);
      }

      if (response && response.data && response.data.products) {
        // Apply client-side sorting as fallback
        const sortedProducts = sortProducts(response.data.products, sortBy);
        
        if (isLoadMore) {
          // Append new products to existing ones
          setProducts(prev => [...prev, ...sortedProducts]);
        } else {
          // Replace products (first load or category change)
          setProducts(sortedProducts);
        }

        setTotalProducts(response.data.total || response.data.products.length);
        setHasMore(response.data.hasMore || false);
      } else if (response && response.error) {
        setError(response.error?.response?.data?.message || 'Failed to load products');
        if (!isLoadMore) {
          setProducts([]);
        }
      } else {
        setError('No products found');
        if (!isLoadMore) {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      if (!isLoadMore) {
        setProducts([]);
      }
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Reset categories when component unmounts or category changes
  useEffect(() => {
    return () => {
      setCategories([]);
      setAllCategoriesLoaded(false);
      setCurrentCategoryPage(1);
      setIsLoadingCategories(true);
    };
  }, [category]);

  // Fetch products from API
  useEffect(() => {
    if (category) {
      setCurrentPage(1); // Reset to first page when category changes
      fetchProducts();
      fetchCategories();
    }
  }, [category]);

  // Set filtered products to products and apply sorting
  useEffect(() => {
    const sortedProducts = sortProducts(products, sortBy);
    setFilteredProducts(sortedProducts);
  }, [products, sortBy]);

  // Load more products when page changes (for infinite scroll)
  useEffect(() => {
    if (category && currentPage > 1) {
      fetchProducts(true); // Load more products
    }
  }, [currentPage]);

  // Refetch products when sorting changes
  useEffect(() => {
    if (category) {
      setCurrentPage(1); // Reset to first page when sorting changes
      setProducts([]); // Clear existing products
      fetchProducts(false); // Load fresh products
    }
  }, [sortBy]);

  // Client-side sorting function as fallback
  const sortProducts = (products, sortBy) => {
    if (!products || products.length === 0) return products;
    
    const sortedProducts = [...products];
    
    switch (sortBy) {
      case 'price-low-high':
        return sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high-low':
        return sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'rating':
        return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return sortedProducts.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));
      case 'name-a-z':
        return sortedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name-z-a':
        return sortedProducts.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      default:
        return sortedProducts;
    }
  };

  // Handle cart actions with essential data only
  const handleAddToCart = (product) => {
    // This function is passed to ProductCard as onAddToCart prop
    // The actual add to cart logic is handled inside ProductCard component
    console.log('Product add to cart triggered:', product);
  };

  const handleWishlist = (product) => {
    console.log('Adding to wishlist:', product);
    // TODO: Implement wishlist functionality
  };

  const handleQuickView = (product) => {
    console.log('Quick view:', product);
    // TODO: Implement quick view modal
  };

  // Filter change handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      gender: [],
      category: [],
      brand: [],
      size: [],
      price: [],
      color: []
    });
  };

  // Close mobile filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileFiltersOpen && !event.target.closest('.mobile-filters')) {
        setIsMobileFiltersOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileFiltersOpen]);

  // Close mobile filters on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMobileFiltersOpen) {
        setIsMobileFiltersOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileFiltersOpen]);

  // Infinite scroll functionality
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || !hasMore) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when user is 200px from bottom
      if (scrollTop + windowHeight >= documentHeight - 200) {
        setCurrentPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMore]);

  return (
    <>
      <Head>
        <title>{categoryInfo ? `${categoryInfo.title} - Zagro Store` : 'Loading...'}</title>
        <meta name="description" content={categoryInfo?.description || 'Explore our products'} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Clean, Minimal Header - Matching Zagro Footwear Style */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
            {/* Simple Category Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                  {categoryInfo?.title || 'Loading...'}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  {totalProducts} products available
                </p>
              </div>

              {/* Clean Sort Dropdown */}
              {categoryInfo && (
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs sm:text-sm text-gray-600 border border-gray-200 rounded px-2 sm:px-3 py-1 sm:py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-w-0 flex-shrink-0"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name-a-z">Name: A to Z</option>
                    <option value="name-z-a">Name: Z to A</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Mobile Filter Toggle Button - Commented out since filters are disabled */}
          {/* <div className="lg:hidden mb-6">
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="flex items-center space-x-1 sm:space-x-2 bg-white border border-gray-200 rounded-lg px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 w-full justify-center transform hover:scale-[1.02] hover:shadow-md"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
              {Object.values(filters).some(arr => arr.length > 0) && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)} active
                </span>
              )}
            </button>
          </div> */}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Mobile Filters Overlay */}
            {/* <>
              {/* Backdrop with fade animation */}
              {/* <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ease-in-out ${isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                onClick={() => setIsMobileFiltersOpen(false)}
              /> */}

              {/* Mobile Filters Panel with slide animation */}
              {/* <div className={`mobile-filters fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-all duration-300 ease-in-out lg:hidden overflow-y-auto ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Mobile Filters Header */}
                {/* <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div> */}

                {/* Mobile Filters Content */}
                {/* <div className="p-4 space-y-6">
                  {/* Active Filters Summary */}
                  {/* <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Active Filters</span>
                      {Object.values(filters).some(arr => arr.length > 0) && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)} active
                        </span>
                      )}
                    </div>
                    {Object.values(filters).some(arr => arr.length > 0) && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Clear All
                      </button>
                    )}
                  </div> */}

                  {/* Gender Filter */}
                  {/* <div className="animate-slideInRight" style={{ animationDelay: '50ms' }}>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Gender</h4>
                    <div className="space-y-2">
                      {['Men', 'Women', 'Kids'].map((gender, index) => (
                        <label
                          key={gender}
                          className="flex items-center animate-slideInRight"
                          style={{ animationDelay: `${(index + 1) * 50}ms` }}
                        >
                          <input
                            type="checkbox"
                            checked={filters.gender.includes(gender)}
                            onChange={() => handleFilterChange('gender', gender)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-600">{gender}</span>
                        </label>
                      ))}
                    </div>
                  </div> */}

                  {/* Category Filter */}
                  {/* <div className="animate-slideInRight" style={{ animationDelay: '100ms' }}>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
                    <div className="space-y-2">
                      {isLoadingCategories ? (
                        <div className="flex flex-col items-center justify-center py-4">
                          <Loader size={30} color="#3B82F6" />
                          <span className="mt-2 text-sm text-gray-500">
                            Loading categories... ({categories.length}/{totalCategories})
                          </span>
                        </div>
                      ) : (
                        categories.map((cat, index) => (
                          <label
                            key={cat._id}
                            className="flex items-center animate-slideInRight"
                            style={{ animationDelay: `${(index + 1) * 100}ms` }}
                          >
                            <input
                              type="checkbox"
                              checked={filters.category.includes(cat.name)}
                              onChange={() => handleFilterChange('category', cat.name)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm text-gray-600">{cat.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div> */}

                  {/* Brand Filter */}
                  {/* <div className="animate-slideInRight" style={{ animationDelay: '150ms' }}>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Brand</h4>
                    <div className="space-y-2">
                      {['Nike', 'Adidas', 'Puma', 'Converse', 'Vans', 'New Balance'].map((brand, index) => (
                        <label
                          key={brand}
                          className="flex items-center animate-slideInRight"
                          style={{ animationDelay: `${(index + 1) * 80}ms` }}
                        >
                          <input
                            type="checkbox"
                            checked={filters.brand.includes(brand)}
                            onChange={() => handleFilterChange('brand', brand)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-600">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div> */}

                  {/* Size Filter */}
                  {/* <div className="animate-slideInRight" style={{ animationDelay: '200ms' }}>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Size</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[7, 8, 9, 10, 11, 12].map((size, index) => (
                        <label
                          key={size}
                          className="flex items-center justify-center animate-slideInRight"
                          style={{ animationDelay: `${(index + 1) * 60}ms` }}
                        >
                          <input
                            type="checkbox"
                            checked={filters.size.includes(size)}
                            onChange={() => handleFilterChange('size', size)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div> */}

                  {/* Price Range Filter */}
                  {/* <div className="animate-slideInRight" style={{ animationDelay: '250ms' }}>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Price</h4>
                    <div className="space-y-2">
                      {['Under $50', '$50 - $100', '$100 - $150', 'Over $150'].map((range, index) => (
                        <label
                          key={range}
                          className="flex items-center animate-slideInRight"
                          style={{ animationDelay: `${(index + 1) * 70}ms` }}
                        >
                          <input
                            type="checkbox"
                            checked={filters.price.includes(range)}
                            onChange={() => handleFilterChange('price', range)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-600">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div> */}

                  {/* Color Filter */}
                  {/* <div className="animate-slideInRight" style={{ animationDelay: '300ms' }}>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Color</h4>
                    <div className="space-y-2">
                      {['Black', 'White', 'Red', 'Blue', 'Gray', 'Green', 'Yellow', 'Navy'].map((color, index) => (
                        <label
                          key={color}
                          className="flex items-center animate-slideInRight"
                          style={{ animationDelay: `${(index + 1) * 50}ms` }}
                        >
                          <input
                            type="checkbox"
                            checked={filters.color.includes(color)}
                            onChange={() => handleFilterChange('color', color)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-600">{color}</span>
                        </label>
                      ))}
                    </div>
                  </div> */}
                {/* </div> */}
              {/* </div> */}
            {/* </> */}

            {/* Desktop Filters Sidebar */}
            {/* <div className="hidden lg:block lg:col-span-1">
              {/* <div className="bg-white rounded-lg border border-gray-100 p-4 sticky top-8">
                {/* <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-medium text-gray-900">Filters</h3>
                    {Object.values(filters).some(arr => arr.length > 0) && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)} active
                      </span>
                    )}
                  </div>
                  {Object.values(filters).some(arr => arr.length > 0) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Clear All
                    </button>
                  )}
                </div> */}

                {/* Gender Filter */}
                {/* <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Gender</h4>
                  <div className="space-y-2">
                    {['Men', 'Women', 'Kids'].map((gender) => (
                      <label key={gender} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.gender.includes(gender)}
                          onChange={() => handleFilterChange('gender', gender)}
                          className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-xs text-gray-600">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div> */}

                {/* Category Filter */}
                {/* <div className="animate-slideInRight" style={{ animationDelay: '100ms' }}>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
                  <div className="space-y-2">
                    {isLoadingCategories ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <Loader size={30} color="#3B82F6" />
                        <span className="mt-2 text-sm text-gray-500">
                          Loading categories... ({categories.length}/{totalCategories})
                        </span>
                      </div>
                    ) : (
                      categories.map((cat, index) => (
                        <label
                          key={cat._id}
                          className="flex items-center animate-slideInRight"
                          style={{ animationDelay: `${(index + 1) * 100}ms` }}
                        >
                          <input
                            type="checkbox"
                            checked={filters.category.includes(cat.name)}
                            onChange={() => handleFilterChange('category', cat.name)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-600">{cat.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div> */}

                {/* Brand Filter */}
                {/* <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Brand</h4>
                  <div className="space-y-2">
                    {['Nike', 'Adidas', 'Puma', 'Converse', 'Vans', 'New Balance'].map((brand) => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.brand.includes(brand)}
                          onChange={() => handleFilterChange('brand', brand)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-xs text-gray-600">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div> */}

                {/* Size Filter */}
                {/* <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Size</h4>
                  <div className="grid grid-cols-3 gap-1">
                    {[7, 8, 9, 10, 11, 12].map((size) => (
                      <label key={size} className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={filters.size.includes(size)}
                          onChange={() => handleFilterChange('size', size)}
                          className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-1 text-xs text-gray-600">{size}</span>
                      </label>
                    ))}
                  </div>
                </div> */}

                {/* Price Range Filter */}
                {/* <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Price</h4>
                  <div className="space-y-2">
                    {['Under $50', '$50 - $100', '$100 - $150', 'Over $150'].map((range) => (
                      <label key={range} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.price.includes(range)}
                          onChange={() => handleFilterChange('price', range)}
                          className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-xs text-gray-600">{range}</span>
                      </label>
                    ))}
                  </div>
                </div> */}

                {/* Color Filter */}
                {/* <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Color</h4>
                  <div className="space-y-2">
                    {['Black', 'White', 'Red', 'Blue', 'Gray', 'Green', 'Yellow', 'Navy'].map((color) => (
                      <label key={color} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.color.includes(color)}
                          onChange={() => handleFilterChange('color', color)}
                          className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-xs text-gray-600">{color}</span>
                      </label>
                    ))}
                  </div>
                </div> */}
              {/* </div> */} 
            {/* </div> */}

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                // Enhanced Loading State
                <div className="space-y-6">
                  {/* Loading Header */}
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Products</h3>
                    <p className="text-gray-500">Finding the best products for you...</p>
                  </div>

                  {/* Skeleton Loaders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                        <div className="space-y-2">
                          <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                          <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                          <div className="bg-gray-200 h-4 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                // Error State
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load products</h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">{error}</p>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => fetchProducts()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Try Again</span>
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Reload Page
                    </button>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                // Empty State
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    We couldn't find any products in this category. Try browsing other categories or check back later.
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => router.push('/')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Browse All Products</span>
                    </button>
                    <button
                      onClick={clearAllFilters}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              ) : (
                // Products Grid
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      variant="default"
                      onAddToCart={() => handleAddToCart(product)}
                      onWishlist={() => handleWishlist(product)}
                      onQuickView={() => handleQuickView(product)}
                    />
                  ))}
                </div>
              )}

              {/* Loading More Indicator */}
              {isLoadingMore && (
                <div className="mt-8 flex items-center justify-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading more products...</span>
                  </div>
                </div>
              )}

              {/* End of Results */}
              {!isLoading && !error && !hasMore && filteredProducts.length > 0 && (
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center space-x-2 text-gray-500">
                    <div className="w-8 h-px bg-gray-300"></div>
                    <span className="text-sm">You've reached the end</span>
                    <div className="w-8 h-px bg-gray-300"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for mobile filter animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
          opacity: 0;
        }
        
        /* Mobile filter panel entrance animation */
        .mobile-filters {
          will-change: transform;
        }
        
        /* Smooth backdrop transition */
        .backdrop-blur-sm {
          will-change: opacity;
        }
      `}</style>
    </>
  );
}

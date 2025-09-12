import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import ProductCard from '../../../components/ProductCard';
import eproductsAPI from '../../../APIs/eproducts';
import categoriesAPI from '../../../APIs/categories';

export default function SubCategoryPage() {
  const router = useRouter();
  const { category, subcategory } = router.query;
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [subCategoryInfo, setSubCategoryInfo] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    subCategory: subcategory || '',
    minPrice: '',
    maxPrice: '',
    isFeatured: '',
    isBestSeller: '',
    isTrending: '',
    isSpecial: '',
    isDiscounted: '',
    color: '',
    size: '',
    inStock: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch products with filters
  const fetchProducts = useCallback(async (page = 1, reset = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Extract subCategory from filters to exclude from API call (not supported yet)
      const { subCategory: filterSubCategory, ...filtersWithoutSubCategory } = filters;
      
      const params = {
        page: page.toString(),
        perPage: '12',
        category: category,
        // subCategory: subcategory, // Temporarily disabled - API doesn't support subcategory filtering yet
        ...filtersWithoutSubCategory
      };

      const response = await eproductsAPI.getProductsByFilters(params);
      
      if (response?.data) {
        const newProducts = response.data.products || response.data || [];
        const total = response.data.total || response.data.totalProducts || 0;
        
        if (reset) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }
        
        setTotalProducts(total);
        setHasMore(newProducts.length === 12);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, subcategory, filters]);

  // Fetch category and subcategory info
  const fetchCategoryData = useCallback(async () => {
    try {
      // Fetch all categories to find current category info
      const categoriesResponse = await categoriesAPI.getAllCategories();
      const categories = categoriesResponse?.data?.categories || categoriesResponse?.data || [];
      const currentCategory = categories.find(cat => 
        cat.slug === category || cat.name?.toLowerCase() === category
      );
      
      if (currentCategory) {
        setCategoryInfo(currentCategory);
        
        // Fetch subcategories
        const subCategoriesResponse = await categoriesAPI.getAllSubCategoriesByCategory(currentCategory.id || currentCategory._id);
        const subCats = subCategoriesResponse?.data?.subCategories || subCategoriesResponse?.data || [];
        setSubCategories(subCats);
        
        // Find current subcategory
        const currentSubCategory = subCats.find(subCat => 
          subCat.slug === subcategory || subCat.name?.toLowerCase() === subcategory
        );
        if (currentSubCategory) {
          setSubCategoryInfo(currentSubCategory);
        }
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  }, [category, subcategory]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      fetchProducts(currentPage + 1, false);
    }
  }, [loadingMore, hasMore, currentPage, fetchProducts]);

  // Filter change handler
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
    setHasMore(true);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      subCategory: subcategory || '',
      minPrice: '',
      maxPrice: '',
      isFeatured: '',
      isBestSeller: '',
      isTrending: '',
      isSpecial: '',
      isDiscounted: '',
      color: '',
      size: '',
      inStock: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    
    // Fetch products with no filters (only category)
    const params = {
      page: '1',
      perPage: '12',
      category: category
    };
    
    eproductsAPI.getProductsByFilters(params).then(response => {
      if (response?.data) {
        const newProducts = response.data.products || response.data || [];
        setProducts(newProducts);
        setTotalProducts(response.data.total || newProducts.length);
        setCurrentPage(1);
        setHasMore(newProducts.length >= 12);
      }
    }).catch(error => {
      console.error('Error fetching products:', error);
    });
  };

  // Effects
  useEffect(() => {
    if (category && subcategory) {
      fetchCategoryData();
    }
  }, [category, subcategory, fetchCategoryData]);

  useEffect(() => {
    if (category && subcategory) {
      fetchProducts(1, true);
    }
  }, [category, subcategory, fetchProducts]);

  // Handle URL parameters for pre-selecting filters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const newFilters = { ...filters };
      
      // Check for filter parameters in URL
      if (urlParams.get('isFeatured') === 'true') newFilters.isFeatured = 'true';
      if (urlParams.get('isBestSeller') === 'true') newFilters.isBestSeller = 'true';
      if (urlParams.get('isTrending') === 'true') newFilters.isTrending = 'true';
      if (urlParams.get('isSpecial') === 'true') newFilters.isSpecial = 'true';
      if (urlParams.get('isDiscounted') === 'true') newFilters.isDiscounted = 'true';
      if (urlParams.get('color')) newFilters.color = urlParams.get('color');
      if (urlParams.get('size')) newFilters.size = urlParams.get('size');
      if (urlParams.get('inStock') === 'true') newFilters.inStock = 'true';
      if (urlParams.get('sortBy')) newFilters.sortBy = urlParams.get('sortBy');
      
      // Only update if there are changes
      if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
        setFilters(newFilters);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Loading skeleton component
  const ProductSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{subCategoryInfo?.name || subcategory} - {categoryInfo?.name || category} - Zagro Footwear</title>
        <meta name="description" content={`Shop ${subCategoryInfo?.name || subcategory} products in ${categoryInfo?.name || category} at Zagro Footwear`} />
      </Head>
      
      <Layout>
        <div className="min-h-screen bg-gray-50">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <a href="/" className="text-gray-400 hover:text-gray-500">Home</a>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <a href={`/categories/${category}`} className="ml-4 text-gray-400 hover:text-gray-500 capitalize">
                        {categoryInfo?.name || category}
                      </a>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-500 capitalize">
                        {subCategoryInfo?.name || subcategory}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
          </div>

          {/* Header Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 capitalize">
                    {subCategoryInfo?.name || subcategory}
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Showing: {totalProducts} Results
                  </p>
                  {subCategoryInfo?.description && (
                    <p className="mt-2 text-gray-500 text-sm">
                      {subCategoryInfo.description}
                    </p>
                  )}
                </div>
                
                {/* Sort Dropdown */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="border text-gray-900 placeholder-gray-500 border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none pr-8"
                      style={{ color: '#111827' }}
                    >
                    <option value="featured">Featured</option>
                    <option value="bestSelling">Best Selling</option>
                    <option value="a-z">A-Z</option>
                    <option value="z-a">Z-A</option>
                    <option value="lowestPrice">Lowest Price</option>
                    <option value="highestPrice">Highest Price</option>
                    <option value="newest">New to Old</option>
                    <option value="oldest">Old to New</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filters
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {Object.values(filters).filter(value => value !== '' && value !== 'createdAt' && value !== 'desc').length}
                </span>
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Mobile Filters Overlay */}
              {showMobileFilters && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)}>
                  <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4 overflow-y-auto h-full pb-20">
                      {/* Mobile Filters Content - Same as desktop */}
                      <div className="space-y-6">
                        {/* Other Subcategories */}
                        {subCategories.length > 1 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Other Subcategories
                              <span className="text-xs text-blue-600 ml-1">(Visual Only)</span>
                            </label>
                            <div className="space-y-2">
                              {subCategories.map((subCat) => (
                                <a
                                  key={subCat.id || subCat._id}
                                  href={`/categories/${category}/${subCat.slug || subCat.name?.toLowerCase()}`}
                                  className={`block text-sm py-1 px-2 rounded ${
                                    subCat.slug === subcategory || subCat.name?.toLowerCase() === subcategory
                                      ? 'bg-blue-100 text-blue-700 font-medium'
                                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                  }`}
                                >
                                  {subCat.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Price Range */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Price Range
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={filters.minPrice}
                              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                              placeholder="Min"
                              className="w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              style={{ color: '#111827' }}
                            />
                            <input
                              type="number"
                              value={filters.maxPrice}
                              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                              placeholder="Max"
                              className="w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              style={{ color: '#111827' }}
                            />
                          </div>
                        </div>

                        {/* Product Types */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Product Types
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filters.isFeatured === 'true'}
                                onChange={(e) => handleFilterChange('isFeatured', e.target.checked ? 'true' : '')}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">Featured</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filters.isBestSeller === 'true'}
                                onChange={(e) => handleFilterChange('isBestSeller', e.target.checked ? 'true' : '')}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">Best Seller</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filters.isTrending === 'true'}
                                onChange={(e) => handleFilterChange('isTrending', e.target.checked ? 'true' : '')}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">Trending</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filters.isSpecial === 'true'}
                                onChange={(e) => handleFilterChange('isSpecial', e.target.checked ? 'true' : '')}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">Special</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filters.isDiscounted === 'true'}
                                onChange={(e) => handleFilterChange('isDiscounted', e.target.checked ? 'true' : '')}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">On Sale</span>
                            </label>
                          </div>
                        </div>

                        {/* Colors */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Colors
                          </label>
                          <select
                            value={filters.color}
                            onChange={(e) => handleFilterChange('color', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            <option value="">All Colors</option>
                            <option value="black">Black</option>
                            <option value="white">White</option>
                            <option value="red">Red</option>
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="yellow">Yellow</option>
                            <option value="pink">Pink</option>
                            <option value="purple">Purple</option>
                            <option value="orange">Orange</option>
                            <option value="brown">Brown</option>
                            <option value="gray">Gray</option>
                            <option value="navy">Navy</option>
                            <option value="maroon">Maroon</option>
                          </select>
                        </div>

                        {/* Sizes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Sizes
                          </label>
                          <select
                            value={filters.size}
                            onChange={(e) => handleFilterChange('size', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            <option value="">All Sizes</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                            <option value="XXXL">XXXL</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                          </select>
                        </div>

                        {/* Stock Availability */}
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.inStock === 'true'}
                              onChange={(e) => handleFilterChange('inStock', e.target.checked ? 'true' : '')}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
                      <div className="flex gap-2">
                        <button
                          onClick={clearFilters}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => setShowMobileFilters(false)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Filters Sidebar */}
              <div className="hidden lg:block lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                  
                  {/* Other Subcategories */}
                  {subCategories.length > 1 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Other Subcategories
                        <span className="text-xs text-blue-600 ml-1">(Visual Only)</span>
                      </label>
                      <div className="space-y-2">
                        {subCategories.map((subCat) => (
                          <a
                            key={subCat.id || subCat._id}
                            href={`/categories/${category}/${subCat.slug || subCat.name?.toLowerCase()}`}
                            className={`block text-sm py-1 px-2 rounded ${
                              subCat.slug === subcategory || subCat.name?.toLowerCase() === subcategory
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            {subCat.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        placeholder="Min"
                        className="w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        style={{ color: '#111827' }}
                      />
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        placeholder="Max"
                        className="w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        style={{ color: '#111827' }}
                      />
                    </div>
                  </div>

                  {/* Product Types */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Product Types
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.isFeatured === 'true'}
                          onChange={(e) => handleFilterChange('isFeatured', e.target.checked ? 'true' : '')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Featured</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.isBestSeller === 'true'}
                          onChange={(e) => handleFilterChange('isBestSeller', e.target.checked ? 'true' : '')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Best Seller</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.isTrending === 'true'}
                          onChange={(e) => handleFilterChange('isTrending', e.target.checked ? 'true' : '')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Trending</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.isSpecial === 'true'}
                          onChange={(e) => handleFilterChange('isSpecial', e.target.checked ? 'true' : '')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Special</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.isDiscounted === 'true'}
                          onChange={(e) => handleFilterChange('isDiscounted', e.target.checked ? 'true' : '')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">On Sale</span>
                      </label>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Colors
                    </label>
                    <div className="relative">
                      <select
                        value={filters.color}
                        onChange={(e) => handleFilterChange('color', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                      >
                      <option value="">All Colors</option>
                      <option value="black">Black</option>
                      <option value="white">White</option>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="pink">Pink</option>
                      <option value="purple">Purple</option>
                      <option value="orange">Orange</option>
                      <option value="brown">Brown</option>
                      <option value="gray">Gray</option>
                      <option value="navy">Navy</option>
                      <option value="maroon">Maroon</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Sizes
                    </label>
                    <div className="relative">
                      <select
                        value={filters.size}
                        onChange={(e) => handleFilterChange('size', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                      >
                      <option value="">All Sizes</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="XXXL">XXXL</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Stock Availability */}
                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.inStock === 'true'}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked ? 'true' : '')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="flex-1">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {[...Array(8)].map((_, index) => (
                      <ProductSkeleton key={index} />
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                      {products.map((product, index) => (
                        <ProductCard key={product.id || product._id || index} product={product} />
                      ))}
                    </div>
                    
                    {/* Loading More Indicator */}
                    {loadingMore && (
                      <div className="mt-8 flex justify-center">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="text-gray-600">Loading more products...</span>
                        </div>
                      </div>
                    )}
                    
                    {/* No More Products
                    {!hasMore && products.length > 0 && (
                      <div className="mt-8 text-center text-gray-500">
                        <p>No more products to load</p>
                      </div>
                    )} */}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search terms</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

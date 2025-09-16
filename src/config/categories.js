// Category configuration for the e-commerce platform
// This file centralizes all category information for easy management

export const categories = {
  'new-arrivals': {
    id: 'new-arrivals',
    title: 'New Arrivals',
    description: 'Discover the latest products just in',
    icon: '🆕',
    color: 'blue',
    apiEndpoint: '/api/products/new-arrivals',
    sortOptions: ['newest', 'price-low-high', 'price-high-low', 'rating'],
    filters: ['brand', 'price-range', 'category']
  },
  'bestsellers': {
    id: 'bestsellers',
    title: 'Best Sellers',
    description: 'Most popular and trending products',
    icon: '🔥',
    color: 'red',
    apiEndpoint: '/api/products/bestsellers',
    sortOptions: ['popularity', 'rating', 'price-low-high', 'price-high-low'],
    filters: ['brand', 'price-range', 'category', 'rating']
  },
  'trending': {
    id: 'trending',
    title: 'Trending Now',
    description: 'What\'s hot and trending right now',
    icon: '📈',
    color: 'purple',
    apiEndpoint: '/api/products/trending',
    sortOptions: ['trending', 'newest', 'rating', 'price-low-high'],
    filters: ['brand', 'price-range', 'category']
  },
  'special-offer': {
    id: 'special-offer',
    title: 'Special Offers',
    description: 'Limited time deals and discounts',
    icon: '🎉',
    color: 'green',
    apiEndpoint: '/api/products/special-offer',
    sortOptions: ['discount-high', 'price-low-high', 'newest', 'rating'],
    filters: ['brand', 'price-range', 'category', 'discount-range']
  },
  'men': {
    id: 'men',
    title: 'Men\'s Collection',
    description: 'Stylish products for men',
    icon: '👨',
    color: 'indigo',
    apiEndpoint: '/api/products/men',
    sortOptions: ['newest', 'price-low-high', 'price-high-low', 'rating', 'popularity'],
    filters: ['brand', 'price-range', 'subcategory', 'size', 'color', 'rating']
  },
  'women': {
    id: 'women',
    title: 'Women\'s Collection',
    description: 'Elegant products for women',
    icon: '👩',
    color: 'pink',
    apiEndpoint: '/api/products/women',
    sortOptions: ['newest', 'price-low-high', 'price-high-low', 'rating', 'popularity'],
    filters: ['brand', 'price-range', 'subcategory', 'size', 'color', 'rating']
  },
  'kids': {
    id: 'kids',
    title: 'Kids Collection',
    description: 'Fun and safe products for kids',
    icon: '👶',
    color: 'yellow',
    apiEndpoint: '/api/products/kids',
    sortOptions: ['newest', 'price-low-high', 'price-high-low', 'rating', 'age-group'],
    filters: ['brand', 'price-range', 'subcategory', 'age-group', 'size', 'color']
  }
};

// Default category for when no specific category is selected
export const defaultCategory = {
  id: 'all',
  title: 'All Products',
  description: 'Explore our complete collection',
  icon: '🌟',
  color: 'gray',
  apiEndpoint: '/api/products/all',
  sortOptions: ['newest', 'popularity', 'rating', 'price-low-high', 'price-high-low'],
  filters: ['brand', 'price-range', 'category', 'rating', 'availability']
};

// Helper function to get category by ID
export const getCategoryById = (id) => {
  return categories[id] || defaultCategory;
};

// Helper function to get all category IDs
export const getAllCategoryIds = () => {
  return Object.keys(categories);
};

// Helper function to get category metadata for SEO
export const getCategoryMetadata = (id) => {
  const category = getCategoryById(id);
  return {
    title: `${category.title} - Zagro Store`,
    description: category.description,
    keywords: `${category.title.toLowerCase()}, products, shopping, zagro`,
    ogImage: `/images/categories/${id}.jpg` // You can add category-specific images later
  };
};

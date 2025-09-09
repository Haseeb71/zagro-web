import { createSlice } from '@reduxjs/toolkit';

// Helper function to get proper image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${imagePath.replace(/\\/g, '/')}`;
};

// Helper function to format price
const formatPrice = (price) => {
  if (!price || price < 1000) return price;
  
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (price >= 1000) {
    return (price / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  
  return price;
};

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
  autoCloseTimer: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, selectedSize, selectedColor, selectedImage } = action.payload;
      
      // Create a unique ID for this cart item
      const itemId = `${product._id}-${selectedSize || 'no-size'}-${selectedColor || 'no-color'}`;
      
      // Check if item already exists with same size and color
      const existingItem = state.items.find(item => item.id === itemId);
      
      if (existingItem) {
        // Update quantity if item exists
        existingItem.quantity += quantity;
      } else {
        // Add new item to cart
        const newItem = {
          id: itemId,
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            image: selectedImage || (product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : null),
            brand: product.brand,
            category: product.category,
            description: product.description,
            rating: product.rating,
            reviewCount: product.reviewCount,
            quantity: product.quantity,
            discountPercentage: product.discountPercentage || 0,
            isFeatured: product.isFeatured,
            isNew: product.isNew,
            isBestSeller: product.isBestSeller,
            isTrending: product.isTrending,
            isSpecial: product.isSpecial,
            isDiscounted: product.isDiscounted,
          },
          quantity,
          selectedSize: selectedSize || null,
          selectedColor: selectedColor || null,
          selectedImage: selectedImage || (product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : null),
          addedAt: new Date().toISOString(),
          replaced: false,
        };
        
        state.items.push(newItem);
      }
      
      // Update totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      
      // Set auto-close timer (5 seconds)
      state.autoCloseTimer = Date.now() + 5000;
    },
    
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      
      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter(item => item.id !== itemId);
        } else {
          item.quantity = quantity;
        }
        
        // Update totals
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalPrice = state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      }
    },
    
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item.id !== itemId);
      
      // Update totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.autoCloseTimer = null;
    },
    
    openCart: (state) => {
      state.isOpen = true;
    },
    
    closeCart: (state) => {
      state.isOpen = false;
      state.autoCloseTimer = null;
    },
    
    clearAutoCloseTimer: (state) => {
      state.autoCloseTimer = null;
    },
    
    updateItemDetails: (state, action) => {
      const { itemId, selectedSize, selectedColor, selectedImage } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      
      if (item) {
        item.selectedSize = selectedSize;
        item.selectedColor = selectedColor;
        item.selectedImage = selectedImage;
        item.replaced = true;
      }
    },
    
    // Load cart from localStorage
    loadCartFromStorage: (state, action) => {
      const savedCart = action.payload;
      if (savedCart && savedCart.items) {
        state.items = savedCart.items;
        state.totalItems = savedCart.totalItems || 0;
        state.totalPrice = savedCart.totalPrice || 0;
      }
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  openCart,
  closeCart,
  clearAutoCloseTimer,
  updateItemDetails,
  loadCartFromStorage,
} = cartSlice.actions;

export default cartSlice.reducer;

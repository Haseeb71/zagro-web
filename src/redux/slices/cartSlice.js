import { createSlice } from '@reduxjs/toolkit';

// Helper function to get cart from localStorage
const getCartFromStorage = () => {
  if (typeof window !== 'undefined') {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }
  return [];
};

// Helper function to save cart to localStorage
const saveCartToStorage = (cart) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
};

const initialState = {
  items: getCartFromStorage(),
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
  autoCloseTimer: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action) => {
      const { 
        name, 
        price, 
        image, 
        quantity = 1, 
        selectedSize = null, 
        selectedColor = null,
        productId 
      } = action.payload;
      
      // Create essential product data
      const essentialProduct = {
        _id: productId,
        name,
        price,
        image
      };
      
      // Check if item already exists in cart (same product, size, and color)
      const existingItemIndex = state.items.findIndex(
        item => 
          item.product._id === productId && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor
      );

      if (existingItemIndex >= 0) {
        // If exact same item exists (same product, size, and color), increase quantity
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Check if there's a previous version of this product without size/color
        const previousItemIndex = state.items.findIndex(
          item => 
            item.product._id === productId && 
            (!item.selectedSize || !item.selectedColor)
        );

        if (previousItemIndex >= 0) {
          // Replace the previous item with the new one (with size/color)
          state.items[previousItemIndex] = {
            id: `${productId}_${selectedSize || 'default'}_${selectedColor || 'default'}`,
            product: essentialProduct,
            quantity,
            selectedSize,
            selectedColor,
            addedAt: new Date().toISOString(),
            replaced: true // Flag to indicate this item replaced a previous version
          };
        } else {
          // If no previous version exists, add new item (allows multiple sizes/colors of same product)
          state.items.push({
            id: `${productId}_${selectedSize || 'default'}_${selectedColor || 'default'}`,
            product: essentialProduct,
            quantity,
            selectedSize,
            selectedColor,
            addedAt: new Date().toISOString()
          });
        }
      }

      // Update totals
      cartSlice.caseReducers.updateTotals(state);
      
      // Save to localStorage
      saveCartToStorage(state.items);
      
      // Open cart and set auto-close timer
      state.isOpen = true;
      state.autoCloseTimer = Date.now() + 5000; // 5 seconds from now
    },

    // Remove item from cart
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item.id !== itemId);
      
      // Update totals
      cartSlice.caseReducers.updateTotals(state);
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },

    // Update item quantity
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
        cartSlice.caseReducers.updateTotals(state);
        
        // Save to localStorage
        saveCartToStorage(state.items);
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
    },

    // Toggle cart visibility
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
      // Clear auto-close timer when manually toggling
      state.autoCloseTimer = null;
    },

    // Open cart
    openCart: (state) => {
      state.isOpen = true;
      // Clear auto-close timer when manually opening
      state.autoCloseTimer = null;
    },

    // Close cart
    closeCart: (state) => {
      state.isOpen = false;
      // Clear auto-close timer when manually closing
      state.autoCloseTimer = null;
    },

    // Clear auto-close timer
    clearAutoCloseTimer: (state) => {
      state.autoCloseTimer = null;
    },

    // Update totals (helper reducer)
    updateTotals: (state) => {
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);
    },

    // Load cart from localStorage (for hydration)
    loadCart: (state) => {
      const cart = getCartFromStorage();
      state.items = cart;
      cartSlice.caseReducers.updateTotals(state);
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
  clearAutoCloseTimer,
  loadCart
} = cartSlice.actions;

export default cartSlice.reducer;

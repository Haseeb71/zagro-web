import React from 'react';
import RatingStars from './RatingStars';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart, openCart } from '@/redux/slices/cartSlice';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

const ProductCard = ({ 
  product, 
  variant = 'default', // 'default', 'compact', 'minimal'
  onAddToCart, 
  onWishlist, 
  onQuickView,
  className = ''
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const variants = {
    default: {
      imageSize: 'w-full h-64',
      cardPadding: 'p-4',
      titleSize: 'text-lg',
      priceSize: 'text-xl',
      showRating: true,
      showActions: true
    },
    compact: {
      imageSize: 'w-20 h-20',
      cardPadding: 'p-3',
      titleSize: 'text-sm',
      priceSize: 'text-base',
      showRating: true,
      showActions: false
    },
    minimal: {
      imageSize: 'w-16 h-16',
      cardPadding: 'p-2',
      titleSize: 'text-xs',
      priceSize: 'text-sm',
      showRating: false,
      showActions: false
    }
  };

  const currentVariant = variants[variant];

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add to Redux cart with essential data only
    const essentialData = {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0].url : null,
      quantity: 1
    };
    
    dispatch(addToCart(essentialData));
    
    // Open cart slider
    dispatch(openCart());
    
    // Show success toast
    toast.success(`${product.name} added to cart!`);
    
    // Call custom onAddToCart if provided
    onAddToCart?.(product);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group cursor-pointer ${currentVariant.cardPadding} ${className}`}>
      {/* Product Image Section */}
      <div className="relative mb-3 overflow-hidden rounded-lg">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0].url} 
            alt={product.images[0].alt || product.name}
            className={`${currentVariant.imageSize} object-cover group-hover:scale-110 transition-transform duration-300`}
          />
        ) : (
          <div className={`${currentVariant.imageSize} bg-gray-200 flex items-center justify-center`}>
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className="space-y-2">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {product.brand}
          </p>
        )}

        {/* Product Name */}
        <h3 className={`${currentVariant.titleSize} font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2`}
        onClick={() => router.push(`/products/${product._id}`)}>
          {product.name}
        </h3>

        {/* Rating */}
        {currentVariant.showRating && (
          <div className="flex items-center justify-between">
            <RatingStars rating={product.rating} size="sm" showRating={false} />
            <span className="text-xs text-gray-500">
              ({product.reviewCount || 0} reviews)
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`${currentVariant.priceSize} font-bold text-blue-600`}>
              ${product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          {product.inStock !== undefined && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              product.inStock 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {currentVariant.showActions && (
          <button
            onClick={handleAddToCart}
            disabled={product.inStock === false}
            className="cursor-pointer w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium group-hover:shadow-md"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

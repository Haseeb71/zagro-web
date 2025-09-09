import React from 'react';
import RatingStars from './RatingStars';
// import { useAppDispatch } from '../redux/hooks';
// import { addToCart, openCart } from '../redux/slices/cartSlice';
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
  // const dispatch = useAppDispatch();
  
  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${imagePath.replace(/\\/g, '/')}`;
  };

  // Helper function to format price (e.g., 1000 -> 1k, 1500 -> 1.5k)
  const formatPrice = (price) => {
    if (!price || price < 1000) return price;
    
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (price >= 1000) {
      return (price / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    
    return price;
  };
  
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

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleProductClick = () => {
    router.push(`/product?id=${product._id}`);
  };


  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group cursor-pointer ${currentVariant.cardPadding} ${className}`}
      onClick={handleProductClick}
    >
        {/* Product Image Section */}
        <div className="relative mb-3 overflow-hidden rounded-lg">
          {product.images && product.images.length > 0 ? (
            <img 
              src={getImageUrl(product.images[0])} 
              alt={product.name}
              className={`${currentVariant.imageSize} object-cover group-hover:scale-110 transition-transform duration-300`}
            />
          ) : (
            <div className={`${currentVariant.imageSize} bg-gray-200 flex items-center justify-center`}>
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
          
          {/* Discount Badge */}
          {product.discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
              -{product.discountPercentage}%
            </div>
          )}
          
          {/* Product Type Badges */}
          {/* <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.isFeatured && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">Featured</span>
            )}
            {product.isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">New</span>
            )}
            {product.isBestSeller && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">Best Seller</span>
            )}
            {product.isTrending && (
              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-semibold">Trending</span>
            )}
            {product.isSpecial && (
              <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold">Special</span>
            )}
            {product.isDiscounted && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">Discounted</span>
            )}
          </div> */}
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
        <h3 className={`${currentVariant.titleSize} font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2`}>
          {product.name.length > 16 ? product.name.slice(0, 16) + '...' : product.name}
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
              ${formatPrice(product.price)}
            </span>
            {product.discountPercentage > 0 && (
              <span className="text-sm text-gray-500 line-through">
                ${formatPrice(Math.round(product.price / (1 - product.discountPercentage / 100)))}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          <span className={`text-xs px-2 py-1 rounded-full ${
            product.quantity > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* View product Button */}
        {currentVariant.showActions && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick();
            }}
            disabled={product.quantity === 0}
            className="cursor-pointer w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium group-hover:shadow-md"
          >
            View product
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

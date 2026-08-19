import React from 'react';
import RatingStars from './RatingStars';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart, openCart } from '@/redux/slices/cartSlice';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { labelOf } from '../utils/labelOf';
import { productImageUrl } from '../utils/mediaUrl';
import { resolveProductPricing } from '../utils/pricing';
import { productRequiresSize } from '../config/productTypes';

const ProductCard = ({
  product,
  variant = 'default',
  onAddToCart,
  className = '',
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const imageSrc = productImageUrl(product);
  const brandName = labelOf(product.brand);
  const { price, originalPrice, discount } = resolveProductPricing(product);
  const needsSize = productRequiresSize(product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Sized products must pick a size on PDP
    if (needsSize) {
      router.push(`/products/${product._id}`);
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: price,
        image: imageSrc,
        quantity: 1,
        productType: product.productType || 'simple',
      })
    );
    dispatch(openCart());
    toast.success(`${product.name} added to cart!`);
    onAddToCart?.(product);
  };

  const goToProduct = () => router.push(`/products/${product._id}`);

  if (variant === 'compact' || variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={goToProduct}
        className={`glass-card flex gap-3 p-3 text-left w-full ${className}`}
      >
        <div className={`${variant === 'minimal' ? 'h-14 w-14' : 'h-20 w-20'} rounded-lg overflow-hidden bg-black/5 shrink-0`}>
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt={product.name} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0">
          {brandName ? <p className="text-[10px] uppercase tracking-wider text-[#8a7350]">{brandName}</p> : null}
          <p className="text-sm font-medium truncate">{product.name}</p>
          <p className="text-sm text-[#9a7a4f] mt-1">
            Rs {Number(price || 0).toLocaleString()}
            {originalPrice > price ? (
              <span className="ml-2 text-[#6b6560] line-through">Rs {Number(originalPrice).toLocaleString()}</span>
            ) : null}
          </p>
        </div>
      </button>
    );
  }

  return (
    <article
      className={`glass-card group overflow-hidden flex flex-col h-full transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(20,18,16,0.12)] ${className}`}
    >
      <button type="button" onClick={goToProduct} className="relative block w-full aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#efebe4] to-[#ddd6cb] text-left">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-[#6b6560]">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60" />
        {discount ? (
          <span className="absolute top-3 left-3 glass-pill text-xs font-semibold text-[#141210]">
            -{discount}%
          </span>
        ) : null}
      </button>

      <div className="p-3 sm:p-5 flex flex-col flex-1 gap-1.5 sm:gap-2">
        {brandName ? (
          <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#8a7350] truncate">{brandName}</p>
        ) : null}

        <h3
          className="font-display text-base sm:text-xl leading-snug text-[#141210] cursor-pointer hover:text-[#9a7a4f] transition line-clamp-2"
          onClick={goToProduct}
        >
          {product.name}
        </h3>

        <div className="hidden sm:flex items-center justify-between gap-2">
          <RatingStars rating={product.rating || 4.5} size="sm" showRating={false} />
          <span className="text-[11px] text-[#6b6560]">({product.reviewCount || 0})</span>
        </div>

        <div className="mt-auto pt-2 sm:pt-3 flex items-end sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-base sm:text-2xl text-[#141210] leading-tight">
              Rs {Number(price || 0).toLocaleString()}
            </p>
            {originalPrice > price ? (
              <p className="text-[10px] sm:text-xs text-[#6b6560] line-through">
                Rs {Number(originalPrice).toLocaleString()}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.inStock === false}
            className="shrink-0 rounded-full bg-[#141210] text-white text-[11px] sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-[#2a2620] disabled:bg-gray-400 transition shadow-lg shadow-black/10"
          >
            {needsSize ? 'Select' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

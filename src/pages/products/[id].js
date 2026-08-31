import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import productsAPI from '../../APIs/eproducts';
import { useAppDispatch } from '../../redux/hooks';
import { addToCart } from '../../redux/slices/cartSlice';
import { labelOf } from '../../utils/labelOf';
import { productImageUrl, mediaUrl } from '../../utils/mediaUrl';
import ProductCard from '../../components/ProductCard';
import { toast } from 'react-hot-toast';
import { productRequiresSize, productRequiresColor, getAvailableSizes, getAvailableColors } from '../../config/productTypes';

const formatRs = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();
  const relatedSliderRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await productsAPI.getProductById(id);
        const apiProduct = response?.data?.product;
        if (!apiProduct) {
          if (!cancelled) {
            setError('Product not found');
            setProduct(null);
          }
          return;
        }

        const mapped = {
          id: apiProduct._id,
          name: apiProduct.name,
          brand: labelOf(apiProduct.brand),
          brandSlug: typeof apiProduct.brand === 'object' ? apiProduct.brand?.slug : null,
          category: labelOf(apiProduct.category),
          categorySlug: typeof apiProduct.category === 'object' ? apiProduct.category?.slug : null,
          price: apiProduct.price,
          originalPrice: apiProduct.originalPrice,
          discount: apiProduct.discount || apiProduct.discountPercentage,
          rating: apiProduct.rating || 4.5,
          reviewCount: apiProduct.reviewCount || 0,
          description: apiProduct.description || '',
          images: (apiProduct.images || []).map((img) => productImageUrl(img)).filter(Boolean),
          inStock: apiProduct.isInStock ?? apiProduct.quantity > 0,
          quantityAvailable: apiProduct.quantity ?? 0,
          productType: apiProduct.productType || 'simple',
          sizes: Array.isArray(apiProduct.sizes) ? apiProduct.sizes : [],
          sizeQuantities: apiProduct.sizeQuantities || {},
          colorQuantities: apiProduct.colorQuantities || {},
          requiresSize: productRequiresSize(apiProduct),
          requiresColor: productRequiresColor(apiProduct),
        };

        if (!cancelled) {
          setProduct(mapped);
          setActiveImage(0);
          setQuantity(1);
          setSelectedSize('');
          setSelectedColor('');
        }

        try {
          const similar = await productsAPI.getFilteredProducts({
            category: mapped.categorySlug || undefined,
            page: 1,
            limit: 4,
          });
          const list = (similar?.data?.products || []).filter((p) => p._id !== apiProduct._id).slice(0, 4);
          if (!cancelled) setRelated(list);
        } catch (_) {
          if (!cancelled) setRelated([]);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Failed to load product');
          setProduct(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.requiresSize && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (product.requiresColor && !selectedColor) {
      toast.error('Please select a colour');
      return;
    }
    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || null,
        quantity,
        size: selectedSize || null,
        color: selectedColor || null,
        productType: product.productType,
      })
    );
    const extras = [selectedSize, selectedColor].filter(Boolean).join(' / ');
    toast.success(`${product.name}${extras ? ` (${extras})` : ''} added to cart`);
  };

  const availableSizes = product ? getAvailableSizes(product) : [];
  const availableColors = product ? getAvailableColors(product) : [];
  const sizeStockLeft = selectedSize && product?.sizeQuantities?.[selectedSize] != null
    ? Number(product.sizeQuantities[selectedSize])
    : product?.quantityAvailable;

  if (isLoading) {
    return (
      <div className="shop-glass-bg min-h-screen flex items-center justify-center">
        <div className="glass-panel px-8 py-6 text-[#6b6560]">Loading piece…</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="shop-glass-bg min-h-screen flex items-center justify-center px-4">
        <div className="glass-panel p-8 text-center max-w-md">
          <h1 className="font-display text-2xl mb-2">Piece not found</h1>
          <p className="text-sm text-[#6b6560] mb-5">{error || 'This product is unavailable.'}</p>
          <Link href="/shop" className="inline-flex rounded-full bg-[#141210] text-white px-5 py-2.5 text-sm">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [null];
  const mainImage = images[activeImage] || images[0];

  return (
    <>
      <Head>
        <title>{`${product.name}${product.brand ? ` · ${product.brand}` : ''} | Khareedo`}</title>
        <meta name="description" content={product.description?.slice(0, 160) || product.name} />
      </Head>

      <div className="shop-glass-bg min-h-screen">
        <div className="px-4 sm:px-8 lg:px-16 pt-6 sm:pt-8">
          <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#6b6560]">
            <Link href="/" className="hover:text-[#9a7a4f]">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#9a7a4f]">Shop</Link>
            {product.categorySlug ? (
              <>
                <span>/</span>
                <Link href={`/categories/${product.categorySlug}`} className="hover:text-[#9a7a4f]">
                  {product.category}
                </Link>
              </>
            ) : null}
            <span>/</span>
            <span className="text-[#141210] line-clamp-1">{product.name}</span>
          </nav>
        </div>

        <div className="px-4 sm:px-8 lg:px-16 py-8 sm:py-12 grid lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="glass-card overflow-hidden relative aspect-[4/5] sm:aspect-square bg-gradient-to-br from-[#efebe4] to-[#d9d2c6]">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl(mainImage) || mainImage}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#6b6560]">No image</div>
              )}
              {product.discount ? (
                <span className="absolute top-4 left-4 glass-pill px-3 py-1 text-xs font-semibold">
                  −{product.discount}%
                </span>
              ) : null}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={src || i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      activeImage === i ? 'border-[#c4a574]' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl(src) || src} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-black/5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="glass-panel p-5 sm:p-8 lg:p-10 flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
              {product.brand ? (
                <Link
                  href={product.brandSlug ? `/shop?brand=${product.brandSlug}` : '/shop'}
                  className="glass-pill px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8a7350]"
                >
                  {product.brand}
                </Link>
              ) : null}
              {product.category ? (
                <span className="glass-pill px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#6b6560]">
                  {product.category}
                </span>
              ) : null}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#141210] leading-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3 text-sm text-[#6b6560]">
              <div className="flex items-center gap-0.5 text-[#c4a574]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-current' : 'fill-none stroke-current opacity-40'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span>{product.rating} · {product.reviewCount} reviews</span>
            </div>

            <div className="mt-6 flex items-end gap-3 flex-wrap">
              <p className="font-display text-3xl sm:text-4xl text-[#141210]">{formatRs(product.price)}</p>
              {product.originalPrice > product.price ? (
                <>
                  <p className="text-lg text-[#6b6560] line-through pb-1">{formatRs(product.originalPrice)}</p>
                  {product.discount ? (
                    <span className="mb-1 glass-pill px-2.5 py-1 text-xs font-semibold text-[#141210]">
                      -{product.discount}%
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>

            <p className="mt-5 text-[#6b6560] text-sm sm:text-base leading-relaxed font-light">
              {product.description || 'A refined piece from the Khareedo collection.'}
            </p>

            <div className="mt-8 flex items-center gap-2 text-sm">
              <span className={`h-2 w-2 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={product.inStock ? 'text-emerald-700' : 'text-red-600'}>
                {product.inStock
                  ? `In stock${sizeStockLeft != null ? ` · ${sizeStockLeft} available` : ''}`
                  : 'Out of stock'}
              </span>
            </div>

            {product.requiresSize && availableSizes.length > 0 ? (
              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a7350] mb-2">
                  Size {selectedSize ? `· ${selectedSize}` : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const qty = product.sizeQuantities?.[s];
                    const soldOut = qty != null && Number(qty) <= 0;
                    const active = selectedSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={soldOut}
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[3rem] px-3 py-2 rounded-full text-sm border transition ${
                          active
                            ? 'bg-[#141210] text-white border-[#141210]'
                            : soldOut
                              ? 'opacity-35 cursor-not-allowed border-black/10 line-through'
                              : 'border-black/15 hover:border-[#c4a574]'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {product.requiresColor && availableColors.length > 0 ? (
              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a7350] mb-2">
                  Colour {selectedColor ? `· ${selectedColor}` : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((c) => {
                    const qty = product.colorQuantities?.[c];
                    const soldOut = qty != null && Number(qty) <= 0;
                    const active = selectedColor === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        disabled={soldOut}
                        onClick={() => setSelectedColor(c)}
                        className={`min-w-[3rem] px-3 py-2 rounded-full text-sm border transition ${
                          active
                            ? 'bg-[#141210] text-white border-[#141210]'
                            : soldOut
                              ? 'opacity-35 cursor-not-allowed border-black/10 line-through'
                              : 'border-black/15 hover:border-[#c4a574]'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="inline-flex items-center gap-3 glass-pill px-2 py-1.5 w-fit">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-9 w-9 rounded-full hover:bg-white/80 transition"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="h-9 w-9 rounded-full hover:bg-white/80 transition"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 rounded-full bg-[#141210] text-white py-3.5 px-6 text-sm font-medium hover:bg-[#2a2620] disabled:bg-gray-400 transition shadow-lg shadow-black/10"
              >
                Add to cart
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-black/5 text-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a7350]">Returns</p>
              <p className="mt-1 text-[#141210]">7-day easy returns</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="px-4 sm:px-8 lg:px-16 pb-16 sm:pb-20">
            <div className="flex items-end justify-between mb-5 sm:mb-8 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#8a7350]">More</p>
                <h2 className="font-display text-3xl sm:text-4xl mt-1">You may also like</h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href="/shop" className="text-sm text-[#9a7a4f] hover:underline hidden sm:inline mr-1">
                  View all
                </Link>
                <button
                  type="button"
                  onClick={() => relatedSliderRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}
                  className="h-9 w-9 rounded-full border border-black/10 bg-white/80 flex items-center justify-center hover:bg-white transition"
                  aria-label="Previous"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => relatedSliderRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}
                  className="h-9 w-9 rounded-full border border-black/10 bg-white/80 flex items-center justify-center hover:bg-white transition"
                  aria-label="Next"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div
              ref={relatedSliderRef}
              className="flex gap-3 sm:gap-5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {related.map((p) => (
                <div
                  key={p._id}
                  className="snap-start shrink-0 w-[72vw] max-w-[260px] sm:w-[240px] lg:w-[260px]"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import productsAPI from '../APIs/eproducts';
import categoriesAPI from '../APIs/categories';
import brandsAPI from '../APIs/brands';
import bannersAPI from '../APIs/banners';
import ProductCard from '../components/ProductCard';
import { mediaUrl } from '../utils/mediaUrl';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  const [categorySections, setCategorySections] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [catRes, brandRes, bannerRes, featuredRes, newRes] = await Promise.all([
          categoriesAPI.getAllCategories(),
          brandsAPI.getAll(),
          bannersAPI.getActive(),
          productsAPI.getLandingPageProducts().catch(() => null),
          productsAPI.getNewArrivals().catch(() => null),
        ]);

        const cats = catRes?.data?.categories || [];
        setCategories(cats);
        setBrands((brandRes?.data?.brands || []).filter((b) => b.isActive !== false));
        setBanners(bannerRes?.data?.banners || []);

        const byType = featuredRes?.data?.productsByType || [];
        const featuredGroup = byType.find((g) => g.type === 'featured' || g.type === 'all');
        setFeatured(featuredGroup?.products?.slice(0, 8) || newRes?.data?.products?.slice(0, 8) || []);
        setNewArrivals(newRes?.data?.products ?? []);

        // Dynamic per-category sessions (full catalog sections)
        const sectionResults = await Promise.all(
          cats.map(async (cat) => {
            try {
              const res = await productsAPI.getFilteredProducts({
                category: cat.slug,
                page: 1,
                limit: 8,
              });
              const list = res?.data?.products || [];
              return list.length ? { category: cat, products: list } : null;
            } catch (_) {
              return null;
            }
          })
        );
        setCategorySections(sectionResults.filter(Boolean));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const activeBanner = banners[bannerIndex] || null;
  const heroSrc = mediaUrl(activeBanner?.image);
  const productsToShow = (newArrivals.length > 0 ? newArrivals : featured).slice(0, 8);

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      {/* Hero — shorter & tighter on mobile */}
      <section className="relative min-h-[72svh] sm:min-h-[88vh] w-full overflow-hidden bg-[#141210]">
        {heroSrc ? (
          <Image
            key={heroSrc}
            src={heroSrc}
            alt={activeBanner?.title || 'Banner'}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1814] via-[#2a2620] to-[#141210]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/80 via-black/45 to-black/20 sm:to-transparent" />
        <div className="relative z-10 min-h-[72svh] sm:min-h-[88vh] flex flex-col justify-end px-4 sm:px-10 lg:px-16 pb-10 sm:pb-20 pt-24">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-[#c4a574] mb-3 sm:mb-4">
            {activeBanner ? 'Featured' : 'Khareedo'}
          </p>
          <h1 className="store-hero-title text-[2.65rem] leading-[1.02] sm:text-7xl lg:text-8xl text-white max-w-3xl sm:leading-[0.95]">
            {activeBanner?.title?.trim() || 'Khareedo'}
          </h1>
          {activeBanner?.subtitle?.trim() ? (
            <p className="mt-3 sm:mt-5 max-w-md text-white/80 text-sm sm:text-lg font-light line-clamp-3">
              {activeBanner.subtitle.trim()}
            </p>
          ) : null}
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            <Link
              href={activeBanner?.link || '/shop'}
              className="inline-flex items-center bg-[#c4a574] text-[#141210] px-5 sm:px-6 py-3 text-sm font-medium tracking-wide hover:bg-[#d4b584] transition rounded-sm"
            >
              {activeBanner?.ctaText || 'Shop collection'}
            </Link>
          </div>
          {banners.length > 1 && (
            <div className="mt-6 sm:mt-8 flex gap-2">
              {banners.map((b, i) => (
                <button
                  key={b._id}
                  type="button"
                  aria-label={`Banner ${i + 1}`}
                  onClick={() => setBannerIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === bannerIndex ? 'w-8 bg-[#c4a574]' : 'w-3 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories — horizontal on mobile, tall cards on desktop */}
      <section className="px-4 sm:px-10 lg:px-16 py-10 sm:py-20">
        <div className="mb-6 sm:mb-12 max-w-xl">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[#8a7350]">Collections</p>
          <h2 className="font-display text-3xl sm:text-5xl mt-1.5 sm:mt-2">Shop by category</h2>
        </div>
        {categories.length > 0 ? (
          <div className="flex md:grid md:grid-cols-3 gap-3 sm:gap-5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory md:overflow-visible">
            {categories.map((cat) => {
              const img = mediaUrl(cat.image);
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => router.push(`/categories/${cat.slug}`)}
                  className="group relative snap-start shrink-0 w-[78vw] max-w-[300px] md:w-auto md:max-w-none h-[280px] sm:h-[360px] md:h-[420px] overflow-hidden text-left rounded-2xl md:rounded-none"
                >
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={cat.name}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#1a1814]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-end">
                    <h3 className="font-display text-3xl sm:text-4xl text-white">{cat.name}</h3>
                    {cat.description ? (
                      <p className="text-white/65 text-sm mt-1.5 line-clamp-2 font-light hidden sm:block">{cat.description}</p>
                    ) : null}
                    <span className="text-[#c4a574] text-sm mt-3 tracking-wide inline-flex items-center gap-2">
                      Explore <span aria-hidden>→</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-[#6b6560]">No categories yet.</p>
        )}
      </section>

      {/* Brands — split by type so Rolex never looks like a suit house */}
      <section className="shop-glass-bg border-y border-white/40 px-4 sm:px-10 lg:px-16 py-10 sm:py-20">
        <div className="text-center mb-6 sm:mb-10">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[#8a7350]">Houses</p>
          <h2 className="font-display text-3xl sm:text-5xl mt-1.5 sm:mt-2">Shop by brand</h2>
        </div>
        {[
          { key: 'watch', title: 'Watch brands', type: 'watch', category: 'watches' },
          { key: 'apparel', title: 'Suit & apparel brands', type: 'apparel', category: 'suits-apparel' },
        ].map((group) => {
          const groupBrands = brands.filter((b) =>
            Array.isArray(b.productTypes) && b.productTypes.includes(group.type)
          );
          if (!groupBrands.length) return null;
          return (
            <div key={group.key} className="mb-10 sm:mb-14 last:mb-0">
              <div className="flex items-end justify-between mb-4 sm:mb-6">
                <h3 className="font-display text-2xl sm:text-3xl">{group.title}</h3>
                <Link
                  href={`/shop?category=${group.category}&type=${group.type}`}
                  className="text-xs sm:text-sm text-[#9a7a4f] hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-5">
                {groupBrands.map((b) => {
                  const logo = mediaUrl(b.logo);
                  return (
                    <Link
                      key={b._id}
                      href={`/shop?brand=${b.slug}&type=${group.type}&category=${group.category}`}
                      className="group relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-black/10 active:scale-[0.98] transition"
                    >
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logo}
                          alt={b.name}
                          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#1a1612] flex items-center justify-center font-display text-4xl text-[#c4a574]">
                          {b.name.slice(0, 1)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                        <p className="text-sm sm:text-lg font-medium text-white tracking-wide drop-shadow">
                          {b.name}
                        </p>
                        <p className="text-[10px] sm:text-xs text-white/85 mt-0.5">View pieces →</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
        {!brands.some((b) => b.productTypes?.length) && (
          <p className="text-center text-[#6b6560] text-sm">Add brands in admin to populate this section.</p>
        )}
      </section>

      {/* Dynamic category product sessions */}
      {categorySections.map(({ category: cat, products }) => (
        <section key={cat._id} className="px-4 sm:px-10 lg:px-16 py-10 sm:py-16 border-t border-black/5">
          <div className="flex items-end justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[#8a7350]">Collection</p>
              <h2 className="font-display text-3xl sm:text-4xl mt-1.5">{cat.name}</h2>
              {cat.description ? (
                <p className="text-[#6b6560] text-xs sm:text-sm mt-1 font-light line-clamp-2">{cat.description}</p>
              ) : null}
            </div>
            <Link
              href={`/shop?category=${cat.slug}`}
              className="text-xs sm:text-sm text-[#9a7a4f] hover:underline shrink-0 pb-1"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      ))}

      {/* New arrivals */}
      <section className="px-4 sm:px-10 lg:px-16 py-10 sm:py-20">
        <div className="flex items-end justify-between gap-3 mb-6 sm:mb-10">
          <div>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[#8a7350]">Selected</p>
            <h2 className="font-display text-3xl sm:text-5xl mt-1.5 sm:mt-2">New arrivals</h2>
          </div>
          <Link href="/shop" className="text-xs sm:text-sm text-[#9a7a4f] hover:underline shrink-0 pb-1">
            View all
          </Link>
        </div>
        {isLoading ? (
          <div className="py-12 text-center text-[#6b6560] text-sm">Loading…</div>
        ) : productsToShow.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {productsToShow.map((product, index) => (
              <ProductCard key={product._id || product.id || index} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[#6b6560] text-sm border border-dashed border-black/10 rounded-xl">
            Catalog is empty — add products from admin.
          </div>
        )}
      </section>
    </div>
  );
}

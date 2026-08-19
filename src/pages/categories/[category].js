import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import productsAPI from '../../APIs/eproducts';
import brandsAPI from '../../APIs/brands';
import categoriesAPI from '../../APIs/categories';
import ProductCard from '../../components/ProductCard';
import { mediaUrl } from '../../utils/mediaUrl';

export default function CategoryPage() {
  const router = useRouter();
  const { category: categorySlug, brand: brandQuery } = router.query;
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoryMeta, setCategoryMeta] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    setSelectedBrand(typeof brandQuery === 'string' ? brandQuery : '');
  }, [router.isReady, brandQuery]);

  useEffect(() => {
    brandsAPI.getAll().then((res) => setBrands(res?.data?.brands || []));
    categoriesAPI.getAllCategories().then((res) => {
      const list = res?.data?.categories || [];
      if (typeof categorySlug === 'string') {
        setCategoryMeta(list.find((c) => c.slug === categorySlug) || null);
      }
    });
  }, [categorySlug]);

  useEffect(() => {
    if (!router.isReady || !categorySlug) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getFilteredProducts({
          category: categorySlug,
          brand: selectedBrand || undefined,
          page: 1,
          limit: 24,
        });
        if (!cancelled) {
          startTransition(() => setProducts(res?.data?.products || []));
        }
      } catch (_) {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, categorySlug, selectedBrand]);

  const applyBrand = (slug) => {
    setSelectedBrand(slug);
    const query = slug ? { brand: slug } : {};
    router.replace(
      { pathname: `/categories/${categorySlug}`, query },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  const title = useMemo(() => {
    const brand = brands.find((b) => b.slug === selectedBrand);
    const catName = categoryMeta?.name || categorySlug || 'Collection';
    if (brand) return `${brand.name} · ${catName}`;
    return catName;
  }, [brands, selectedBrand, categoryMeta, categorySlug]);

  const heroImage = mediaUrl(categoryMeta?.image);
  const busy = loading || isPending;

  return (
    <div className="shop-glass-bg min-h-screen">
      <Head>
        <title>{title} | Khareedo</title>
      </Head>

      <section className="relative h-[36vh] min-h-[220px] sm:min-h-[280px] overflow-hidden bg-[#141210]">
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-10 lg:px-16 pb-8 sm:pb-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#c4a574]">Collection</p>
          <h1 className="font-display text-3xl sm:text-6xl text-white mt-2">{title}</h1>
        </div>
      </section>

      <div className="px-4 sm:px-8 lg:px-16 py-8 sm:py-10">
        <div className="glass-panel p-4 sm:p-5 mb-8 flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <label className="block flex-1">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8a7350]">Brand</span>
            <select
              value={selectedBrand}
              onChange={(e) => applyBrand(e.target.value)}
              className="glass-select mt-1.5 w-full"
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b._id} value={b.slug}>{b.name}</option>
              ))}
            </select>
          </label>
          <Link href="/shop" className="text-sm text-[#9a7a4f] hover:underline pb-3 shrink-0">
            Browse all →
          </Link>
        </div>

        <div className={`transition-opacity duration-300 ${busy ? 'opacity-55' : 'opacity-100'}`}>
          {!loading && products.length === 0 ? (
            <div className="glass-panel py-20 text-center text-[#6b6560]">No products for this filter.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {(loading && products.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass-card animate-pulse h-[380px]" />
                  ))
                : products.map((p) => <ProductCard key={p._id} product={p} />))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

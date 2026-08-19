import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import productsAPI from '../APIs/eproducts';
import categoriesAPI from '../APIs/categories';
import brandsAPI from '../APIs/brands';
import ProductCard from '../components/ProductCard';
import { PRODUCT_TYPE_LIST } from '../config/productTypes';
import { productTypeForCategory } from '../config/categoryProductType';

export default function ShopPage() {
  const router = useRouter();
  const { category: categoryQuery, brand: brandQuery, type: typeQuery } = router.query;
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [productType, setProductType] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    setCategory(typeof categoryQuery === 'string' ? categoryQuery : '');
    setBrand(typeof brandQuery === 'string' ? brandQuery : '');
    setProductType(typeof typeQuery === 'string' ? typeQuery : '');
  }, [router.isReady, categoryQuery, brandQuery, typeQuery]);

  useEffect(() => {
    categoriesAPI.getAllCategories().then((c) => {
      setCategories(c?.data?.categories || []);
    });
  }, []);

  // Brands depend on selected type / category — Rolex won't show under Suits
  useEffect(() => {
    const typeFilter = productType || productTypeForCategory(category) || undefined;
    brandsAPI.getAll({ productType: typeFilter }).then((b) => {
      const list = (b?.data?.brands || []).filter((x) => x.isActive !== false);
      setBrands(list);
      if (brand && list.length && !list.some((x) => x.slug === brand || x._id === brand)) {
        setBrand('');
        const query = {};
        if (category) query.category = category;
        if (productType) query.type = productType;
        router.replace({ pathname: '/shop', query }, undefined, { shallow: true, scroll: false });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, productType]);

  useEffect(() => {
    if (!router.isReady) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const effectiveType = productType || productTypeForCategory(category) || undefined;
        const res = await productsAPI.getFilteredProducts({
          category: category || undefined,
          brand: brand || undefined,
          productType: effectiveType,
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
  }, [router.isReady, category, brand, productType]);

  const syncUrl = (nextCategory, nextBrand, nextType) => {
    const query = {};
    if (nextCategory) query.category = nextCategory;
    if (nextBrand) query.brand = nextBrand;
    if (nextType) query.type = nextType;
    router.replace({ pathname: '/shop', query }, undefined, { shallow: true, scroll: false });
  };

  const onCategoryChange = (value) => {
    setCategory(value);
    const mapped = productTypeForCategory(value);
    if (mapped) setProductType(mapped);
    syncUrl(value, '', mapped || productType);
    setBrand('');
  };

  const onBrandChange = (value) => {
    setBrand(value);
    syncUrl(category, value, productType);
  };

  const onTypeChange = (value) => {
    setProductType(value);
    syncUrl(category, brand, value);
  };

  const clearFilters = () => {
    setCategory('');
    setBrand('');
    setProductType('');
    syncUrl('', '', '');
  };

  const title = useMemo(() => {
    const cat = categories.find((c) => c.slug === category || c._id === category);
    const br = brands.find((b) => b.slug === brand || b._id === brand);
    if (cat && br) return `${br.name} · ${cat.name}`;
    if (cat) return cat.name;
    if (br) return br.name;
    return 'All pieces';
  }, [categories, brands, category, brand]);

  const busy = loading || isPending;

  return (
    <div className="shop-glass-bg min-h-screen">
      <div className="px-4 sm:px-8 lg:px-16 pt-10 sm:pt-14 pb-6">
        <div className="glass-panel px-5 sm:px-8 py-6 sm:py-8">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#8a7350]">Boutique</p>
          <h1 className="font-display text-3xl sm:text-5xl mt-2 text-[#141210]">{title}</h1>
          <p className="text-[#6b6560] mt-2 text-sm max-w-xl font-light">
            Filter by category, brand, or product type — suits, toys, vehicles, watches and more.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#8a7350]">Category</span>
              <select
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="glass-select mt-1.5 w-full"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#8a7350]">Brand</span>
              <select
                value={brand}
                onChange={(e) => onBrandChange(e.target.value)}
                className="glass-select mt-1.5 w-full"
              >
                <option value="">All brands</option>
                {brands.map((b) => (
                  <option key={b._id} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#8a7350]">Product type</span>
              <select
                value={productType}
                onChange={(e) => onTypeChange(e.target.value)}
                className="glass-select mt-1.5 w-full"
              >
                <option value="">All types</option>
                {PRODUCT_TYPE_LIST.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                disabled={!category && !brand && !productType}
                className="w-full glass-pill px-5 py-3 text-sm disabled:opacity-40 hover:bg-white/80 transition"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-16 pb-16">
        <div className={`transition-opacity duration-300 ${busy ? 'opacity-55' : 'opacity-100'}`}>
          {!loading && products.length === 0 ? (
            <div className="glass-panel py-20 text-center text-[#6b6560]">
              No products for these filters.
              <div className="mt-4">
                <button type="button" onClick={clearFilters} className="text-[#9a7a4f] underline">
                  Clear filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
              {(loading && products.length === 0
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="glass-card animate-pulse aspect-[3/4] sm:h-[380px] sm:aspect-auto" />
                  ))
                : products.map((p) => <ProductCard key={p._id} product={p} />))}
            </div>
          )}
        </div>

        {!loading && products.length > 0 ? (
          <p className="text-center text-xs text-[#6b6560] mt-8 tracking-wide">
            Showing {products.length} piece{products.length === 1 ? '' : 's'}
            {' · '}
            <Link href="/" className="text-[#9a7a4f] hover:underline">Home</Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}

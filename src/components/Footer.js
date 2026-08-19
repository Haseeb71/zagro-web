import Link from 'next/link';
import { useState, useEffect } from 'react';
import categoriesAPI from '../APIs/categories';
import brandsAPI from '../APIs/brands';

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    categoriesAPI.getAllCategories().then((res) => {
      setCategories((res?.data?.categories || []).slice(0, 6));
    });
    brandsAPI.getAll().then((res) => {
      setBrands((res?.data?.brands || []).slice(0, 6));
    });
  }, []);

  return (
    <footer className="bg-[#141210] text-white pt-10 sm:pt-14 pb-8 sm:pb-10">
      <div className="px-4 sm:px-10 lg:px-16">
        <div className="flex flex-col sm:grid sm:grid-cols-4 gap-6 sm:gap-10">
          <div className="sm:col-span-1">
            <p className="font-display text-2xl sm:text-3xl text-[#c4a574]">Khareedo</p>
            <p className="mt-2 sm:mt-4 text-xs sm:text-sm text-white/55 font-light leading-relaxed max-w-xs">
              Curated watches for every wrist.
            </p>
          </div>

          {/* Mobile: compact chip links */}
          <div className="sm:hidden space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#c4a574] mb-2.5">Shop</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/shop" className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80">
                  All
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c._id}
                    href={`/categories/${c.slug}`}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80"
                  >
                    {c.name}
                  </Link>
                ))}
                {brands.slice(0, 4).map((b) => (
                  <Link
                    key={b._id}
                    href={`/shop?brand=${b.slug}`}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex gap-4 text-xs text-white/60">
              <Link href="/order-status" className="hover:text-[#c4a574]">Order status</Link>
              <Link href="/checkout" className="hover:text-[#c4a574]">Checkout</Link>
            </div>
          </div>

          {/* Desktop columns */}
          <div className="hidden sm:block">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#c4a574] mb-4">Collections</p>
            <ul className="space-y-2 text-sm text-white/70">
              {categories.length > 0 ? (
                categories.map((c) => (
                  <li key={c._id}>
                    <Link href={`/categories/${c.slug}`} className="hover:text-[#c4a574] transition">{c.name}</Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/categories/men" className="hover:text-[#c4a574]">Men</Link></li>
                  <li><Link href="/categories/women" className="hover:text-[#c4a574]">Women</Link></li>
                </>
              )}
              <li><Link href="/shop" className="hover:text-[#c4a574]">All pieces</Link></li>
            </ul>
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#c4a574] mb-4">Brands</p>
            <ul className="space-y-2 text-sm text-white/70">
              {brands.length > 0 ? (
                brands.map((b) => (
                  <li key={b._id}>
                    <Link href={`/shop?brand=${b.slug}`} className="hover:text-[#c4a574] transition">{b.name}</Link>
                  </li>
                ))
              ) : (
                <li className="text-white/40">Add brands in admin</li>
              )}
            </ul>
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#c4a574] mb-4">Help</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/order-status" className="hover:text-[#c4a574]">Order status</Link></li>
              <li><Link href="/checkout" className="hover:text-[#c4a574]">Checkout</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-5 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 text-[11px] sm:text-xs text-white/35">
          <p>© {new Date().getFullYear()} Khareedo</p>
          <p className="hidden sm:block">Crafted for collectors &amp; everyday wrists</p>
        </div>
      </div>
    </footer>
  );
}

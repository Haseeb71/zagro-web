import Link from 'next/link';
import { useState, useEffect } from 'react';
import RatingStars from './RatingStars';
import CartSlider from './CartSlider';
import productsAPI from '../APIs/eproducts';
import categoriesAPI from '../APIs/categories';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { toggleCart } from '@/redux/slices/cartSlice';
import { mediaUrl } from '../utils/mediaUrl';

export default function Navigation() {
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [categories, setCategories] = useState([]);
  const { isOpen: isCartOpen, totalItems } = useAppSelector((state) => state.cart);

  useEffect(() => {
    categoriesAPI.getAllCategories().then((response) => {
      setCategories(response?.data?.categories || []);
    }).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else if (!isCartOpen) {
      document.body.style.overflow = '';
    }
    return () => {
      if (!isCartOpen) document.body.style.overflow = '';
    };
  }, [isMenuOpen, isCartOpen]);

  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    try {
      setIsSearching(true);
      setSearchError(null);
      const response = await productsAPI.getSearchedProducts(query);
      if (response?.data?.products) {
        setSearchResults(response.data.products);
      } else {
        setSearchResults([]);
        setSearchError(response?.error?.response?.data?.message || 'No products found');
      }
    } catch (_) {
      setSearchError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) searchProducts(searchQuery);
      else {
        setSearchResults([]);
        setSearchError(null);
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-black/5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            <Link href="/" className="flex items-center shrink-0" onClick={closeMenu}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="Khareedo"
                className="h-11 sm:h-14 md:h-[4.25rem] w-auto"
              />
            </Link>

            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link href="/" className="text-gray-700 hover:text-[#9a7a4f] font-medium transition-colors">
                Home
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/categories/${cat.slug}`}
                  className="text-gray-700 hover:text-[#9a7a4f] font-medium transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/shop" className="text-gray-700 hover:text-[#9a7a4f] font-medium transition-colors">
                Shop
              </Link>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-2">
              <button
                type="button"
                className="p-2 text-gray-700 hover:text-[#9a7a4f] rounded-full"
                onClick={() => {
                  closeMenu();
                  setIsSearchOpen(!isSearchOpen);
                }}
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  dispatch(toggleCart());
                }}
                className="p-2 text-gray-700 hover:text-[#9a7a4f] rounded-full relative"
                aria-label="Cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] inline-flex items-center justify-center px-1 text-[10px] font-bold text-white bg-[#141210] rounded-full">
                    {totalItems}
                  </span>
                ) : null}
              </button>
              <Link
                href="/admin/login"
                className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7a4f] border border-[#c4a574]/40 rounded-full hover:bg-[#141210] hover:text-white transition"
              >
                Admin
              </Link>
              <button
                type="button"
                className="md:hidden p-2 text-gray-700"
                onClick={() => setIsMenuOpen((o) => !o)}
                aria-label="Menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="text"
                  placeholder="Search watches, brands…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c4a574] text-sm"
                  autoFocus
                />
                <button type="button" onClick={closeSearch} className="px-3 py-2.5 text-sm text-gray-500 shrink-0">
                  Cancel
                </button>
              </div>
              {searchQuery.length > 0 && (
                <div className="mt-3">
                  {isSearching && <p className="text-center text-gray-500 py-6 text-sm">Searching…</p>}
                  {!isSearching && searchError && <p className="text-center text-red-600 py-6 text-sm">{searchError}</p>}
                  {!isSearching && !searchError && searchResults.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 max-h-[55vh] overflow-y-auto">
                      {searchResults.map((product) => (
                        <Link
                          key={product._id}
                          href={`/products/${product._id}`}
                          onClick={closeSearch}
                          className="flex gap-3 p-2.5 border rounded-xl hover:border-[#c4a574] transition"
                        >
                          <div className="h-14 w-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {product.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={typeof product.images[0] === 'string' ? mediaUrl(product.images[0]) : mediaUrl(product.images[0].url)}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-sm text-[#9a7a4f] mt-0.5">
                              Rs {Number(product.price || 0).toLocaleString()}
                              {product.originalPrice > product.price ? (
                                <span className="ml-2 text-gray-400 line-through text-xs">
                                  Rs {Number(product.originalPrice).toLocaleString()}
                                </span>
                              ) : null}
                            </p>
                            <div className="mt-0.5"><RatingStars rating={product.rating || 4.5} size="sm" showRating={false} /></div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {!isSearching && !searchError && searchResults.length === 0 && (
                    <p className="text-center text-gray-500 py-6 text-sm">No products found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile slide-over menu */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isMenuOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label="Close menu"
          onClick={closeMenu}
        />
        <aside
          className={`absolute top-0 right-0 h-full w-[min(86vw,320px)] bg-[#141210] text-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4a574]">Menu</p>
              <p className="font-display text-2xl text-white mt-0.5">Khareedo</p>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              className="h-10 w-10 rounded-full border border-white/15 flex items-center justify-center"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <Link href="/" onClick={closeMenu} className="block rounded-xl px-4 py-3.5 text-[15px] hover:bg-white/5">
              Home
            </Link>
            <Link href="/shop" onClick={closeMenu} className="block rounded-xl px-4 py-3.5 text-[15px] hover:bg-white/5">
              Shop all
            </Link>
            <p className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-[0.25em] text-[#c4a574]/80">Collections</p>
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3.5 text-[15px] hover:bg-white/5"
              >
                {cat.name}
              </Link>
            ))}
            <p className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-[0.25em] text-[#c4a574]/80">Help</p>
            <Link href="/order-status" onClick={closeMenu} className="block rounded-xl px-4 py-3.5 text-[15px] hover:bg-white/5">
              Order status
            </Link>
            <Link href="/admin/login" onClick={closeMenu} className="block rounded-xl px-4 py-3.5 text-[15px] text-[#c4a574] hover:bg-white/5">
              Admin
            </Link>
          </nav>

          <div className="p-4 border-t border-white/10">
            <Link
              href="/shop"
              onClick={closeMenu}
              className="flex items-center justify-center w-full rounded-full bg-[#c4a574] text-[#141210] py-3 text-sm font-semibold"
            >
              Browse collection
            </Link>
          </div>
        </aside>
      </div>

      <CartSlider isOpen={isCartOpen} onClose={() => dispatch(toggleCart())} />
    </>
  );
}

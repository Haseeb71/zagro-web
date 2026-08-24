import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '◆' },
  { href: '/admin/banners', label: 'Banners', icon: '▭' },
  { href: '/admin/product-types', label: 'Product types', icon: '⬡' },
  { href: '/admin/products', label: 'Products', icon: '▣' },
  { href: '/admin/brands', label: 'Brands', icon: '◎' },
  { href: '/admin/categories', label: 'Categories', icon: '▤' },
  { href: '/admin/promotions', label: 'Promotions', icon: '◇' },
  { href: '/admin/coupons', label: 'Coupons', icon: '%' },
  { href: '/admin/orders', label: 'Orders', icon: '☰' },
  { href: '/admin/customers', label: 'Customers', icon: '☺' },
];

export default function AdminLayout({ children, title, subtitle }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
      if (user?.name) setUserName(user.name);
    } catch (_) {}
    setReady(true);
  }, [router]);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('userId');
    router.push('/admin/login');
  };

  if (!ready) {
    return (
      <div className="admin-shell min-h-screen flex items-center justify-center">
        <p className="admin-muted tracking-widest text-sm uppercase">Loading console…</p>
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-screen flex">
      <Toaster position="top-right" />
      <aside className="admin-sidebar w-64 shrink-0 flex flex-col">
        <div className="px-6 py-7 border-b border-white/10">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#c4a574]">Commerce</p>
          <h1 className="admin-display text-2xl text-white mt-2">Khareedo</h1>
          <p className="text-xs text-white/50 mt-1">Catalog console</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const path = (router.asPath || router.pathname || '').split('?')[0];
            let active =
              item.href === '/admin'
                ? path === '/admin'
                : path === item.href || path.startsWith(`${item.href}/`);
            // Order detail lives at /admin/order/:id — keep Orders nav highlighted
            if (item.href === '/admin/orders' && path.startsWith('/admin/order/')) {
              active = true;
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? 'bg-[#c4a574] text-[#141210] font-semibold'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="opacity-70 w-4 text-center text-xs">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-5 border-t border-white/10 space-y-3">
          <p className="text-sm text-white/80 truncate">{userName}</p>
          <Link href="/" className="block text-xs text-[#c4a574] hover:underline">
            Open storefront →
          </Link>
          <button type="button" onClick={logout} className="text-xs text-red-300/90 hover:text-red-200">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="admin-topbar px-8 py-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a7350] mb-1">Admin</p>
            <h2 className="admin-display text-3xl text-[#141210]">{title}</h2>
            {subtitle ? <p className="admin-muted mt-1 text-sm">{subtitle}</p> : null}
          </div>
        </header>
        <div className="px-8 pb-10">{children}</div>
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/admin/AdminLayout';
import adminAPI from '../../APIs/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, brands: 0, orders: 0 });

  useEffect(() => {
    const load = async () => {
      const [productsRes, categoriesRes, brandsRes, ordersRes] = await Promise.all([
        adminAPI.getProducts(1, 1),
        adminAPI.getCategories(),
        adminAPI.getBrands(),
        adminAPI.getOrders(),
      ]);
      setStats({
        products: productsRes?.data?.pagination?.total ?? productsRes?.data?.products?.length ?? 0,
        categories: categoriesRes?.data?.categories?.length ?? 0,
        brands: brandsRes?.data?.brands?.length ?? 0,
        orders: ordersRes?.data?.checkouts?.length ?? ordersRes?.data?.orders?.length ?? 0,
      });
    };
    load();
  }, []);

  const cards = [
    { label: 'Products', value: stats.products, href: '/admin/products', hint: 'SKU catalog' },
    { label: 'Brands', value: stats.brands, href: '/admin/brands', hint: 'Rolex, Omega…' },
    { label: 'Categories', value: stats.categories, href: '/admin/categories', hint: 'Men / Women / Kids' },
    { label: 'Orders', value: stats.orders, href: '/admin/orders', hint: 'Checkout flow' },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Watch commerce console — categories and brands stay generic for future product lines.">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="admin-card p-6 hover:border-[#c4a574]/60 transition group">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a7350]">{card.label}</p>
            <p className="admin-display text-4xl text-[#141210] mt-3 group-hover:text-[#9a7a4f] transition">{card.value}</p>
            <p className="text-xs text-[#6b6560] mt-2">{card.hint}</p>
          </Link>
        ))}
      </div>

      <div className="admin-card p-6">
        <h3 className="admin-display text-2xl text-[#141210] mb-2">Quick start</h3>
        <p className="text-sm text-[#6b6560] mb-5 max-w-2xl">
          Add brands first, keep your categories, then create products with both filters. Storefront shoppers can browse the same way.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/brands" className="admin-btn-primary px-4 py-2 text-sm">Add brand</Link>
          <Link href="/admin/products/new" className="px-4 py-2 text-sm border border-[#141210]/20 rounded-lg hover:border-[#c4a574]">Add product</Link>
          <Link href="/admin/categories" className="px-4 py-2 text-sm border border-[#141210]/20 rounded-lg hover:border-[#c4a574]">Categories</Link>
        </div>
      </div>
    </AdminLayout>
  );
}

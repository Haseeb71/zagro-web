import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import adminAPI from '../../../APIs/admin';

const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:3006';

function productImage(product) {
  const img = product?.images?.[0];
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${imageBase}/${String(img).replace(/\\/g, '/')}`;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMeta = async () => {
    const [cRes, bRes] = await Promise.all([adminAPI.getCategories(), adminAPI.getBrands()]);
    setCategories(cRes?.data?.categories || []);
    setBrands(bRes?.data?.brands || []);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getProducts(1, 50, search, category, brand);
      setProducts(res?.data?.products || []);
    } catch (_) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
    load();
  }, []);

  const onDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await adminAPI.deleteProduct(id);
    toast.success('Product deleted');
    load();
  };

  return (
    <AdminLayout title="Products" subtitle="Filter by category and brand.">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="grid sm:grid-cols-4 gap-3 flex-1"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="admin-input"
          />
          <select className="admin-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <select className="admin-input" value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
          <button type="submit" className="admin-btn-primary px-4 py-2 text-sm">
            Apply filters
          </button>
        </form>
        <Link href="/admin/products/new" className="admin-btn-primary px-5 py-2.5 text-sm text-center whitespace-nowrap">
          Add product
        </Link>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f3efe8] text-left text-[#6b6560]">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Brand</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-[#6b6560]">Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-[#6b6560]">No products match these filters.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="border-t border-black/5">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {productImage(p) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={productImage(p)} alt="" className="h-11 w-11 rounded object-cover" />
                      ) : (
                        <div className="h-11 w-11 rounded bg-[#ebe7e0]" />
                      )}
                      <p className="font-medium text-[#141210]">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#6b6560]">{p.brand?.name || '—'}</td>
                  <td className="px-5 py-3 text-[#6b6560]">{p.category?.name || '—'}</td>
                  <td className="px-5 py-3">Rs {p.price}</td>
                  <td className="px-5 py-3">{p.quantity}</td>
                  <td className="px-5 py-3 space-x-3">
                    <Link href={`/admin/products/${p._id}`} className="text-[#9a7a4f] hover:underline">Edit</Link>
                    <button type="button" onClick={() => onDelete(p._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import adminAPI from '../../../APIs/admin';
import { mediaUrl } from '../../../utils/mediaUrl';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    ctaText: 'Shop collection',
    link: '/shop',
    sortOrder: 0,
    isActive: true,
  });
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const res = await adminAPI.getBanners();
    setBanners(res?.data?.banners || []);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm({
      title: '',
      subtitle: '',
      ctaText: 'Shop collection',
      link: '/shop',
      sortOrder: 0,
      isActive: true,
    });
    setImage(null);
    setEditingId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && !image) {
      toast.error('Banner image is required');
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (image) fd.append('image', image);

    if (editingId) {
      await adminAPI.updateBanner(editingId, fd);
      toast.success('Banner updated');
    } else {
      await adminAPI.createBanner(fd);
      toast.success('Banner added — it will show on the homepage');
    }
    reset();
    load();
  };

  const onEdit = (b) => {
    setEditingId(b._id);
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      ctaText: b.ctaText || 'Shop collection',
      link: b.link || '/shop',
      sortOrder: b.sortOrder || 0,
      isActive: b.isActive !== false,
    });
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    await adminAPI.deleteBanner(id);
    toast.success('Deleted');
    load();
  };

  return (
    <AdminLayout
      title="Banners"
      subtitle="Homepage hero slides — upload photos here. Active banners appear on the storefront automatically."
    >
      <form onSubmit={onSubmit} className="admin-card p-6 mb-6 grid sm:grid-cols-2 gap-4 max-w-4xl">
        <div>
          <label className="text-xs uppercase tracking-wider text-[#8a7350]">Title</label>
          <input className="admin-input w-full mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Optional headline" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-[#8a7350]">CTA text</label>
          <input className="admin-input w-full mt-1" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#8a7350]">Subtitle</label>
          <input className="admin-input w-full mt-1" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-[#8a7350]">Link</label>
          <input className="admin-input w-full mt-1" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/shop or /categories/men" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-[#8a7350]">Sort order</label>
          <input type="number" className="admin-input w-full mt-1" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-[#8a7350]">Image {editingId ? '(optional replace)' : ''}</label>
          <input type="file" accept="image/*" className="mt-2 text-sm" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active on homepage
          </label>
        </div>
        <div className="sm:col-span-2 flex gap-3">
          <button type="submit" className="admin-btn-primary px-5 py-2.5 text-sm">
            {editingId ? 'Update banner' : 'Add banner'}
          </button>
          {editingId ? (
            <button type="button" onClick={reset} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
          ) : null}
        </div>
      </form>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {banners.map((b) => (
          <div key={b._id} className="admin-card overflow-hidden">
            <div className="relative h-40 bg-[#ebe7e0]">
              {mediaUrl(b.image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(b.image)} alt={b.title || 'Banner'} className="h-full w-full object-cover" />
              ) : null}
              {!b.isActive && (
                <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-black/70 text-white px-2 py-1">Inactive</span>
              )}
            </div>
            <div className="p-4">
              <p className="font-medium text-[#141210]">{b.title || 'Untitled banner'}</p>
              <p className="text-xs text-[#6b6560] mt-1 line-clamp-2">{b.subtitle}</p>
              <p className="text-xs text-[#8a7350] mt-2">Order {b.sortOrder} · {b.link}</p>
              <div className="mt-3 flex gap-3 text-sm">
                <button type="button" onClick={() => onEdit(b)} className="text-[#9a7a4f] hover:underline">Edit</button>
                <button type="button" onClick={() => onDelete(b._id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="admin-card p-8 text-center text-[#6b6560] sm:col-span-2 xl:col-span-3">
            No banners yet. Upload a hero photo to drive the homepage.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

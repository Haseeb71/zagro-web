import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import adminAPI from '../../../APIs/admin';

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [mainText, setMainText] = useState('');
  const [subText, setSubText] = useState('');
  const [image, setImage] = useState(null);

  const load = async () => {
    const res = await adminAPI.getPromotions();
    setPromotions(res?.data?.promotions || []);
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('Image is required');
      return;
    }
    const fd = new FormData();
    fd.append('mainText', mainText);
    fd.append('subText', subText);
    fd.append('isActive', 'true');
    fd.append('image', image);
    await adminAPI.createPromotion(fd);
    toast.success('Promotion created');
    setMainText('');
    setSubText('');
    setImage(null);
    load();
  };

  const onDelete = async (id) => {
    if (!confirm('Delete promotion?')) return;
    await adminAPI.deletePromotion(id);
    toast.success('Deleted');
    load();
  };

  return (
    <AdminLayout title="Promotions">
      <Toaster position="top-right" />
      <form onSubmit={onCreate} className="bg-white rounded-xl border p-5 mb-6 space-y-3 max-w-2xl">
        <input required placeholder="Main text" className="w-full border rounded-lg px-3 py-2" value={mainText} onChange={(e) => setMainText(e.target.value)} />
        <input placeholder="Sub text" className="w-full border rounded-lg px-3 py-2" value={subText} onChange={(e) => setSubText(e.target.value)} />
        <input required type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        <button type="submit" className="rounded-lg bg-slate-900 text-white px-4 py-2">Add promotion</button>
      </form>
      <div className="bg-white rounded-xl border divide-y">
        {promotions.map((p) => (
          <div key={p._id} className="px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{p.mainText}</p>
              <p className="text-sm text-slate-500">{p.subText}</p>
            </div>
            <button type="button" onClick={() => onDelete(p._id)} className="text-red-600 text-sm">Delete</button>
          </div>
        ))}
        {promotions.length === 0 && <p className="px-4 py-8 text-center text-slate-500">No promotions yet.</p>}
      </div>
    </AdminLayout>
  );
}

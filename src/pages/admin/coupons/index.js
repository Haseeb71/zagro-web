import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import adminAPI from '../../../APIs/admin';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: '',
    heading: '',
    description: '',
    discountPercentage: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  const load = async () => {
    const res = await adminAPI.getCoupons();
    setCoupons(res?.data?.coupons || []);
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    await adminAPI.createCoupon({
      ...form,
      discountPercentage: Number(form.discountPercentage),
    });
    toast.success('Coupon created');
    setForm({
      code: '',
      heading: '',
      description: '',
      discountPercentage: '',
      validFrom: '',
      validUntil: '',
      isActive: true,
    });
    load();
  };

  const onDelete = async (id) => {
    if (!confirm('Delete coupon?')) return;
    await adminAPI.deleteCoupon(id);
    toast.success('Deleted');
    load();
  };

  return (
    <AdminLayout title="Coupons">
      <Toaster position="top-right" />
      <form onSubmit={onCreate} className="bg-white rounded-xl border p-5 mb-6 grid sm:grid-cols-2 gap-3">
        <input required placeholder="Code" className="border rounded-lg px-3 py-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <input required placeholder="Heading" className="border rounded-lg px-3 py-2" value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} />
        <input required placeholder="Description" className="border rounded-lg px-3 py-2 sm:col-span-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input required type="number" placeholder="Discount %" className="border rounded-lg px-3 py-2" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input required type="date" className="border rounded-lg px-3 py-2" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
          <input required type="date" className="border rounded-lg px-3 py-2" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
        </div>
        <button type="submit" className="rounded-lg bg-slate-900 text-white px-4 py-2 sm:col-span-2">Add coupon</button>
      </form>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Heading</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="px-4 py-3 font-medium">{c.code}</td>
                <td className="px-4 py-3">{c.heading}</td>
                <td className="px-4 py-3">{c.discountPercentage}%</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => onDelete(c._id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

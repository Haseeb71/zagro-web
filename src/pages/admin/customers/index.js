import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import adminAPI from '../../../APIs/admin';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminAPI.getCustomers().then((res) => {
      setCustomers(res?.data?.customers || []);
    }).finally(() => setLoading(false));
  }, []);

  const formatAddress = (c) => {
    const a = c?.address || {};
    const parts = [a.street, a.city, a.state, a.zipCode, a.country].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  };

  return (
    <AdminLayout title="Customers" subtitle="People who placed orders from the store.">
      <Toaster position="top-right" />
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/[0.03] text-left text-[#6b6560]">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[#6b6560]">Loading…</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[#6b6560]">No customers yet.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="border-t border-black/5">
                    <td className="px-5 py-3.5 font-medium">{c.fullName || c.name || '—'}</td>
                    <td className="px-5 py-3.5">{c.email || '—'}</td>
                    <td className="px-5 py-3.5">{c.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-[#6b6560] max-w-xs">{formatAddress(c)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

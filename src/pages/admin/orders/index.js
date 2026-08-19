import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import adminAPI from '../../../APIs/admin';

const formatRs = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

function customerName(order) {
  const c = order?.customer;
  if (!c) return '—';
  if (typeof c === 'string') return c;
  return c.fullName || c.name || c.email || '—';
}

function statusOf(order) {
  return order?.orderStatus || order?.status || 'pending';
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminAPI
      .getOrders()
      .then((res) => setOrders(res?.data?.checkouts || res?.data?.orders || []))
      .catch(() => {
        setOrders([]);
        toast.error('Failed to load orders');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Orders" subtitle="Open any order to see products, brand, category & address.">
      <Toaster position="top-right" />

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/[0.03] text-left text-[#6b6560]">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#6b6560]">Loading…</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#6b6560]">No orders yet.</td>
                </tr>
              ) : (
                orders.map((o) => {
                  const href = `/admin/order/${o._id}`;
                  return (
                    <tr key={o._id} className="border-t border-black/5 hover:bg-[#c4a574]/10 transition">
                      <td className="px-5 py-3.5 font-medium text-[#141210]">
                        <Link href={href} className="hover:text-[#9a7a4f] hover:underline">
                          {o.orderNumber || o._id}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={href} className="block hover:opacity-80">
                          <div className="font-medium">{customerName(o)}</div>
                          <div className="text-xs text-[#6b6560]">{o.customer?.email || ''}</div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-[#6b6560]">
                        <Link href={href}>
                          {(o.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0) || '—'}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-medium">
                        <Link href={href}>{formatRs(o.totalAmount ?? o.total ?? 0)}</Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={href}>
                          <span className="inline-flex rounded-full bg-black/5 px-2.5 py-1 text-xs capitalize">
                            {statusOf(o)}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-[#6b6560] whitespace-nowrap">
                        <Link href={href}>
                          {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={href}
                          className="inline-flex admin-btn-primary px-3 py-1.5 text-xs"
                        >
                          View order
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

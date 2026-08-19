import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import adminAPI from '../../../APIs/admin';
import { mediaUrl, productImageUrl } from '../../../utils/mediaUrl';
import { labelOf } from '../../../utils/labelOf';

const formatRs = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

function customerName(order) {
  const c = order?.customer;
  if (!c) return '—';
  if (typeof c === 'string') return c;
  return c.fullName || c.name || c.email || '—';
}

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !id) return undefined;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getOrderById(String(id));
        if (!cancelled) setOrder(res?.data?.checkout || null);
      } catch (_) {
        if (!cancelled) {
          setOrder(null);
          toast.error('Failed to load order');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, id]);

  const address = useMemo(() => {
    const a = order?.shippingAddress || order?.customer?.address || {};
    const parts = [a.street, a.city, a.state, a.zipCode, a.country].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  }, [order]);

  return (
    <AdminLayout
      title={order?.orderNumber || 'Order detail'}
      subtitle="Ordered products, brand, category, address & payment"
    >
      <Toaster position="top-right" />

      <div className="mb-5">
        <Link href="/admin/orders" className="text-sm text-[#9a7a4f] hover:underline">
          ← Back to orders list
        </Link>
      </div>

      {loading ? (
        <div className="admin-card p-10 text-center text-[#6b6560]">Loading order…</div>
      ) : !order ? (
        <div className="admin-card p-10 text-center text-[#6b6560]">
          Order not found.
          <div className="mt-4">
            <Link href="/admin/orders" className="admin-btn-primary inline-flex px-4 py-2 text-sm">
              Back to list
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5 max-w-5xl">
          <section className="admin-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#8a7350]">Order detail</p>
              <h1 className="font-display text-3xl text-[#141210] mt-1">{order.orderNumber}</h1>
              <p className="text-sm text-[#6b6560] mt-2 capitalize">
                Status: <span className="text-[#141210]">{order.orderStatus || 'pending'}</span>
                {' · '}
                Payment:{' '}
                <span className="text-[#141210]">
                  {String(order.paymentMethod || '—').replace(/_/g, ' ')}
                </span>
              </p>
              <p className="text-xs text-[#6b6560] mt-1">
                Placed {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a7350]">Total</p>
              <p className="font-display text-3xl text-[#9a7a4f] mt-1">{formatRs(order.totalAmount)}</p>
            </div>
          </section>

          {/* Products first so it's clearly an order page, not customers */}
          <section className="admin-card p-5 sm:p-6">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[#8a7350] mb-4">Items ordered</h2>
            <div className="space-y-4">
              {(order.items || []).length === 0 ? (
                <p className="text-sm text-[#6b6560]">No items in this order.</p>
              ) : (
                (order.items || []).map((item, idx) => {
                  const product = item.product && typeof item.product === 'object' ? item.product : null;
                  const img = productImageUrl(product) || mediaUrl(product?.images?.[0]);
                  const brand = item.brandName || labelOf(product?.brand) || '—';
                  const category = item.categoryName || labelOf(product?.category) || '—';
                  const name = item.productName || product?.name || 'Product';
                  const lineTotal =
                    item.totalPrice ??
                    Number(item.productPrice || product?.price || 0) * Number(item.quantity || 1);

                  return (
                    <div
                      key={item._id || idx}
                      className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white/70 border border-black/5"
                    >
                      <div className="h-24 w-24 rounded-xl overflow-hidden bg-black/5 shrink-0">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-lg text-[#141210]">{name}</p>
                        <div className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                          <p className="text-[#6b6560]">
                            Brand: <span className="text-[#141210] font-medium">{brand}</span>
                          </p>
                          <p className="text-[#6b6560]">
                            Category: <span className="text-[#141210] font-medium">{category}</span>
                          </p>
                          <p className="text-[#6b6560]">
                            Qty: <span className="text-[#141210] font-medium">{item.quantity}</span>
                          </p>
                          <p className="text-[#6b6560]">
                            Unit price:{' '}
                            <span className="text-[#141210] font-medium">
                              {formatRs(item.productPrice || product?.price || 0)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a7350]">Line total</p>
                        <p className="font-display text-2xl text-[#9a7a4f] mt-1">{formatRs(lineTotal)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-5">
            <section className="admin-card p-5 space-y-2">
              <h2 className="text-xs uppercase tracking-[0.2em] text-[#8a7350]">Customer</h2>
              <p className="font-medium text-lg text-[#141210]">{customerName(order)}</p>
              <p className="text-sm text-[#6b6560]">{order.customer?.email || '—'}</p>
              <p className="text-sm text-[#6b6560]">{order.customer?.phone || '—'}</p>
            </section>

            <section className="admin-card p-5 space-y-2">
              <h2 className="text-xs uppercase tracking-[0.2em] text-[#8a7350]">Shipping address</h2>
              <p className="text-sm text-[#141210] leading-relaxed">{address}</p>
            </section>
          </div>

          <section className="admin-card p-5 sm:p-6 max-w-md ml-auto space-y-2 text-sm">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[#8a7350] mb-2">Payment summary</h2>
            <div className="flex justify-between text-[#6b6560]">
              <span>Subtotal</span>
              <span>{formatRs(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#6b6560]">
              <span>Shipping</span>
              <span>{Number(order.shippingAmount) === 0 ? 'Free' : formatRs(order.shippingAmount)}</span>
            </div>
            <div className="flex justify-between text-[#6b6560]">
              <span>Tax</span>
              <span>{formatRs(order.taxAmount || 0)}</span>
            </div>
            {Number(order.discountAmount) > 0 ? (
              <div className="flex justify-between text-emerald-700">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                <span>-{formatRs(order.discountAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between pt-3 border-t border-black/5 font-medium text-[#141210]">
              <span>Total</span>
              <span className="text-[#9a7a4f] text-xl font-display">{formatRs(order.totalAmount)}</span>
            </div>
          </section>

          {order.notes ? (
            <section className="admin-card p-5">
              <h2 className="text-xs uppercase tracking-[0.2em] text-[#8a7350] mb-2">Notes</h2>
              <p className="text-sm text-[#141210]">{order.notes}</p>
            </section>
          ) : null}
        </div>
      )}
    </AdminLayout>
  );
}

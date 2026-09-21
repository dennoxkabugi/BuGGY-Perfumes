import { useEffect, useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { adminGetOrders, adminUpdateOrderStatus } from '@/services/admin';
import { useToast } from '@/context/ToastContext';
import { formatPrice, formatDate } from '@/utils/format';
import type { Order } from '@/types';
import { PageLoader } from '@/components/Loaders';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
};

export function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  useEffect(() => {
    adminGetOrders()
      .then(setOrders)
      .catch(() => toast('Failed to load orders', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleStatusChange = async (id: string, status: string, paymentStatus?: string) => {
    try {
      await adminUpdateOrderStatus(id, status, paymentStatus);
      toast('Order updated');
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, order_status: status, payment_status: paymentStatus ?? o.payment_status } : o));
      if (viewOrder?.id === id) {
        setViewOrder({ ...viewOrder, order_status: status, payment_status: paymentStatus ?? viewOrder.payment_status });
      }
    } catch {
      toast('Failed to update order', 'error');
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.order_status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Orders ({orders.length})</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, name, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:border-amber-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Order #</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3 hidden sm:table-cell">Customer</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3 hidden md:table-cell">Date</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Total</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-neutral-500 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono font-medium text-neutral-900">{o.order_number}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm text-neutral-900">{o.customer_name}</p>
                    <p className="text-xs text-neutral-500">{o.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-neutral-600">{formatDate(o.created_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-neutral-900">{formatPrice(o.total)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.order_status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1.5 rounded-full border-0 cursor-pointer ${statusColors[o.order_status] ?? 'bg-neutral-100'}`}
                    >
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewOrder(o)} className="text-neutral-400 hover:text-amber-600 transition-colors p-1.5">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewOrder(null)} />
          <div className="relative bg-white rounded-2xl p-6 border border-neutral-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900">Order Details</h3>
              <button onClick={() => setViewOrder(null)}><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Order Number:</span><span className="font-mono font-medium">{viewOrder.order_number}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Date:</span><span>{formatDate(viewOrder.created_at)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Customer:</span><span className="font-medium">{viewOrder.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Email:</span><span>{viewOrder.email}</span></div>
              {viewOrder.phone && <div className="flex justify-between"><span className="text-neutral-500">Phone:</span><span>{viewOrder.phone}</span></div>}
              <div className="flex justify-between"><span className="text-neutral-500">Address:</span><span className="text-right">{viewOrder.building}, {viewOrder.area}, {viewOrder.town}, {viewOrder.county}</span></div>
              <div className="h-px bg-neutral-200 my-2" />
              <div>
                <p className="text-neutral-500 mb-2">Items:</p>
                {viewOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span className="text-neutral-700">{item.product_name} x{item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-neutral-200 my-2" />
              <div className="flex justify-between"><span className="text-neutral-500">Subtotal:</span><span>{formatPrice(viewOrder.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Delivery:</span><span>{formatPrice(viewOrder.delivery_fee)}</span></div>
              {viewOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span><span>-{formatPrice(viewOrder.discount)}</span></div>}
              <div className="flex justify-between font-bold text-base"><span>Total:</span><span>{formatPrice(viewOrder.total)}</span></div>
              <div className="h-px bg-neutral-200 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Payment Status:</span>
                <select
                  value={viewOrder.payment_status}
                  onChange={(e) => handleStatusChange(viewOrder.id, viewOrder.order_status, e.target.value)}
                  className={`text-xs font-medium px-2 py-1.5 rounded-full border-0 cursor-pointer ${statusColors[viewOrder.payment_status] ?? 'bg-neutral-100'}`}
                >
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Order Status:</span>
                <select
                  value={viewOrder.order_status}
                  onChange={(e) => handleStatusChange(viewOrder.id, e.target.value, viewOrder.payment_status)}
                  className={`text-xs font-medium px-2 py-1.5 rounded-full border-0 cursor-pointer ${statusColors[viewOrder.order_status] ?? 'bg-neutral-100'}`}
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

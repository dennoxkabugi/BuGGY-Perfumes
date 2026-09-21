import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getMyOrders } from '@/services/api';
import { formatPrice, formatDate } from '@/utils/format';
import { EmptyState } from '@/components/Loaders';
import type { Order } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function AccountOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getMyOrders(user.id)
        .then(setOrders)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-neutral-100 rounded-2xl" />
      ))}
    </div>;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        message="You have not placed any orders yet. When you do, they will appear here."
        actionLabel="Start Shopping"
        onAction={() => (window.location.href = '/shop')}
      />
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">My Orders</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-mono font-medium text-neutral-900">{order.order_number}</p>
                <p className="text-xs text-neutral-500">{formatDate(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.order_status] ?? 'bg-neutral-100 text-neutral-700'}`}>
                  {order.order_status}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {order.payment_status}
                </span>
              </div>
            </div>

            {order.order_items && order.order_items.length > 0 && (
              <div className="space-y-2 mb-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <Package className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="text-neutral-700 flex-1">{item.product_name}</span>
                    <span className="text-neutral-500">x{item.quantity}</span>
                    <span className="font-medium text-neutral-900">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <p className="text-sm text-neutral-500 capitalize">{order.payment_method} payment</p>
              <p className="text-lg font-bold text-neutral-900">{formatPrice(order.total)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

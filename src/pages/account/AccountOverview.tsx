import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, MapPin, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getMyOrders } from '@/services/api';
import { useWishlist } from '@/hooks/useWishlist';
import { getAddresses } from '@/services/api';
import { formatPrice, formatDate } from '@/utils/format';
import type { Order, Address } from '@/types';

export function AccountOverview() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (user) {
      getMyOrders(user.id).then(setOrders).catch(() => {});
      getAddresses(user.id).then(setAddresses).catch(() => {});
    }
  }, [user]);

  const totalSpent = orders.reduce((s, o) => s + Number(o.total), 0);
  const recentOrders = orders.slice(0, 3);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, link: '/account/orders' },
    { label: 'Wishlist Items', value: wishlist.length, icon: Heart, link: '/account/wishlist' },
    { label: 'Saved Addresses', value: addresses.length, icon: MapPin, link: '/account/addresses' },
    { label: 'Total Spent', value: formatPrice(totalSpent), icon: Package, link: '/account/orders' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-md transition-shadow"
          >
            <stat.icon className="w-6 h-6 text-amber-600 mb-3" />
            <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
            <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">Recent Orders</h3>
          <Link to="/account/orders" className="text-sm text-amber-700 hover:text-amber-600">
            View All
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-neutral-500 py-8 text-center">No orders yet. Start shopping to see your orders here.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-neutral-900 font-mono">{order.order_number}</p>
                  <p className="text-xs text-neutral-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-900">{formatPrice(order.total)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.order_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

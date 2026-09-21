import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { adminGetDashboardStats } from '@/services/admin';
import { formatPrice } from '@/utils/format';
import { PageLoader } from '@/components/Loaders';
import type { Product } from '@/types';

export function AdminDashboard() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminGetDashboardStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <PageLoader />;

  const cards = [
    { label: 'Total Sales', value: formatPrice(stats.totalSales), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: "Today's Sales", value: formatPrice(stats.todaySales), icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600 bg-purple-50' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Delivered Orders', value: stats.deliveredOrders, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-neutral-600 bg-neutral-100' },
    { label: 'Low Stock Items', value: stats.lowStockProducts.length, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
            <p className="text-xs text-neutral-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {stats.lowStockProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Low Stock Products
          </h2>
          <div className="space-y-2">
            {stats.lowStockProducts.slice(0, 5).map((p: Product) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                    <img src={p.image_url ?? ''} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm font-medium text-neutral-900">{p.name}</p>
                </div>
                <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${p.stock_quantity <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {p.stock_quantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Ticket, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Categories', path: '/admin/categories', icon: Tag },
  { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
];

export function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <aside className="w-64 bg-neutral-950 text-neutral-300 fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col">
        <div className="px-6 py-6 border-b border-neutral-800">
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-xl font-bold text-white">BuGGY</span>
            <span className="text-[10px] tracking-[0.3em] text-amber-500 font-medium">PERFUMES ADMIN</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-900 hover:text-white transition-colors"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-neutral-800">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Store
          </Link>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        <header className="lg:hidden bg-neutral-950 text-white px-4 py-4 sticky top-0 z-30 flex items-center justify-between">
          <Link to="/admin" className="flex flex-col leading-none">
            <span className="text-lg font-bold">BuGGY Admin</span>
          </Link>
          <Link to="/" className="text-sm text-amber-500">Store</Link>
        </header>
        <div className="lg:hidden bg-neutral-950 overflow-x-auto px-4 pb-3 flex gap-2">
          {adminNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-900 whitespace-nowrap"
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          ))}
        </div>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

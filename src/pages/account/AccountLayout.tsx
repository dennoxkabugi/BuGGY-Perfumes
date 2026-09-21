import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, User, MapPin, Lock, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const accountNav = [
  { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/account/orders', label: 'My Orders', icon: ShoppingBag },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/password', label: 'Password & Security', icon: Lock },
];

export function AccountLayout() {
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast('Signed out successfully');
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Account</h1>
        <p className="text-sm text-neutral-500">
          Welcome back, {user?.user_metadata?.full_name ?? user?.email}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl p-4 border border-neutral-200 lg:sticky lg:top-24">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
              {accountNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard size={18} />
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap w-full text-left"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

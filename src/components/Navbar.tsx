import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Search, User, ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'Perfumes', path: '/shop?category=perfumes' },
  { label: 'Body Care', path: '/shop?category=body-care' },
  { label: 'Bath & Shower', path: '/shop?category=bath-shower' },
  { label: 'Candles', path: '/shop?category=candles' },
  { label: 'Best Sellers', path: '/shop?sort=popular' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-neutral-950/95 backdrop-blur-md shadow-lg'
            : 'bg-neutral-950'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden text-white"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/" className="flex flex-col leading-none">
                <span className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  BuGGY
                </span>
                <span className="text-[10px] lg:text-xs tracking-[0.3em] text-amber-500 font-medium">
                  PERFUMES
                </span>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname + location.search === link.path
                      ? 'text-amber-500'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4 lg:gap-5">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="text-neutral-300 hover:text-white transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <Link
                to="/account/wishlist"
                className="text-neutral-300 hover:text-white transition-colors hidden sm:block"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>
              <Link
                to={user ? '/account' : '/login'}
                className="text-neutral-300 hover:text-white transition-colors"
                aria-label="Account"
              >
                <User size={20} />
              </Link>
              <Link
                to="/cart"
                className="relative text-neutral-300 hover:text-white transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-neutral-900 border-t border-neutral-800"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <form onSubmit={handleSearch} className="flex gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for perfumes, body care, candles..."
                    autoFocus
                    className="flex-1 bg-neutral-800 text-white px-4 py-3 rounded-xl border border-neutral-700 focus:border-amber-500 focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 text-neutral-900 px-6 py-3 rounded-xl font-medium text-sm hover:bg-amber-400 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-72 bg-neutral-950 z-[60] lg:hidden pt-20 pb-6 overflow-y-auto"
          >
            <nav className="flex flex-col gap-1 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-neutral-300 hover:text-amber-500 hover:bg-neutral-900 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-neutral-800 my-2" />
              <Link
                to="/account/wishlist"
                className="text-neutral-300 hover:text-amber-500 hover:bg-neutral-900 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Wishlist
              </Link>
              <Link
                to={user ? '/account' : '/login'}
                className="text-neutral-300 hover:text-amber-500 hover:bg-neutral-900 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              >
                {user ? 'My Account' : 'Sign In'}
              </Link>
              {user && (
                <Link
                  to="/admin"
                  className="text-neutral-300 hover:text-amber-500 hover:bg-neutral-900 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle, Send } from 'lucide-react';
import { subscribeNewsletter } from '@/services/api';
import { useToast } from '@/context/ToastContext';

export function Footer() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await subscribeNewsletter(email.trim());
      toast('Subscribed successfully!');
      setEmail('');
    } catch {
      toast('Failed to subscribe. Please try again.', 'error');
    }
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="flex flex-col leading-none mb-4">
              <span className="text-2xl font-bold text-white tracking-tight">BuGGY</span>
              <span className="text-xs tracking-[0.3em] text-amber-500 font-medium">PERFUMES</span>
            </Link>
            <p className="text-sm text-neutral-400 max-w-sm mb-6">
              Your destination for premium fragrances and body care. Discover your signature
              scent from our carefully curated collection.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-neutral-900 transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-neutral-900 transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-neutral-900 transition-colors" aria-label="TikTok">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-neutral-900 transition-colors" aria-label="WhatsApp">
                <Send size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-sm hover:text-amber-500 transition-colors">Home</Link></li>
              <li><Link to="/shop" className="text-sm hover:text-amber-500 transition-colors">Shop</Link></li>
              <li><Link to="/about" className="text-sm hover:text-amber-500 transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-amber-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Customer Care</h3>
            <ul className="space-y-2.5">
              <li><Link to="/contact" className="text-sm hover:text-amber-500 transition-colors">Shipping</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-amber-500 transition-colors">Returns</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-amber-500 transition-colors">FAQs</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-amber-500 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Categories</h3>
            <ul className="space-y-2.5">
              <li><Link to="/shop?category=perfumes" className="text-sm hover:text-amber-500 transition-colors">Perfumes</Link></li>
              <li><Link to="/shop?category=body-care" className="text-sm hover:text-amber-500 transition-colors">Body Care</Link></li>
              <li><Link to="/shop?category=bath-shower" className="text-sm hover:text-amber-500 transition-colors">Bath & Shower</Link></li>
              <li><Link to="/shop?category=candles" className="text-sm hover:text-amber-500 transition-colors">Candles</Link></li>
              <li><Link to="/shop?category=gift-sets" className="text-sm hover:text-amber-500 transition-colors">Gift Sets</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">Join Our Newsletter</h3>
              <p className="text-sm text-neutral-500">Get updates on new arrivals and exclusive offers.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-64 bg-neutral-900 text-white px-4 py-2.5 rounded-xl border border-neutral-800 focus:border-amber-500 focus:outline-none text-sm"
                required
              />
              <button
                type="submit"
                className="bg-amber-500 text-neutral-900 px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-amber-400 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-800 text-center">
          <p className="text-sm text-neutral-500">
            &copy; 2026 BuGGY PERFUMES. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

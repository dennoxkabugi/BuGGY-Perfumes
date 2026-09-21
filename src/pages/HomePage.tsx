import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Headphones, Sparkles, ArrowRight } from 'lucide-react';
import type { Product, Category } from '@/types';
import { getProducts, getCategories, subscribeNewsletter } from '@/services/api';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/Loaders';
import { useToast } from '@/context/ToastContext';

const heroImage = 'https://images.pexels.com/photos/30618765/pexels-photo-30618765.jpeg?auto=compress&cs=tinysrgb&w=1920';
const promoImage = 'https://images.pexels.com/photos/16239693/pexels-photo-16239693.jpeg?auto=compress&cs=tinysrgb&w=1920';

const categoryIcons: Record<string, string> = {
  perfumes: 'Perfumes',
  'body-care': 'Body Care',
  'bath-shower': 'Bath & Shower',
  'fragrance-mists': 'Body Mists',
  candles: 'Candles',
  'gift-sets': 'Gift Sets',
};

export function HomePage() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      getProducts({ bestseller: true, limit: 8 }),
      getProducts({ isNew: true, limit: 4 }),
      getCategories(),
    ])
      .then(([bs, na, cats]) => {
        setBestSellers(bs);
        setNewArrivals(na.length > 0 ? na : bs.slice(0, 4));
        setCategories(cats);
      })
      .catch(() => toast('Failed to load products. Please refresh.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      await subscribeNewsletter(newsletterEmail.trim());
      toast('Welcome to our newsletter!');
      setNewsletterEmail('');
    } catch {
      toast('Failed to subscribe. Try again.', 'error');
    }
  };

  const features = [
    { icon: Sparkles, title: 'Authentic Quality', desc: 'Carefully selected, genuine fragrances' },
    { icon: Truck, title: 'Fast Delivery', desc: 'Quick and reliable shipping' },
    { icon: ShieldCheck, title: 'Secure Payments', desc: 'M-Pesa, card, and more' },
    { icon: Headphones, title: 'Customer Support', desc: 'We are here to help you' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Luxury perfume" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/60 to-neutral-950/20" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <p className="text-amber-500 text-sm font-medium tracking-[0.3em] uppercase mb-4">
              Premium Fragrance Collection
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Discover Your<br />Signature Scent
            </h1>
            <p className="text-lg text-neutral-300 mb-8 max-w-lg">
              Premium fragrances and body care made for every mood, moment and memory.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 text-neutral-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-400 transition-colors"
              >
                Shop Collection
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/shop?sort=popular"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white px-8 py-3.5 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-colors"
              >
                Explore Best Sellers
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-amber-600 text-sm font-medium tracking-widest uppercase mb-2">Browse By</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900">Featured Categories</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square overflow-hidden bg-neutral-100">
                  <img
                    src={cat.image_url ?? ''}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 text-center">
                  <p className="text-sm font-medium text-neutral-900 group-hover:text-amber-700 transition-colors">
                    {categoryIcons[cat.slug] ?? cat.name}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-amber-600 text-sm font-medium tracking-widest uppercase mb-2">Trending Now</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900">Best Sellers</h2>
            </div>
            <Link
              to="/shop?sort=popular"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-neutral-900 hover:text-amber-700 transition-colors"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="sm:hidden text-center mt-8">
            <Link
              to="/shop?sort=popular"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 hover:text-amber-700 transition-colors"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={promoImage} alt="Luxury fragrance" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 to-neutral-950/50" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <p className="text-amber-500 text-sm font-medium tracking-[0.3em] uppercase mb-4">Limited Time</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Luxury Fragrance.<br />Everyday Confidence.
            </h2>
            <p className="text-lg text-neutral-300 mb-8">
              Up to 30% off selected premium fragrances. Discover scents that make a statement.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-amber-500 text-neutral-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-400 transition-colors"
            >
              Shop Now <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-amber-600 text-sm font-medium tracking-widest uppercase mb-2">Just In</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900">New Arrivals</h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-neutral-900 hover:text-amber-700 transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-20 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-amber-500 text-sm font-medium tracking-widest uppercase mb-2">Why Us</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">Why Choose BuGGY PERFUMES?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-neutral-900 rounded-2xl p-6 text-center border border-neutral-800"
              >
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 lg:py-20 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-4">
            Join Our Newsletter
          </h2>
          <p className="text-neutral-600 mb-8">
            Subscribe to get updates on new arrivals, exclusive offers, and fragrance tips.
          </p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 bg-white px-4 py-3 rounded-xl border border-neutral-300 focus:border-amber-500 focus:outline-none text-sm"
            />
            <button
              type="submit"
              className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-amber-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Leaf, Award, ArrowRight } from 'lucide-react';

const aboutImage = 'https://images.pexels.com/photos/9774868/pexels-photo-9774868.jpeg?auto=compress&cs=tinysrgb&w=1920';
const storyImage = 'https://images.pexels.com/photos/8624586/pexels-photo-8624586.jpeg?auto=compress&cs=tinysrgb&w=1920';

export function AboutPage() {
  const values = [
    { icon: Sparkles, title: 'Curated Quality', desc: 'Every product is carefully selected to meet our high standards of quality and authenticity.' },
    { icon: Heart, title: 'Customer First', desc: 'We are passionate about helping you find the perfect scent for every mood and occasion.' },
    { icon: Leaf, title: 'Thoughtful Sourcing', desc: 'We work with trusted suppliers to bring you genuine fragrances and body-care products.' },
    { icon: Award, title: 'Premium Experience', desc: 'From browsing to unboxing, we aim to make every step of your journey exceptional.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutImage} alt="Fragrance" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 to-neutral-950/40" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="text-amber-500 text-sm font-medium tracking-[0.3em] uppercase mb-4">Our Story</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">About BuGGY PERFUMES</h1>
            <p className="text-lg text-neutral-300">
              Explore a curated selection of fragrances and body-care products, chosen for every mood, moment, and memory.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-amber-600 text-sm font-medium tracking-widest uppercase mb-3">Our Journey</p>
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">A Passion for Fragrance</h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed">
              <p>
                BuGGY PERFUMES was born from a simple idea: everyone deserves to find their signature scent.
                We believe that fragrance is more than just a product — it is a personal statement, a memory
                trigger, and a daily confidence booster.
              </p>
              <p>
                Our store focuses on helping customers discover fragrances and body-care products for different
                moods and occasions. Whether you are looking for a bold evening perfume, a refreshing body mist
                for summer, or a cozy candle for your home, we have something for every moment.
              </p>
              <p>
                We explore a curated selection of fragrances and body-care products from various brands and
                sources. Our team carefully evaluates each product for quality, scent profile, and value before
                it reaches our shelves.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors mt-8"
            >
              Explore Our Collection <ArrowRight size={16} />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden"
          >
            <img src={storyImage} alt="BuGGY Perfumes" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-20 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-amber-500 text-sm font-medium tracking-widest uppercase mb-2">What We Stand For</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800"
              >
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <v.icon className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-neutral-400">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">Ready to Find Your Scent?</h2>
        <p className="text-neutral-600 mb-8">
          Browse our full collection of perfumes, body care, bath and shower products, candles, and gift sets.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-amber-500 text-neutral-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-400 transition-colors"
        >
          Shop Now <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}

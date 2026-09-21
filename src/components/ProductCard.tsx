import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, getDiscountPercentage } from '@/utils/format';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/context/ToastContext';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const discount = getDiscountPercentage(product.price, product.compare_at_price);
  const inWishlist = isInWishlist(product.id);
  const outOfStock = product.stock_quantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product, 1);
    toast(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', 'info');
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-50">
        <img
          src={product.image_url ?? ''}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.is_new && (
            <span className="bg-neutral-900 text-white text-xs font-semibold px-2 py-1 rounded-full">
              NEW
            </span>
          )}
          {product.is_bestseller && (
            <span className="bg-amber-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              BESTSELLER
            </span>
          )}
        </div>
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          aria-label="Toggle wishlist"
        >
          <Heart
            className={`w-4.5 h-4.5 transition-colors ${
              inWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-600'
            }`}
            size={18}
          />
        </button>
        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-neutral-900 text-white px-4 py-2 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">{product.brand}</p>
        <Link
          to={`/product/${product.slug}`}
          className="block text-sm font-medium text-neutral-900 hover:text-amber-700 transition-colors line-clamp-2 mb-2"
          onClick={(e) => e.stopPropagation()}
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" size={14} />
          <span className="text-xs text-neutral-600">
            {product.rating_avg > 0 ? product.rating_avg.toFixed(1) : 'New'}
            {product.rating_count > 0 && ` (${product.rating_count})`}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-neutral-900">{formatPrice(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-neutral-400 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="w-full bg-neutral-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}

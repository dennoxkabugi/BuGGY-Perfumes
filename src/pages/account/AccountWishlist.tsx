import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/utils/format';
import { EmptyState } from '@/components/Loaders';

export function AccountWishlist() {
  const { wishlist, removeWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (wishlist.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        message="Save items you love by tapping the heart icon on any product."
        actionLabel="Browse Products"
        onAction={() => (window.location.href = '/shop')}
      />
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">My Wishlist ({wishlist.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {wishlist.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl p-4 border border-neutral-200 flex gap-4">
            <Link to={`/product/${product.slug}`} className="flex-shrink-0">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100">
                <img src={product.image_url ?? ''} alt={product.name} className="w-full h-full object-cover" />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 uppercase tracking-wide">{product.brand}</p>
              <Link to={`/product/${product.slug}`} className="text-sm font-medium text-neutral-900 hover:text-amber-700 line-clamp-2">
                {product.name}
              </Link>
              <p className="text-lg font-bold text-neutral-900 mt-1">{formatPrice(product.price)}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    addToCart(product, 1);
                    toast('Added to cart');
                  }}
                  className="flex items-center gap-1.5 bg-neutral-900 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <ShoppingCart size={14} /> Add to Cart
                </button>
                <button
                  onClick={() => {
                    removeWishlist(product.id);
                    toast('Removed from wishlist', 'info');
                  }}
                  className="text-neutral-400 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

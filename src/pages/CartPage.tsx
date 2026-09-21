import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/utils/format';
import { EmptyState } from '@/components/Loaders';

export function CartPage() {
  const { items, removeFromCart, updateQuantity, saveForLater, savedItems, moveToCart, removeSaved, subtotal, totalItems } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const deliveryFee = subtotal > 100 ? 0 : subtotal > 0 ? 5 : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>
        <EmptyState
          title="Your cart is empty"
          message="Looks like you have not added anything to your cart yet. Explore our collection and find your signature scent."
          actionLabel="Start Shopping"
          onAction={() => navigate('/shop')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-neutral-200 text-center mb-8">
          <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4">Your cart is currently empty.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-600">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl p-4 border border-neutral-200 flex gap-4"
              >
                <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100">
                    <img src={item.product.image_url ?? ''} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">{item.product.brand}</p>
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="text-sm font-medium text-neutral-900 hover:text-amber-700 line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      {item.product.size && <p className="text-xs text-neutral-500 mt-1">{item.product.size}</p>}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0"
                      aria-label="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-neutral-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-900"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-900"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      <p className="text-xs text-neutral-500">{formatPrice(item.product.price)} each</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      saveForLater(item.product.id);
                      toast('Saved for later', 'info');
                    }}
                    className="text-xs text-neutral-500 hover:text-amber-700 transition-colors mt-2 flex items-center gap-1"
                  >
                    <Heart size={12} /> Save for later
                  </button>
                </div>
              </div>
            ))}
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 hover:text-amber-700 transition-colors"
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 sticky top-24">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-neutral-900">
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
                {deliveryFee === 0 && subtotal > 0 && (
                  <p className="text-xs text-green-600">You qualified for free delivery!</p>
                )}
                {deliveryFee > 0 && (
                  <p className="text-xs text-neutral-500">
                    Add {formatPrice(100 - subtotal)} more for free delivery.
                  </p>
                )}
                <div className="h-px bg-neutral-200 my-3" />
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="font-bold text-neutral-900">{formatPrice(total)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-neutral-900 text-white py-3.5 rounded-xl font-medium text-sm hover:bg-amber-700 transition-colors mt-6"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Items */}
      {savedItems.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Saved for Later ({savedItems.length})</h2>
          <div className="space-y-3">
            {savedItems.map((item) => (
              <div key={item.product.id} className="bg-white rounded-2xl p-4 border border-neutral-200 flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                  <img src={item.product.image_url ?? ''} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 line-clamp-1">{item.product.name}</p>
                  <p className="text-sm text-neutral-600">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      moveToCart(item.product.id);
                      toast('Moved to cart');
                    }}
                    className="text-xs font-medium text-amber-700 hover:text-amber-600 px-3 py-2 border border-amber-200 rounded-lg"
                  >
                    Move to Cart
                  </button>
                  <button
                    onClick={() => {
                      removeSaved(item.product.id);
                      toast('Removed from saved', 'info');
                    }}
                    className="text-neutral-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

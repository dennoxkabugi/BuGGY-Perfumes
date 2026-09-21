import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Minus, Plus, Truck, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react';
import type { Product, Review } from '@/types';
import { getProductBySlug, getProducts, getReviews, addReview } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice, getDiscountPercentage, formatDate } from '@/utils/format';
import { ProductCard } from '@/components/ProductCard';
import { PageLoader, EmptyState } from '@/components/Loaders';

type Tab = 'description' | 'ingredients' | 'reviews' | 'shipping';

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('description');

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    getProductBySlug(slug)
      .then(async (p) => {
        setProduct(p);
        if (p) {
          getReviews(p.id).then(setReviews).catch(() => {});
          if (p.category_id) {
            getProducts({ category: p.category_id, limit: 4 })
              .then((items) => setRelated(items.filter((i) => i.id !== p.id).slice(0, 4)))
              .catch(() => {});
          }
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <EmptyState
          title="Product not found"
          message="The product you are looking for may have been removed or is no longer available."
          actionLabel="Continue Shopping"
          onAction={() => navigate('/shop')}
        />
      </div>
    );

  const discount = getDiscountPercentage(product.price, product.compare_at_price);
  const inWishlist = isInWishlist(product.id);
  const outOfStock = product.stock_quantity <= 0;
  const gallery = product.gallery?.length ? product.gallery : [product.image_url ?? ''];

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart(product, quantity);
    toast(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', 'info');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please sign in to leave a review', 'info');
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await addReview({
        product_id: product.id,
        user_id: user.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      toast('Review submitted successfully');
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      getReviews(product.id).then(setReviews).catch(() => {});
    } catch {
      toast('Failed to submit review. You may have already reviewed this product.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const tabs: { id: Tab; label: string }[] = [
    { id: 'description', label: 'Description' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
    { id: 'shipping', label: 'Shipping & Returns' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-neutral-500 mb-8">
        <Link to="/" className="hover:text-amber-700">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="hover:text-amber-700">Shop</Link>
        <ChevronRight size={14} />
        <span className="text-neutral-900 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Gallery */}
        <div>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 mb-4 border border-neutral-200"
          >
            <img src={gallery[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>
          {gallery.length > 1 && (
            <div className="flex gap-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-amber-500' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-amber-600 font-medium uppercase tracking-wide mb-2">{product.brand}</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(product.rating_avg) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}
                />
              ))}
            </div>
            <span className="text-sm text-neutral-600">
              {product.rating_avg > 0 ? `${product.rating_avg.toFixed(1)} (${product.rating_count} reviews)` : 'No reviews yet'}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-neutral-900">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <>
                <span className="text-lg text-neutral-400 line-through">{formatPrice(product.compare_at_price)}</span>
                <span className="bg-amber-100 text-amber-700 text-sm font-semibold px-2 py-1 rounded-full">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-neutral-600 mb-6">{product.description}</p>

          {/* Fragrance Notes */}
          {product.fragrance_notes && (product.fragrance_notes.top.length > 0 || product.fragrance_notes.heart.length > 0 || product.fragrance_notes.base.length > 0) && (
            <div className="bg-neutral-50 rounded-2xl p-5 mb-6 border border-neutral-200">
              <h3 className="font-semibold text-neutral-900 mb-4 text-sm">Fragrance Notes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase mb-2">Top Notes</p>
                  <p className="text-sm text-neutral-700">{product.fragrance_notes.top.join(', ') || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase mb-2">Heart Notes</p>
                  <p className="text-sm text-neutral-700">{product.fragrance_notes.heart.join(', ') || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase mb-2">Base Notes</p>
                  <p className="text-sm text-neutral-700">{product.fragrance_notes.base.join(', ') || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Size & Stock */}
          <div className="flex items-center gap-4 mb-6">
            {product.size && (
              <div>
                <p className="text-xs text-neutral-500 mb-1">Size</p>
                <p className="text-sm font-medium text-neutral-900">{product.size}</p>
              </div>
            )}
            <div className="h-8 w-px bg-neutral-200" />
            <div>
              <p className="text-xs text-neutral-500 mb-1">Availability</p>
              <p className={`text-sm font-medium ${outOfStock ? 'text-red-600' : 'text-green-600'}`}>
                {outOfStock ? 'Out of Stock' : `In Stock (${product.stock_quantity} left)`}
              </p>
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-neutral-200 rounded-xl">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-11 h-11 flex items-center justify-center text-neutral-600 hover:text-neutral-900"
                disabled={outOfStock}
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-11 h-11 flex items-center justify-center text-neutral-600 hover:text-neutral-900"
                disabled={outOfStock}
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1 bg-neutral-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-amber-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
            <button
              onClick={handleWishlist}
              className="w-11 h-11 border border-neutral-200 rounded-xl flex items-center justify-center hover:bg-neutral-50 transition-colors"
              aria-label="Toggle wishlist"
            >
              <Heart className={inWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-600'} size={18} />
            </button>
          </div>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="w-full bg-amber-500 text-neutral-900 py-3 rounded-xl font-semibold text-sm hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-6"
          >
            Buy Now
          </button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-neutral-200">
            <div className="flex flex-col items-center text-center gap-1">
              <Truck className="w-5 h-5 text-amber-600" />
              <p className="text-xs text-neutral-600">Fast Delivery</p>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <p className="text-xs text-neutral-600">Secure Payment</p>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <RefreshCw className="w-5 h-5 text-amber-600" />
              <p className="text-xs text-neutral-600">Easy Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-16">
        <div className="flex gap-1 border-b border-neutral-200 overflow-x-auto mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-500 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-w-3xl">
          {activeTab === 'description' && (
            <div className="prose prose-sm max-w-none">
              <p className="text-neutral-700 leading-relaxed">{product.description}</p>
              {product.fragrance_notes && (
                <div className="mt-6">
                  <h4 className="font-semibold text-neutral-900 mb-3">Fragrance Profile</h4>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li><strong className="text-neutral-900">Top Notes:</strong> {product.fragrance_notes.top.join(', ')}</li>
                    <li><strong className="text-neutral-900">Heart Notes:</strong> {product.fragrance_notes.heart.join(', ')}</li>
                    <li><strong className="text-neutral-900">Base Notes:</strong> {product.fragrance_notes.base.join(', ')}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          {activeTab === 'ingredients' && (
            <div className="text-sm text-neutral-700 leading-relaxed">
              <p>
                Ingredients: Alcohol Denat., Fragrance (Parfum), Water (Aqua), {product.fragrance_notes?.top?.join(', ')}, {product.fragrance_notes?.heart?.join(', ')}, {product.fragrance_notes?.base?.join(', ')}, Limonene, Linalool, Citral, Geraniol, Coumarin.
              </p>
              <p className="mt-4 text-neutral-500">
                For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Keep away from heat and flame. Not for consumption.
              </p>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div>
              {/* Rating Summary */}
              <div className="flex flex-col sm:flex-row gap-8 mb-8">
                <div className="text-center">
                  <p className="text-4xl font-bold text-neutral-900">
                    {product.rating_avg > 0 ? product.rating_avg.toFixed(1) : '—'}
                  </p>
                  <div className="flex items-center justify-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= Math.round(product.rating_avg) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-500">{product.rating_count} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {ratingDistribution.map((r) => (
                    <div key={r.star} className="flex items-center gap-2">
                      <span className="text-xs text-neutral-600 w-12">{r.star} stars</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${reviews.length > 0 ? (r.count / reviews.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500 w-8">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Form */}
              <form onSubmit={handleSubmitReview} className="bg-neutral-50 rounded-2xl p-5 mb-8 border border-neutral-200">
                <h4 className="font-semibold text-neutral-900 mb-4">Write a Review</h4>
                {!user && (
                  <p className="text-sm text-neutral-500 mb-4">
                    Please <Link to="/login" className="text-amber-700 underline">sign in</Link> to write a review.
                  </p>
                )}
                <div className="mb-4">
                  <label className="text-sm text-neutral-700 mb-2 block">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        disabled={!user}
                      >
                        <Star
                          size={24}
                          className={s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Review title"
                  disabled={!user}
                  className="w-full bg-white px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm mb-3"
                />
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  rows={4}
                  disabled={!user}
                  className="w-full bg-white px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm mb-3 resize-none"
                />
                <button
                  type="submit"
                  disabled={!user || submittingReview}
                  className="bg-neutral-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-40"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-neutral-200 pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-neutral-900">
                          {review.user?.full_name ?? 'Anonymous'}
                        </span>
                        <span className="text-xs text-neutral-500">{formatDate(review.created_at)}</span>
                      </div>
                      {review.title && <h5 className="font-medium text-neutral-900 mb-1">{review.title}</h5>}
                      <p className="text-sm text-neutral-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'shipping' && (
            <div className="text-sm text-neutral-700 space-y-4 leading-relaxed">
              <div>
                <h4 className="font-semibold text-neutral-900 mb-2">Shipping</h4>
                <p>We offer fast and reliable delivery across all regions. Orders are processed within 1-2 business days. Standard delivery takes 3-5 business days. Express delivery is available for urgent orders.</p>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-2">Returns</h4>
                <p>We accept returns within 14 days of delivery for unopened and unused products in their original packaging. Refunds are processed within 5-7 business days of receiving the returned item.</p>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-2">Damaged Items</h4>
                <p>If your order arrives damaged, please contact us within 48 hours with photos for a replacement or full refund.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* You May Also Like */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

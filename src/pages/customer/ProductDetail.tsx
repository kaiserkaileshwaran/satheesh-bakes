import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, MessageSquare, LogIn, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { StorageService } from '../../services/storageService';
import { formatCurrency } from '../../utils/avatarGenerator';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

/** Module-level utility — keeps Date.now() out of component render scope */
function generateReviewId(): string {
  return `rev-${Date.now()}`;
}

function getCurrentTimestamp(): number {
  return Date.now();
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const product = id ? StorageService.getProductById(id) : undefined;
  const [selectedImage, setSelectedImage] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  const [allReviews, setAllReviews] = useState(StorageService.getReviews());
  const productReviews = allReviews.filter((r) => r.productId === id && r.status === 'approved');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const touchStartX = useRef<number>(0);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setReviewLoading(true);
    const review = {
      id: generateReviewId(),
      productId: id!,
      productName: product?.name || '',
      customerId: user.uid,
      customerName: user.fullName,
      avatarText: user.avatar.text,
      avatarBg: user.avatar.background,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
      status: 'pending' as const,
      createdAt: getCurrentTimestamp(),
    };
    StorageService.addReview(review);
    setAllReviews(StorageService.getReviews());
    setReviewSubmitted(true);
    setReviewLoading(false);
    setReviewTitle('');
    setReviewComment('');
    setReviewRating(5);
    showToast('Review Submitted!', 'Your review will appear after moderation.', 'success');
  };

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-xl w-full bg-white dark:bg-bakery-chocolate border border-bakery-beige rounded-3xl p-8 text-center shadow-warm">
          <h2 className="font-serif text-3xl font-bold text-bakery-chocolate dark:text-bakery-cream">Product not found</h2>
          <p className="mt-3 text-sm text-bakery-chocolate/70 dark:text-bakery-cream/70">Please check the menu and try again.</p>
          <Link to="/menu" className="inline-flex mt-6 px-5 py-3 rounded-full bg-bakery-brown text-bakery-cream font-semibold hover:bg-bakery-brown-dark transition-colors">Back to Menu</Link>
        </div>
      </div>
    );
  }

  const allImages = [product.coverImage, ...(product.images || [])].filter(Boolean);
  const effectivePrice = product.offerPrice || product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="flex items-center gap-4">
        <Link to="/menu" className="inline-flex items-center gap-2 text-bakery-brown font-semibold text-sm hover:text-bakery-gold">
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Link>
        <span className="px-3 py-1 rounded-full bg-bakery-beige text-bakery-chocolate text-xs font-semibold">
          {product.categoryId.replace('cat-', '')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
        {/* Images: Carousel */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[2rem] bg-bakery-beige/30 shadow-warm" style={{ paddingTop: '75%' }}>
            {/* paddingTop 75% enforces 4:3 aspect ratio */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              onTouchStart={(e) => {
                const t = e.touches[0];
                touchStartX.current = t.clientX;
              }}
              onTouchEnd={(e) => {
                const t = e.changedTouches[0];
                const diff = touchStartX.current - t.clientX;
                if (Math.abs(diff) > 40) {
                  if (diff > 0) {
                    setSelectedImage((s) => (s + 1) % allImages.length);
                  } else {
                    setSelectedImage((s) => (s - 1 + allImages.length) % allImages.length);
                  }
                }
              }}
            >
              {/* Animated image container */}
              <div className="w-full h-full relative">
                {allImages.map((img, idx) => (
                  <motion.img
                    key={idx}
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    loading={idx === selectedImage ? 'eager' : 'lazy'}
                    initial={{ opacity: 0, x: 30 }}
                    animate={selectedImage === idx ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 w-full h-full object-cover rounded-[2rem]`}
                    style={{ display: selectedImage === idx ? 'block' : 'none' }}
                  />
                ))}

                {/* Prev/Next Buttons */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((s) => (s - 1 + allImages.length) % allImages.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-bakery-chocolate hover:scale-105 transition-all"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setSelectedImage((s) => (s + 1) % allImages.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-bakery-chocolate hover:scale-105 transition-all"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Dots */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`rounded-full transition-all ${selectedImage === i ? 'w-8 h-2.5 bg-bakery-gold' : 'w-2.5 h-2.5 bg-white/50'}`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`overflow-hidden rounded-2xl aspect-square border-2 transition-all ${
                    selectedImage === i ? 'border-bakery-gold shadow-warm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="rounded-[2rem] bg-white dark:bg-bakery-chocolate border border-bakery-beige shadow-warm p-8 flex flex-col gap-6">
          <div className="space-y-3">
            <h1 className="font-serif text-4xl font-bold text-bakery-chocolate dark:text-bakery-cream">{product.name}</h1>
            <p className="text-xs uppercase tracking-wider text-bakery-brown/70">{product.metadata.occasion.join(' • ')}</p>

            <div className="flex flex-wrap gap-2 text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bakery-beige/80">
                <Star className="w-3 h-3 text-amber-500 fill-amber-400" /> {product.rating}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bakery-beige/80">{product.reviewCount} Reviews</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bakery-beige/80">
                <MapPin className="w-3 h-3" /> {product.metadata.temperature}
              </span>
              {product.metadata.diet === 'eggless' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  🌱 Eggless
                </span>
              )}
            </div>

            <div className="flex items-end gap-3 mt-2">
              <p className="text-4xl font-serif font-bold text-bakery-brown dark:text-bakery-gold">{formatCurrency(effectivePrice)}</p>
              {product.offerPrice && (
                <p className="text-sm text-bakery-chocolate/50 line-through pb-1">{formatCurrency(product.price)}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 text-sm text-bakery-chocolate/80 dark:text-bakery-cream/80">
            <p>{product.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-bakery-beige/50 p-4">
                <h3 className="text-xs font-semibold uppercase text-bakery-brown/70 mb-2">Key Ingredients</h3>
                <div className="space-y-1.5 text-[13px]">
                  {product.ingredients.map((ingredient) => (
                    <p key={ingredient} className="leading-5">• {ingredient}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-bakery-beige/50 p-4">
                <h3 className="text-xs font-semibold uppercase text-bakery-brown/70 mb-2">Taste Profile</h3>
                <div className="space-y-2 text-[13px]">
                  <div className="flex items-center justify-between"><span>Sweetness</span><span>{product.metadata.sweetness}/5</span></div>
                  <div className="flex items-center justify-between"><span>Spice</span><span>{product.metadata.spice}/5</span></div>
                  <div className="flex items-center justify-between"><span>Softness</span><span>{product.metadata.softness}/5</span></div>
                  <div className="flex items-center justify-between"><span>Crunch</span><span>{product.metadata.crunchiness}/5</span></div>
                </div>
              </div>
            </div>
          </div>

          {product.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.metadata.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-bakery-gold/10 text-bakery-brown text-xs font-semibold">#{tag}</span>
              ))}
            </div>
          )}

          <Link
            to="/menu"
            className="w-full rounded-3xl bg-gradient-to-r from-bakery-brown to-bakery-chocolate text-bakery-cream py-4 text-sm font-bold hover:from-bakery-chocolate hover:to-bakery-brown transition-all flex items-center justify-center gap-2 shadow-warm"
          >
            Browse More Items →
          </Link>
        </div>
      </div>

      {/* Approved Reviews */}
      {productReviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-bakery-chocolate dark:text-bakery-cream">Customer Reviews ({productReviews.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {productReviews.map((r) => (
              <div key={r.id} className="p-5 rounded-3xl bg-white dark:bg-bakery-chocolate border border-bakery-beige shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: r.avatarBg }}>{r.avatarText}</div>
                    <div>
                      <p className="font-bold text-xs text-bakery-chocolate dark:text-bakery-cream">{r.customerName}</p>
                      <p className="text-[10px] text-bakery-chocolate/50 dark:text-bakery-cream/50">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-bakery-beige'}`} />)}
                  </div>
                </div>
                {r.title && <p className="font-semibold text-xs text-bakery-chocolate dark:text-bakery-cream">"{r.title}"</p>}
                <p className="text-xs text-bakery-chocolate/80 dark:text-bakery-cream/70 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write a Review */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bakery-chocolate border border-bakery-beige shadow-warm space-y-5">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-bakery-brown" />
          <h2 className="font-serif font-bold text-xl text-bakery-chocolate dark:text-bakery-cream">Write a Review</h2>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-bakery-chocolate/70 dark:text-bakery-cream/70">Please sign in with Google to leave a review.</p>
            <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bakery-brown text-bakery-cream font-bold text-sm hover:bg-bakery-brown-dark transition-colors">
              <LogIn className="w-4 h-4" /> Sign In to Review
            </Link>
          </div>
        ) : reviewSubmitted ? (
          <div className="text-center py-8 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-bakery-chocolate dark:text-bakery-cream">Review Submitted!</p>
            <p className="text-xs text-bakery-chocolate/60 dark:text-bakery-cream/60">Your review is pending moderation and will appear shortly.</p>
            <button onClick={() => setReviewSubmitted(false)} className="text-xs text-bakery-brown font-semibold hover:text-bakery-gold">Write another review</button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-2 text-bakery-chocolate dark:text-bakery-cream">Your Rating *</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    onMouseEnter={() => setReviewHoverRating(s)}
                    onMouseLeave={() => setReviewHoverRating(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star className={`w-7 h-7 transition-colors ${s <= (reviewHoverRating || reviewRating) ? 'fill-amber-400 text-amber-400' : 'text-bakery-beige dark:text-bakery-brown'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-bakery-chocolate dark:text-bakery-cream">Review Title *</label>
              <input
                required
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Absolutely delicious!"
                maxLength={80}
                className="w-full px-3 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-bakery-chocolate dark:text-bakery-cream">Your Review *</label>
              <textarea
                required
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                maxLength={500}
                className="w-full px-3 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-bakery-gold resize-none text-bakery-chocolate dark:text-bakery-cream"
              />
              <p className="text-right text-[10px] text-bakery-chocolate/40 mt-0.5">{reviewComment.length}/500</p>
            </div>
            <button
              type="submit"
              disabled={reviewLoading}
              className="px-6 py-3 rounded-xl bg-bakery-brown text-bakery-cream font-bold text-sm hover:bg-bakery-brown-dark transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

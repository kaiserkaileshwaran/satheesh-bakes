import React, { useState } from 'react';
import { CheckCircle2, XCircle, EyeOff, Star, Trash2, MessageSquare } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';

const STATUS_BADGE: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  hidden: 'bg-gray-100 text-gray-500',
};

export const ReviewsModerator: React.FC = () => {
  const { showToast } = useNotification();
  const [reviews, setReviews] = useState(StorageService.getReviews());
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');

  const refresh = () => setReviews(StorageService.getReviews());

  const setStatus = (id: string, status: 'approved' | 'hidden' | 'pending') => {
    StorageService.updateReviewStatus(id, status);
    refresh();
    const labels = { approved: 'Published', hidden: 'Hidden', pending: 'Set to Pending' };
    showToast('Status Updated', `Review ${labels[status]}.`, 'success');
  };

  const deleteReview = (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    StorageService.deleteReview(id);
    refresh();
    showToast('Deleted', 'Review removed.', 'info');
  };

  const filtered = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-bakery-chocolate dark:text-bakery-cream">Reviews Moderator</h1>
          <p className="text-xs text-bakery-chocolate/60 dark:text-bakery-cream/60 mt-0.5">{reviews.length} total reviews</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'hidden'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors border ${
                filter === f
                  ? 'bg-bakery-brown text-bakery-cream border-bakery-brown'
                  : 'bg-white dark:bg-gray-900 text-bakery-chocolate dark:text-bakery-cream border-bakery-beige hover:border-bakery-brown'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-3xl border border-dashed border-bakery-beige text-bakery-chocolate/50 dark:text-bakery-cream/50">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No {filter === 'all' ? '' : filter} reviews yet.</p>
          </div>
        )}

        {filtered.map((review) => (
          <div key={review.id} className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-bakery-beige shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                  style={{ backgroundColor: review.avatarBg || '#6B3A2A' }}
                >
                  {review.avatarText}
                </div>
                <div>
                  <p className="font-bold text-sm text-bakery-chocolate dark:text-bakery-cream">{review.customerName}</p>
                  <p className="text-[11px] text-bakery-chocolate/50 dark:text-bakery-cream/50">
                    {review.productName && <span className="mr-2">on {review.productName}</span>}
                    {new Date(review.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-bakery-gold text-bakery-gold' : 'text-bakery-beige'}`} />
                ))}
              </div>
            </div>

            {review.title && <p className="font-bold text-sm text-bakery-chocolate dark:text-bakery-cream">"{review.title}"</p>}
            <p className="text-xs text-bakery-chocolate/80 dark:text-bakery-cream/80 leading-relaxed">{review.comment}</p>

            <div className="flex items-center justify-between pt-1">
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] capitalize ${STATUS_BADGE[review.status] || STATUS_BADGE.pending}`}>
                {review.status || 'pending'}
              </span>
              <div className="flex gap-2">
                {review.status !== 'approved' && (
                  <button onClick={() => setStatus(review.id, 'approved')} className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors" title="Approve">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                {review.status === 'approved' && (
                  <button onClick={() => setStatus(review.id, 'hidden')} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" title="Hide">
                    <EyeOff className="w-4 h-4" />
                  </button>
                )}
                {review.status === 'hidden' && (
                  <button onClick={() => setStatus(review.id, 'pending')} className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors" title="Set Pending">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => deleteReview(review.id)} className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

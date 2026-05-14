import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Star, MessageSquare, Send, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles:user_id(first_name, last_name)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data as any || []);

      if (user) {
        const userReview = (data as any[] || []).find(r => r.user_id === user.id);
        if (userReview) setHasReviewed(true);
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }

    if (hasReviewed) {
      toast.error('You have already reviewed this product');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast.success('Review submitted successfully!');
      setComment('');
      setHasReviewed(true);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-12 space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left: Summary */}
        <div className="w-full md:w-1/3 bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Customer Reviews</h3>
          <div className="flex flex-col items-center gap-2">
            <div className="text-5xl font-black text-[#F5A623]">{averageRating}</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i <= Number(averageRating) ? 'fill-[#F5A623] text-[#F5A623]' : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-slate-400 text-sm mt-1">Based on {reviews.length} reviews</p>
          </div>
        </div>

        {/* Right: Write a review form (if not reviewed and logged in) */}
        <div className="w-full md:w-2/3">
          {user ? (
            !hasReviewed ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#3B82F6]" />
                  Write a Review
                </h4>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(i)}
                          className={`p-1 transition-transform hover:scale-110 ${
                            i <= rating ? 'text-[#F5A623]' : 'text-slate-600'
                          }`}
                        >
                          <Star className={`w-8 h-8 ${i <= rating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Comment (Optional)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-[#3B82F6] transition-all outline-none min-h-[100px] resize-none"
                    />
                  </div>
                  <button
                    disabled={submitting}
                    className="btn-primary w-full h-12 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Review
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-2xl p-6 text-center">
                <p className="text-[#22C55E] font-bold">You've already reviewed this product. Thank you!</p>
              </div>
            )
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-slate-400 mb-4">Please login to write a review</p>
              <button 
                onClick={() => (window as any).dispatchEvent(new CustomEvent('open-auth'))}
                className="btn-primary h-10 px-6 inline-flex items-center gap-2"
              >
                Login Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Customer Stories
          <span className="text-xs font-normal text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{reviews.length}</span>
        </h3>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 w-full bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#6d28d9] flex items-center justify-center text-white font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {review.profiles?.first_name 
                          ? `${review.profiles.first_name} ${review.profiles.last_name || ''}`
                          : 'Anonymous User'}
                      </p>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i <= review.rating ? 'fill-[#F5A623] text-[#F5A623]' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    {new Date(review.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "{review.comment}"
                  </p>
                )}
                
                {/* Visual accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors pointer-events-none" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;

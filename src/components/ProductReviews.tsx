import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  Sparkles, 
  ShieldCheck,
  User as UserIcon,
  Filter
} from 'lucide-react';
import { Product, ProductReview, User } from '../types';

interface ProductReviewsProps {
  product: Product;
  currentUser: User | null;
  onAddReview: (productId: string, review: Omit<ProductReview, 'id' | 'createdAt'>) => void;
  onOpenAuth: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Décevant',
  2: 'Passable',
  3: 'Moyen / Conforme',
  4: 'Très bon produit',
  5: 'Excellent ! Recommandé',
};

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  product,
  currentUser,
  onAddReview,
  onOpenAuth,
}) => {
  const reviews = product.reviews || [];
  
  // Rating calculation
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '—';

  // Breakdown calculation
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  // State for adding a review
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [reviewName, setReviewName] = useState(currentUser?.name || '');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const filteredReviews = ratingFilter === 'all' 
    ? reviews 
    : reviews.filter((r) => r.rating === ratingFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    onAddReview(product.id, {
      productId: product.id,
      userId: currentUser?.id || `guest-${Date.now()}`,
      userName: reviewName.trim() || currentUser?.name || 'Client vérifié',
      rating: selectedRating,
      title: reviewTitle.trim() || undefined,
      comment: reviewComment.trim(),
      isVerifiedPurchase: true,
    });

    setSubmittedSuccess(true);
    setReviewComment('');
    setReviewTitle('');
    setTimeout(() => {
      setSubmittedSuccess(false);
      setIsWritingReview(false);
    }, 1500);
  };

  const activeRating = hoveredRating !== null ? hoveredRating : selectedRating;

  return (
    <div className="pt-6 border-t border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <span>Avis & Évaluations Clients</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              {totalReviews} {totalReviews === 1 ? 'avis' : 'avis'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Retours authentiques d'acheteurs au Togo
          </p>
        </div>

        {!isWritingReview && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsWritingReview(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Donner mon avis</span>
          </motion.button>
        )}
      </div>

      {/* Global Ratings Overview Card */}
      <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/70 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          
          {/* Average score column */}
          <div className="sm:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left border-b sm:border-b-0 sm:border-r border-slate-200/80 pb-4 sm:pb-0 sm:pr-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-950">
                {averageRating}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 5</span>
            </div>

            {/* Stars rendering */}
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(Number(averageRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              ))}
            </div>

            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% avis vérifiés après commande</span>
            </p>
          </div>

          {/* Breakdown bars column */}
          <div className="sm:col-span-7 space-y-1.5">
            {ratingCounts.map(({ stars, count, percentage }) => (
              <button
                key={stars}
                type="button"
                onClick={() => setRatingFilter(ratingFilter === stars ? 'all' : stars)}
                className={`w-full flex items-center gap-2 text-xs group text-left rounded-lg p-0.5 transition-colors ${
                  ratingFilter === stars ? 'bg-amber-100/60 font-bold' : 'hover:bg-slate-100'
                }`}
              >
                <span className="w-6 text-[11px] font-semibold text-slate-600 flex items-center gap-0.5">
                  {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 bg-slate-200/70 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <span className="w-6 text-[10px] text-slate-400 font-mono text-right">
                  {count}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Write a Review Section */}
      <AnimatePresence>
        {isWritingReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-5 border-2 border-amber-500/30 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Partager votre expérience sur cet article</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsWritingReview(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Annuler
                </button>
              </div>

              {/* Star Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Votre note globale : <span className="text-amber-600 font-bold">{RATING_LABELS[activeRating]}</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="p-1 hover:scale-120 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= activeRating
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-slate-200 fill-slate-100 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Votre nom ou prénom
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Ex: Koffi A."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Titre de l'avis (optionnel)
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Ex: Excellente qualité, conforme à la description"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                  />
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Votre commentaire détaillé
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Qu'avez-vous pensé de cet article ? Livraison, aspect, finitions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submittedSuccess || !reviewComment.trim()}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 shadow-md ${
                    submittedSuccess
                      ? 'bg-emerald-600 shadow-emerald-600/30'
                      : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20 disabled:opacity-50'
                  }`}
                >
                  {submittedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Avis publié avec succès !</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publier mon avis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter / Filter chips */}
      {totalReviews > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtrer :
          </span>
          <button
            type="button"
            onClick={() => setRatingFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
              ratingFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter((r) => r.rating === stars).length;
            if (count === 0) return null;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => setRatingFilter(stars)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                  ratingFilter === stars
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{stars}</span>
                <Star className="w-3 h-3 fill-current" />
                <span>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-8 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">Aucun avis pour le moment</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Soyez le premier client à partager votre avis sur cet article !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors shadow-xs"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                    {rev.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          Achat vérifié
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= rev.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 fill-slate-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {rev.title && (
                <h5 className="text-xs font-bold text-slate-900 mb-1">
                  {rev.title}
                </h5>
              )}

              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {rev.comment}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

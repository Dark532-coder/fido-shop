import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShoppingBag, 
  Check, 
  Layers, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Plus, 
  Minus, 
  Smartphone,
  Star,
  Sparkles,
  Heart,
  Share2
} from 'lucide-react';
import { Product, ProductReview, User } from '../types';
import { formatFCFA } from '../utils/security';
import { ProductReviews } from './ProductReviews';

interface ProductDetailModalProps {
  product: Product | null;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onAddReview: (productId: string, review: Omit<ProductReview, 'id' | 'createdAt'>) => void;
  onOpenAuth: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currentUser,
  isOpen,
  onClose,
  onAddToCart,
  onAddReview,
  onOpenAuth,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Reset state when a different product is opened
  React.useEffect(() => {
    if (isOpen && product) {
      setSelectedPhotoIndex(0);
      setQuantity(1);
      setAddedSuccess(false);
      setActiveTab('details');
    }
  }, [isOpen, product?.id]);

  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];

  const currentImage = images[selectedPhotoIndex] || images[0];

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const reviewsCount = product.reviews?.length || 0;
  const averageRating = reviewsCount > 0
    ? (product.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1)
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto" role="dialog" aria-modal="true" aria-label={product.name}>
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-onyx-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gold-500/20 flex flex-col md:flex-row max-h-[92vh] z-10 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Side: Interactive Multi-Photo Gallery */}
          <div className="md:w-1/2 bg-slate-50/70 p-5 sm:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 shrink-0">
            <div>
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-xs mb-4">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt={product.name}
                    initial={{ opacity: 0.4, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.4 }}
                    transition={{ duration: 0.22 }}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {discountPercent > 0 && (
                    <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-xs">
                      -{discountPercent}%
                    </span>
                  )}
                  <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs">
                    {product.category || 'Article'}
                  </span>
                </div>
              </div>

              {/* Multiple Photos Thumbnails Selector */}
              {images.length > 1 && (
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>Galerie ({images.length} photos)</span>
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setSelectedPhotoIndex(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          selectedPhotoIndex === idx
                            ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs scale-105'
                            : 'border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Reassurance Features */}
            <div className="mt-6 pt-4 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 bg-white/80 p-2 rounded-xl border border-slate-200/60">
                <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] font-semibold">Mixx by Yas & Fozz</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-white/80 p-2 rounded-xl border border-slate-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-semibold">Validation 2FA</span>
              </div>
            </div>
          </div>

          {/* Right Side: Product Details, Tabs, Reviews & Actions */}
          <div className="md:w-1/2 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[92vh]">
            <div>
              {/* Header with Close */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  {averageRating !== null ? (
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/70">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-black text-amber-900">{averageRating}</span>
                      <span className="text-[10px] text-amber-700 font-bold">({reviewsCount} avis)</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/70">
                      Nouveau — Soyez le 1er à donner votre avis
                    </span>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Title & Price */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mb-2">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {formatFCFA(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatFCFA(product.originalPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Économisez {formatFCFA(product.originalPrice! - product.price)}
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="mb-4">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    En stock ({product.stock} disponibles immédiatement)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Rupture de stock temporaire
                  </span>
                )}
              </div>

              {/* Navigation Tabs (Description vs Reviews) */}
              <div className="flex border-b border-slate-200 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`pb-2.5 px-3 text-xs sm:text-sm font-bold transition-all relative ${
                    activeTab === 'details'
                      ? 'text-slate-900 border-b-2 border-amber-500'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Description & Détails
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2.5 px-3 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 relative ${
                    activeTab === 'reviews'
                      ? 'text-slate-900 border-b-2 border-amber-500'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Avis Clients</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full font-mono font-bold">
                    {reviewsCount}
                  </span>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'details' ? (
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-6">
                    {product.description || 'Aucune description spécifique fournie pour cet article.'}
                  </p>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {product.tags.map((tag, idx) => (
                        <span key={idx} className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Delivery Info */}
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-700 space-y-2 mb-4">
                    <div className="flex items-center gap-2 font-bold text-amber-950">
                      <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Expédition express à Lomé & Régions du Togo</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal pl-6">
                      Commande livrée en 24h à 48h. Règlement 100% sécurisé à l'initiation par Push USSD Mixx by Yas (*145#) ou Fozz (*155#).
                    </p>
                  </div>
                </div>
              ) : (
                <ProductReviews
                  product={product}
                  currentUser={currentUser}
                  onAddReview={onAddReview}
                  onOpenAuth={onOpenAuth}
                />
              )}
            </div>

            {/* Bottom Actions: Quantity + Add to Cart */}
            <div className="pt-5 border-t border-slate-100 flex items-center gap-3 sticky bottom-0 bg-white mt-4">
              <div className="flex items-center border border-slate-200/90 rounded-2xl bg-slate-50 p-1">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-white disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </motion.button>
                <span className="w-9 text-center font-black text-xs text-slate-900">
                  {quantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  type="button"
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-white disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              <motion.button
                id="btn-modal-add-to-cart"
                type="button"
                whileHover={product.stock > 0 && !addedSuccess ? { scale: 1.02 } : {}}
                whileTap={product.stock > 0 && !addedSuccess ? { scale: 0.97 } : {}}
                disabled={product.stock === 0 || addedSuccess}
                onClick={handleAdd}
                className={`flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : product.stock === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25'
                }`}
              >
                <AnimatePresence mode="wait">
                  {addedSuccess ? (
                    <motion.span
                      key="added"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Ajouté au panier !</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Ajouter au Panier • {formatFCFA(product.price * quantity)}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

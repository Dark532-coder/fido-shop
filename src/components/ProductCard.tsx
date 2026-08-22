import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Layers, 
  Star,
} from 'lucide-react';
import { Product } from '../types';
import { formatFCFA } from '../utils/security';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(
    product.featuredImageIndex ?? 0
  );
  const [isAdded, setIsAdded] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];

  const currentImage = images[currentImageIndex] || images[0];

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const reviewsCount = product.reviews?.length || 0;
  const ratingScore = reviewsCount > 0
    ? (product.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1)
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => onQuickView(product)}
      className="group bg-onyx-900 rounded-3xl border border-onyx-700/80 hover:border-gold-500/50 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-gold-500/10 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Image Area */}
      <div className="relative aspect-square w-full bg-onyx-800 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={currentImage}
            alt={product.name}
            initial={{ opacity: 0.6, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 0.22 }}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </AnimatePresence>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm"
            >
              -{discountPercent}%
            </motion.span>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="bg-onyx-950/85 text-gold-300 border border-gold-500/40 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs backdrop-blur-xs">
              Plus que {product.stock}
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-onyx-800 text-onyx-300 border border-onyx-600 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs">
              Épuisé
            </span>
          )}
        </div>

        {images.length > 1 && (
          <>
            <div className="absolute top-3 right-3 bg-onyx-950/80 backdrop-blur-xs text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 z-10">
              <Layers className="w-3 h-3 text-gold-400" />
              <span>{currentImageIndex + 1}/{images.length}</span>
            </div>

            <div className="absolute inset-x-1.5 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handlePrevImage}
                className="w-7 h-7 rounded-full bg-onyx-950/90 text-gold-300 shadow-md flex items-center justify-center hover:bg-onyx-900 transition-colors"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleNextImage}
                className="w-7 h-7 rounded-full bg-onyx-950/90 text-gold-300 shadow-md flex items-center justify-center hover:bg-onyx-900 transition-colors"
                aria-label="Photo suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-onyx-950/90 hover:bg-onyx-900 text-gold-300 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
          title="Aperçu rapide"
        >
          <Eye className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider">
              {product.category || 'Article'}
            </span>
            
            {ratingScore !== null ? (
              <div className="flex items-center gap-1 text-[11px] font-bold text-onyx-300">
                <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                <span>{ratingScore}</span>
                <span className="text-onyx-500 font-normal">({reviewsCount})</span>
              </div>
            ) : (
              <span className="text-[10px] font-bold text-gold-400 bg-gold-500/10 px-1.5 py-0.5 rounded-md">
                Nouveau
              </span>
            )}
          </div>

          <h3 className="font-bold text-onyx-50 text-sm sm:text-base line-clamp-1 group-hover:text-gold-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-onyx-500 line-clamp-2 mt-1 mb-3">
            {product.description || 'Article de qualité supérieure.'}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between pt-3 border-t border-onyx-700">
            <div>
              <div className="text-sm sm:text-base font-black text-gold-400">
                {formatFCFA(product.price)}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-[11px] text-onyx-500 line-through">
                  {formatFCFA(product.originalPrice)}
                </div>
              )}
            </div>

            <motion.button
              id={`btn-add-cart-${product.id}`}
              type="button"
              disabled={product.stock === 0}
              onClick={handleAdd}
              whileHover={product.stock > 0 ? { scale: 1.05 } : {}}
              whileTap={product.stock > 0 ? { scale: 0.92 } : {}}
              className={`p-2.5 sm:px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 ${
                product.stock === 0
                  ? 'bg-onyx-800 text-onyx-500 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-gold-500 hover:bg-gold-400 text-onyx-950 shadow-sm hover:shadow-md hover:shadow-gold-500/20'
              }`}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.span
                    key="added"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ajouté</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ajouter</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

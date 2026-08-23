import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone, 
  Truck,
  Sparkles
} from 'lucide-react';
import { CartItem } from '../types';
import { formatFCFA } from '../utils/security';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const freeShippingThreshold = 50000;
  const deliveryFee = subtotal > 0 ? (subtotal >= freeShippingThreshold ? 0 : 1500) : 0;
  const total = subtotal + deliveryFee;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Panier">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-onyx-950/70 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
            >
              {/* Cart Header */}
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <motion.div 
                    initial={{ rotate: -15, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </motion.div>
                  <div>
                    <h2 className="text-base font-bold text-white">Mon Panier</h2>
                    <p className="text-[11px] text-slate-300">
                      {items.length} article{items.length > 1 ? 's' : ''} sélectionné{items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
                {items.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-16 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1">
                      Votre panier est vide
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                      Ajoutez des articles à votre panier pour passer commande via Mixx by Yas ou Flooz.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      Continuer mes achats
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-4 pt-1">
                    <AnimatePresence initial={false}>
                      {items.map((item) => {
                        const image = (item.product.images && item.product.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                        return (
                          <motion.div 
                            key={item.product.id}
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.9, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-3 pt-3 first:pt-0"
                          >
                            <img
                              src={image}
                              alt={item.product.name}
                              className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                                    {item.product.name}
                                  </h4>
                                  <p className="text-[11px] text-amber-600 font-bold mt-0.5">
                                    {formatFCFA(item.product.price)}
                                  </p>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.15, color: '#ef4444' }}
                                  whileTap={{ scale: 0.85 }}
                                  onClick={() => onRemoveItem(item.product.id)}
                                  className="text-slate-400 p-1 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </motion.button>
                              </div>

                              {/* Quantity controls */}
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                                  <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    type="button"
                                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                    className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </motion.button>
                                  <span className="w-7 text-center text-xs font-bold text-slate-800">
                                    {item.quantity}
                                  </span>
                                  <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    type="button"
                                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                    className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </motion.button>
                                </div>

                                <span className="text-xs font-extrabold text-slate-900">
                                  {formatFCFA(item.product.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {items.length > 0 && (
                <div className="p-5 bg-slate-50 border-t border-slate-200">
                  {/* Free delivery bar with smooth animation */}
                  {subtotal < freeShippingThreshold ? (
                    <div className="mb-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          Livraison offerte dès {formatFCFA(freeShippingThreshold)}
                        </span>
                        <span className="font-bold text-amber-700">{freeShippingProgress}%</span>
                      </div>
                      <div className="w-full bg-amber-200/60 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${freeShippingProgress}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full"
                        />
                      </div>
                      <p className="text-[10px] text-amber-800">
                        Plus que <strong>{formatFCFA(freeShippingThreshold - subtotal)}</strong> pour en profiter !
                      </p>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mb-3 p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Félicitations ! Vous bénéficiez de la <strong>livraison gratuite</strong>.</span>
                    </motion.div>
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex justify-between">
                      <span>Sous-total articles</span>
                      <span className="font-semibold text-slate-900">{formatFCFA(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais de livraison (Lomé & environs)</span>
                      <span className="font-semibold text-slate-900">
                        {deliveryFee === 0 ? <strong className="text-emerald-600">Gratuit</strong> : formatFCFA(deliveryFee)}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                      <span>Total à payer</span>
                      <span className="text-base text-amber-600">{formatFCFA(total)}</span>
                    </div>
                  </div>

                  {/* Secure payment notice */}
                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 mb-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Paiement chiffré par Mixx by Yas ou Flooz</span>
                  </div>

                  {/* Checkout Button */}
                  <motion.button
                    id="btn-cart-checkout"
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onCheckout}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Commander ({formatFCFA(total)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

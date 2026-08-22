import React from 'react';
import { motion } from 'motion/react';
import { Package, Plus, ShieldCheck, Smartphone, Layers } from 'lucide-react';

interface EmptyCatalogProps {
  isAdmin: boolean;
  hasUser: boolean;
  onAddProduct: () => void;
  onOpenAuth: () => void;
}

export const EmptyCatalogHero: React.FC<EmptyCatalogProps> = ({
  isAdmin,
  hasUser,
  onAddProduct,
  onOpenAuth,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-onyx-900 rounded-3xl border border-dashed border-onyx-700 p-8 sm:p-10 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-gold-500/10 text-gold-400 flex items-center justify-center mx-auto mb-4">
        <Package className="w-7 h-7" />
      </div>

      <h2 className="text-lg sm:text-xl font-black text-onyx-50 mb-2">
        Aucun article pour le moment
      </h2>
      <p className="text-xs sm:text-sm text-onyx-500 max-w-md mx-auto mb-6 leading-relaxed">
        {isAdmin
          ? "Ajoutez votre premier article : prix en FCFA, description et galerie photo."
          : "Les premiers articles arrivent très bientôt. Créez votre compte pour être prévenu."}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {isAdmin && (
          <button
            id="btn-empty-add-product"
            onClick={onAddProduct}
            className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-onyx-950 text-xs font-bold rounded-xl shadow-lg shadow-gold-500/20 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter un article
          </button>
        )}
        {!hasUser && (
          <button
            id="btn-empty-login-client"
            onClick={onOpenAuth}
            className="px-5 py-2.5 bg-onyx-800 hover:bg-onyx-700 text-onyx-50 text-xs font-bold rounded-xl border border-onyx-600 transition-colors flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            Créer mon profil client
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-7 pt-6 border-t border-onyx-800 text-[11px] text-onyx-500">
        <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-gold-500" /> Yass & Flooz</span>
        <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-gold-500" /> Multi-photos</span>
        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-gold-500" /> Sécurité 2FA</span>
      </div>
    </motion.div>
  );
};

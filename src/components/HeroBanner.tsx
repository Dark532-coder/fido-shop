import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Truck, Smartphone, ArrowRight, PlayCircle, CheckCircle2, Star } from 'lucide-react';

interface HeroBannerProps {
  onDiscoverClick: () => void;
  onAuthClick: () => void;
  hasUser: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onDiscoverClick, onAuthClick, hasUser }) => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-onyx-800 bg-gradient-to-br from-onyx-900 via-onyx-950 to-onyx-900 p-8 sm:p-12 lg:p-16">
      {/* Halo décoratif */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-gold-600/5 blur-3xl" />
      {/* Motif points */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, #C0982B 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Colonne texte */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/25 text-gold-300 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
            Boutique Officielle · Lomé, Togo
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-onyx-50 leading-[1.1] tracking-tight mb-5"
          >
            La qualité premium,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500">
              livrée chez vous
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-onyx-400 text-sm sm:text-base max-w-md leading-relaxed mb-8"
          >
            Des articles sélectionnés avec soin, payables instantanément par
            Mixx by Yas ou Flooz, avec validation 2FA à chaque commande.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-3 mb-9"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onDiscoverClick}
              className="px-6 py-3.5 bg-gold-500 hover:bg-gold-400 text-onyx-950 text-sm font-bold rounded-2xl shadow-lg shadow-gold-500/20 transition-colors flex items-center gap-2"
            >
              <span>Découvrir la boutique</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {!hasUser && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onAuthClick}
                className="px-6 py-3.5 bg-transparent hover:bg-onyx-800 text-onyx-100 text-sm font-bold rounded-2xl border border-onyx-600 hover:border-onyx-500 transition-colors flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4 text-gold-400" />
                <span>Créer mon compte</span>
              </motion.button>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-onyx-400"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              Paiement 100% sécurisé
            </span>
            <span className="hidden sm:block w-px h-4 bg-onyx-700" />
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-gold-400" />
              Livraison 24-48h
            </span>
            <span className="hidden sm:block w-px h-4 bg-onyx-700" />
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-gold-400" />
              Mixx by Yas & Flooz
            </span>
          </motion.div>
        </div>

        {/* Colonne visuelle : carte de paiement flottante (illustration) */}
        <div className="relative hidden lg:flex justify-center items-center h-full min-h-[320px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute w-64 h-40 rounded-3xl bg-onyx-800/60 border border-onyx-700 shadow-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ y: -6 }}
            className="relative w-72 rounded-3xl bg-onyx-900/90 backdrop-blur-xl border border-gold-500/20 shadow-2xl shadow-black/40 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gold-500 text-onyx-950 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-onyx-50">Mixx by Yas</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Validé
              </span>
            </div>

            <div className="text-[10px] text-onyx-500 mb-1">Commande</div>
            <div className="text-sm font-mono font-bold text-onyx-100 mb-3">CMD-TG-482913</div>

            <div className="flex items-end justify-between border-t border-onyx-700 pt-3">
              <div>
                <div className="text-[10px] text-onyx-500">Montant réglé</div>
                <div className="text-xl font-black text-gold-400">45 000 FCFA</div>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3 h-3 fill-gold-400 text-gold-400" />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

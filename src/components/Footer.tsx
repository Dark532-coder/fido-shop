import React from 'react';
import { ShieldCheck, Smartphone, Truck, Headphones, Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdminAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminAuth }) => {
  const items = [
    { icon: Smartphone, title: 'Yass & Flooz', desc: 'Paiements directs Togo' },
    { icon: ShieldCheck, title: 'Sécurité 2FA', desc: 'Validation SMS cryptée' },
    { icon: Truck, title: 'Livraison Rapide', desc: 'Lomé et tout le Togo' },
    { icon: Headphones, title: 'Support 7j/7', desc: 'Assistance WhatsApp' },
  ];

  return (
    <footer className="bg-onyx-950 text-onyx-500 text-xs border-t border-onyx-800 pt-8 pb-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-onyx-800">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-onyx-50 text-xs">{item.title}</p>
                <p className="text-[11px] text-onyx-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gold-500 flex items-center justify-center text-onyx-950 font-black text-[10px]">
              FS
            </div>
            <span className="font-bold text-onyx-50">Fido's Shop</span>
            <span className="text-onyx-700">|</span>
            <span className="text-onyx-500">© {new Date().getFullYear()} Tous droits réservés</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-footer-admin-login"
              onClick={onOpenAdminAuth}
              className="text-onyx-500 hover:text-gold-400 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Lock className="w-3 h-3" />
              <span>Accès Administrateur</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

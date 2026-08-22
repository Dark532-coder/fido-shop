import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { User } from '../../types';

interface ClientProfileTabProps {
  currentUser: User;
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  preferredPayment: 'yass' | 'flooz';
  setPreferredPayment: (payment: 'yass' | 'flooz') => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  profileSuccessMsg: string | null;
}

export const ClientProfileTab: React.FC<ClientProfileTabProps> = ({
  currentUser,
  name,
  setName,
  phone,
  setPhone,
  preferredPayment,
  setPreferredPayment,
  handleUpdateProfile,
  profileSuccessMsg,
}) => {
  return (
    <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-4">
      <h3 className="text-sm font-bold text-slate-900 mb-2">
        Informations du Profil Client
      </h3>

      {profileSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{profileSuccessMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Nom complet
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Adresse Email
        </label>
        <input
          type="email"
          disabled
          value={currentUser.email}
          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Téléphone Mobile Money (Yass ou Flooz)
        </label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Moyen de paiement favori
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPreferredPayment('yass')}
            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
              preferredPayment === 'yass'
                ? 'border-amber-500 bg-amber-50 text-amber-900'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            T-Money (Yass)
          </button>
          <button
            type="button"
            onClick={() => setPreferredPayment('flooz')}
            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
              preferredPayment === 'flooz'
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Moov Flooz
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          Enregistrer les modifications
        </button>
      </div>
    </form>
  );
};

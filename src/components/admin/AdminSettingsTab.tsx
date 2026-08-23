import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, Mail, Save, ShieldCheck } from 'lucide-react';
import { User } from '../../types';
import { apiUpdateAdminCredentials } from '../../services/api';

interface AdminSettingsTabProps {
  currentUser: User;
  onAdminUpdated: (user: User) => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({ currentUser, onAdminUpdated }) => {
  const [email, setEmail] = useState(currentUser.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmation) {
      setError('La confirmation du nouveau mot de passe ne correspond pas.');
      return;
    }

    setLoading(true);
    try {
      const result = await apiUpdateAdminCredentials({
        currentPassword,
        email,
        newPassword: newPassword || undefined,
      });
      onAdminUpdated(result.user as User);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
      setSuccess('Les identifiants administrateur ont été mis à jour.');
    } catch (err: any) {
      setError(err.message || 'Impossible de mettre à jour les identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-2xl">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-900">Sécurité du compte administrateur</h3>
        <p className="text-xs text-slate-500 mt-1">Modifiez l’adresse email ou le mot de passe utilisés pour accéder à cet espace.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-slate-900">Identifiants de connexion</p>
            <p className="text-[11px] text-slate-500">Le mot de passe actuel est requis pour chaque changement.</p>
          </div>
        </div>

        <label className="block">
          <span className="block text-xs font-semibold text-slate-700 mb-1">Email administrateur</span>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-hidden focus:bg-white focus:border-amber-500" />
          </div>
        </label>

        <label className="block">
          <span className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe actuel</span>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-hidden focus:bg-white focus:border-amber-500" />
          </div>
        </label>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Nouveau mot de passe</span>
            <input type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Laisser vide pour conserver" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-hidden focus:bg-white focus:border-amber-500" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Confirmation</span>
            <input type="password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Confirmer le nouveau mot de passe" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-hidden focus:bg-white focus:border-amber-500" />
          </label>
        </div>

        <button type="submit" disabled={loading} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2">
          <Save className="w-4 h-4" />
          {loading ? 'Mise à jour...' : 'Enregistrer les changements'}
        </button>
      </form>
    </section>
  );
};

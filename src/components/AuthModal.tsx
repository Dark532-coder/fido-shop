import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  Smartphone, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Shield
} from 'lucide-react';
import { User, UserRole } from '../types';
import { getStoredUsers, saveStoredUsers, setCurrentUser } from '../data/mockStorage';
import { isValidTogoPhone, formatPhoneNumber } from '../utils/security';
import { apiLogin, apiRegister } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('client');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [preferredPayment, setPreferredPayment] = useState<'yass' | 'flooz'>('yass');

  // 2FA / OTP Step
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await apiLogin({ email: email.trim().toLowerCase(), password });
      
      if (user.twoFactorEnabled) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setPendingUser(user);
        setStep('otp');
      } else {
        setCurrentUser(user);
        onSuccess(user);
        onClose();
      }
      setLoading(false);
    } catch (err: any) {
      const isApiUnavailable = err instanceof TypeError || err?.message === 'Erreur réseau.';
      if (!isApiUnavailable) {
        setError(err?.message || 'Email ou mot de passe incorrect.');
        setLoading(false);
        return;
      }

      const users = getStoredUsers();
      const trimmedEmail = email.trim().toLowerCase();
      
      const found = users.find(
        (u) => (u.email.toLowerCase() === trimmedEmail || u.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''))
      );

      if (!found) {
        setError('Aucun compte trouvé avec cet email ou téléphone. Veuillez créer un compte.');
        setLoading(false);
        return;
      }

      if (found.role === 'admin') {
        setError('Le serveur est indisponible. La connexion administrateur nécessite le serveur sécurisé.');
        setLoading(false);
        return;
      }

      if (found.password && found.password !== password) {
        setError('Mot de passe incorrect.');
        setLoading(false);
        return;
      }

      if (found.twoFactorEnabled) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setPendingUser(found);
        setStep('otp');
      } else {
        setCurrentUser(found);
        onSuccess(found);
        onClose();
      }
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Veuillez entrer votre nom complet.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez renseigner une adresse email valide.');
      return;
    }

    if (!phone.trim() || !isValidTogoPhone(phone)) {
      setError('Veuillez renseigner un numéro de téléphone valide (ex: 90 12 34 56 ou 97 00 00 00).');
      return;
    }

    if (password.length < 4) {
      setError('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    setLoading(true);

    try {
      const { user } = await apiRegister({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });
      setCurrentUser(user);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      const users = getStoredUsers();
      const trimmedEmail = email.trim().toLowerCase();

      if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
        setError('Un compte existe déjà avec cette adresse email.');
        setLoading(false);
        return;
      }

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: trimmedEmail,
        phone: phone.trim(),
        role: 'client',
        password: password,
        addresses: [
          {
            id: `addr-${Date.now()}`,
            label: 'Adresse Principale',
            fullName: name.trim(),
            phone: phone.trim(),
            city: 'Lomé',
            district: 'Centre-ville',
            addressDetails: 'Quartier résidentiel',
            isDefault: true,
          },
        ],
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        preferredPaymentMethod: preferredPayment,
      };

      users.push(newUser);
      saveStoredUsers(users);
      setCurrentUser(newUser);
      onSuccess(newUser);
      onClose();
    }
    setLoading(false);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;

    if (otpInput.trim() === generatedOtp) {
      setCurrentUser(pendingUser);
      onSuccess(pendingUser);
      onClose();
    } else {
      setError('Code de validation incorrect. Veuillez réessayer.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx-950/70 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose} role="dialog" aria-modal="true" aria-label={mode === 'login' ? 'Connexion' : 'Création de compte'}>
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gold-500/20 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-onyx-950 via-onyx-900 to-onyx-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {step === 'otp'
                  ? 'Authentification Forte (2FA)'
                  : mode === 'login'
                  ? 'Connexion Sécurisée'
                  : 'Créer votre Profil Client'}
              </h2>
              <p className="text-xs text-slate-300">
                {step === 'otp'
                  ? 'Validation par code de sécurité mobile'
                  : 'Accédez à vos commandes et transactions Mixx by Yas & Fozz'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'otp' ? (
            /* OTP 2FA STEP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  Code de sécurité envoyé par SMS
                </div>
                <p className="text-slate-700">
                  Un code à 6 chiffres a été généré pour le numéro{' '}
                  <strong className="font-mono text-slate-900">{formatPhoneNumber(pendingUser?.phone || phone)}</strong>.
                </p>
                <div className="mt-2 p-2 bg-white rounded-lg border border-amber-300 font-mono text-center text-sm font-bold text-amber-800 tracking-widest">
                  Code test : {generatedOtp}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Saisissez le code de validation (6 chiffres)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 849201"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-base font-bold tracking-widest focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  ← Retour au formulaire
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 transition-colors flex items-center gap-1.5"
                >
                  <span>Valider et Accéder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            /* REGULAR FORM (LOGIN / REGISTER) */
            <div>
              {/* Tab Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Nouveau compte
                </button>
              </div>

              <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3.5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nom complet
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Jean Kodjo"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Numéro Téléphone (Mixx by Yas ou Fozz)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: 90 12 34 56 ou 97 00 00 00"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Utilisé pour la validation sécurisée des paiements et des commandes
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Mot de passe
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Moyen de paiement mobile favori
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPreferredPayment('yass')}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                          preferredPayment === 'yass'
                            ? 'border-amber-500 bg-amber-50 text-amber-900'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        Mixx by Yas
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreferredPayment('flooz')}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                          preferredPayment === 'flooz'
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        Fozz
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    id="btn-auth-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="animate-pulse">Vérification en cours...</span>
                    ) : (
                      <>
                        <span>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

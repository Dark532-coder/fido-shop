import React, { useState } from 'react';
import { 
  Package, 
  User as UserIcon, 
  ShieldCheck, 
  MapPin, 
  Smartphone, 
  Lock
} from 'lucide-react';
import { User, Order, Transaction, UserAddress } from '../types';
import { formatPhoneNumber } from '../utils/security';
import { 
  getStoredOrders, 
  getStoredTransactions, 
  saveStoredUsers, 
  getStoredUsers, 
  setCurrentUser 
} from '../data/mockStorage';
import { apiGetOrders, apiGetTransactions } from '../services/api';

import { ClientOrdersTab } from './client/ClientOrdersTab';
import { ClientTransactionsTab } from './client/ClientTransactionsTab';
import { ClientProfileTab } from './client/ClientProfileTab';
import { ClientAddressesTab } from './client/ClientAddressesTab';

interface ClientDashboardProps {
  currentUser: User;
  initialTab?: string;
  onClose: () => void;
  onViewReceipt: (transaction: Transaction, order: Order) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  currentUser,
  initialTab = 'orders',
  onClose,
  onViewReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions' | 'profile' | 'addresses' | 'security'>(
    (initialTab as any) || 'orders'
  );

  // Profile Form state
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [preferredPayment, setPreferredPayment] = useState<'yass' | 'flooz'>(
    currentUser.preferredPaymentMethod || 'yass'
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser.twoFactorEnabled);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Orders and transactions
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [orders, transactions] = await Promise.all([
          apiGetOrders(),
          apiGetTransactions()
        ]);
        setAllOrders(orders.filter((o: Order) => o.userId === currentUser.id || o.userEmail === currentUser.email));
        setAllTransactions(transactions.filter((t: Transaction) => t.userId === currentUser.id));
      } catch (err) {
        console.warn('API error, falling back to local storage', err);
        setAllOrders(getStoredOrders().filter((o) => o.userId === currentUser.id || o.userEmail === currentUser.email));
        setAllTransactions(getStoredTransactions().filter((t) => t.userId === currentUser.id));
      }
    };
    fetchData();
  }, [currentUser]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getStoredUsers();
    const updated = users.map((u) => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          name: name.trim(),
          phone: phone.trim(),
          preferredPaymentMethod: preferredPayment,
          twoFactorEnabled,
        };
      }
      return u;
    });

    saveStoredUsers(updated);
    const updatedUser = updated.find((u) => u.id === currentUser.id) || null;
    setCurrentUser(updatedUser);
    setProfileSuccessMsg('Vos informations ont été mises à jour avec succès.');
    setTimeout(() => setProfileSuccessMsg(null), 3000);
  };

  const handleAddAddress = (
    e: React.FormEvent,
    addrData: { label: string; city: string; district: string; details: string },
    resetForm: () => void
  ) => {
    e.preventDefault();
    if (!addrData.district.trim()) return;

    const newAddr: UserAddress = {
      id: `addr-${Date.now()}`,
      label: addrData.label,
      fullName: name,
      phone: phone,
      city: addrData.city,
      district: addrData.district.trim(),
      addressDetails: addrData.details.trim() || 'Près du grand carrefour',
      isDefault: currentUser.addresses.length === 0,
    };

    const users = getStoredUsers();
    const updated = users.map((u) => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          addresses: [...u.addresses, newAddr],
        };
      }
      return u;
    });

    saveStoredUsers(updated);
    const updatedUser = updated.find((u) => u.id === currentUser.id) || null;
    setCurrentUser(updatedUser);
    resetForm();
  };

  const handleDeleteAddress = (addressId: string) => {
    const users = getStoredUsers();
    const updated = users.map((u) => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          addresses: u.addresses.filter((a) => a.id !== addressId),
        };
      }
      return u;
    });

    saveStoredUsers(updated);
    const updatedUser = updated.find((u) => u.id === currentUser.id) || null;
    setCurrentUser(updatedUser);
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx-950/70 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose} role="dialog" aria-modal="true" aria-label="Espace Client">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gold-500/20 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 text-amber-400 font-black text-sm flex items-center justify-center shadow-xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{currentUser.name}</h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                  Espace Client
                </span>
              </div>
              <p className="text-xs text-slate-400">{currentUser.email} • {formatPhoneNumber(currentUser.phone)}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Fermer
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 overflow-x-auto">
          <button
            id="tab-client-orders"
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'orders'
                ? 'border-amber-600 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Mes Commandes ({allOrders.length})</span>
          </button>

          <button
            id="tab-client-transactions"
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'transactions'
                ? 'border-amber-600 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Historique Mobile Money ({allTransactions.length})</span>
          </button>

          <button
            id="tab-client-profile"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'profile'
                ? 'border-amber-600 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Mon Profil</span>
          </button>

          <button
            id="tab-client-addresses"
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'addresses'
                ? 'border-amber-600 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Adresses de Livraison</span>
          </button>

          <button
            id="tab-client-security"
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'security'
                ? 'border-amber-600 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sécurité 2FA</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          
          {/* ================= TAB 1: ORDERS ================= */}
          {activeTab === 'orders' && (
            <ClientOrdersTab 
              allOrders={allOrders} 
              allTransactions={allTransactions} 
              onViewReceipt={onViewReceipt} 
            />
          )}

          {/* ================= TAB 2: TRANSACTIONS ================= */}
          {activeTab === 'transactions' && (
            <ClientTransactionsTab 
              allOrders={allOrders} 
              allTransactions={allTransactions} 
              onViewReceipt={onViewReceipt} 
            />
          )}

          {/* ================= TAB 3: PROFILE ================= */}
          {activeTab === 'profile' && (
            <ClientProfileTab 
              currentUser={currentUser}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              preferredPayment={preferredPayment}
              setPreferredPayment={setPreferredPayment}
              handleUpdateProfile={handleUpdateProfile}
              profileSuccessMsg={profileSuccessMsg}
            />
          )}

          {/* ================= TAB 4: ADDRESSES ================= */}
          {activeTab === 'addresses' && (
            <ClientAddressesTab 
              currentUser={currentUser}
              handleAddAddress={handleAddAddress}
              handleDeleteAddress={handleDeleteAddress}
            />
          )}

          {/* ================= TAB 5: SECURITY & 2FA ================= */}
          {activeTab === 'security' && (
            <div className="max-w-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Sécurité & Authentification Forte
              </h3>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Double Authentification (2FA) Activée
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Chaque connexion et chaque transaction Mobile Money (Mixx by Yas ou Fozz) requiert une validation par code de sécurité à usage unique (OTP).
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Validation 2FA par SMS / USSD</h4>
                    <p className="text-[11px] text-slate-500">
                      Recommandé pour sécuriser vos paiements Mobile Money
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Protection des Transactions
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Toutes les transactions sont signées électroniquement avec un hachage SHA-256 et horodatées selon les normes de l'UEMOA pour les services financiers mobiles.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

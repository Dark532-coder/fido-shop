import React, { useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { User } from '../../types';

interface ClientAddressesTabProps {
  currentUser: User;
  handleAddAddress: (
    e: React.FormEvent,
    addrData: { label: string; city: string; district: string; details: string },
    resetForm: () => void
  ) => void;
  handleDeleteAddress: (addressId: string) => void;
}

export const ClientAddressesTab: React.FC<ClientAddressesTabProps> = ({
  currentUser,
  handleAddAddress,
  handleDeleteAddress,
}) => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Domicile');
  const [newAddrCity, setNewAddrCity] = useState('Lomé');
  const [newAddrDistrict, setNewAddrDistrict] = useState('');
  const [newAddrDetails, setNewAddrDetails] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    handleAddAddress(
      e,
      {
        label: newAddrLabel,
        city: newAddrCity,
        district: newAddrDistrict,
        details: newAddrDetails,
      },
      () => {
        setShowAddressForm(false);
        setNewAddrDistrict('');
        setNewAddrDetails('');
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-900">
          Adresses de Livraison Enregistrées
        </h3>
        <button
          type="button"
          onClick={() => setShowAddressForm(!showAddressForm)}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter une adresse</span>
        </button>
      </div>

      {showAddressForm && (
        <form onSubmit={onSubmit} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
          <h4 className="text-xs font-bold text-amber-900">Nouvelle adresse de livraison</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Libellé</label>
              <input
                type="text"
                value={newAddrLabel}
                onChange={(e) => setNewAddrLabel(e.target.value)}
                placeholder="Ex: Domicile, Bureau..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ville</label>
              <input
                type="text"
                value={newAddrCity}
                onChange={(e) => setNewAddrCity(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Quartier *</label>
              <input
                type="text"
                required
                value={newAddrDistrict}
                onChange={(e) => setNewAddrDistrict(e.target.value)}
                placeholder="Ex: Agoè, Nyékonakpoè..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Repères / Détails</label>
            <input
              type="text"
              value={newAddrDetails}
              onChange={(e) => setNewAddrDetails(e.target.value)}
              placeholder="Ex: Face à la pharmacie, portail blanc"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddressForm(false)}
              className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentUser.addresses.map((addr) => (
          <div key={addr.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Par défaut
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-800">{addr.district}, {addr.city}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{addr.addressDetails}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">{addr.phone}</p>
            </div>

            <div className="pt-3 mt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => handleDeleteAddress(addr.id)}
                className="text-slate-400 hover:text-red-600 text-xs flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

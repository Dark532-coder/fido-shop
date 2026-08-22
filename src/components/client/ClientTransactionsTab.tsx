import React from 'react';
import { Smartphone, CheckCircle2, Receipt } from 'lucide-react';
import { Order, Transaction } from '../../types';
import { formatFCFA, formatDateFr, formatPhoneNumber } from '../../utils/security';

interface ClientTransactionsTabProps {
  allOrders: Order[];
  allTransactions: Transaction[];
  onViewReceipt: (transaction: Transaction, order: Order) => void;
}

export const ClientTransactionsTab: React.FC<ClientTransactionsTabProps> = ({
  allOrders,
  allTransactions,
  onViewReceipt,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-900">
          Journal complet des paiements Mobile Money
        </h3>
        <span className="text-xs text-slate-500">
          Chiffrement & Signature SHA-256 certifiés
        </span>
      </div>

      {allTransactions.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200">
          <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-800">Aucune transaction trouvée</h4>
          <p className="text-xs text-slate-500 mt-1">
            Vos reçus de paiement T-Money (Yass) et Moov Flooz seront archivés ici.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3">Réf. Opérateur</th>
                <th className="p-3">Moyen</th>
                <th className="p-3">Numéro débité</th>
                <th className="p-3">Montant Net</th>
                <th className="p-3">Date & Heure</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allTransactions.map((trx) => {
                const relatedOrder = allOrders.find((o) => o.id === trx.orderId || o.orderNumber === trx.orderNumber);
                return (
                  <tr key={trx.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{trx.operatorRef}</td>
                    <td className="p-3">
                      {trx.paymentMethod === 'yass' ? (
                        <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                          T-MONEY (YASS)
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">
                          MOOV FLOOZ
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono">{formatPhoneNumber(trx.payerPhone)}</td>
                    <td className="p-3 font-extrabold text-amber-600">{formatFCFA(trx.amount)}</td>
                    <td className="p-3 text-slate-500">{formatDateFr(trx.timestamp)}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" />
                        Succès
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (relatedOrder) {
                            onViewReceipt(trx, relatedOrder);
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Receipt className="w-3 h-3 text-amber-600" />
                        Reçu
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Download, Smartphone, ShieldCheck, Receipt } from 'lucide-react';
import { Transaction, Order } from '../../types';
import { formatFCFA, formatDateFr, formatPhoneNumber } from '../../utils/security';

interface AdminTransactionsTabProps {
  transactions: Transaction[];
  orders: Order[];
  handleExportCSV: () => void;
  onViewReceipt: (transaction: Transaction, order: Order) => void;
}

export const AdminTransactionsTab: React.FC<AdminTransactionsTabProps> = ({
  transactions,
  orders,
  handleExportCSV,
  onViewReceipt
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-xs font-bold text-slate-900">
            Registre Général des Transactions Mobile Money
          </h3>
          <p className="text-[11px] text-slate-500">
            Audit cryptographique des règlements Mixx by Yas et Fozz
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
          <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-800">Aucune transaction enregistrée</h4>
          <p className="text-xs text-slate-500 mt-1">
            Toutes les transactions effectuées via Mixx by Yas ou Fozz seront répertoriées avec leur empreinte SHA-256.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3">Réf. Opérateur</th>
                  <th className="p-3">Moyen</th>
                  <th className="p-3">Client & Téléphone</th>
                  <th className="p-3">Montant Net</th>
                  <th className="p-3">Date & Heure</th>
                  <th className="p-3">Validation 2FA</th>
                  <th className="p-3">Empreinte SHA-256</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((trx) => {
                  const relatedOrder = orders.find((o) => o.id === trx.orderId || o.orderNumber === trx.orderNumber);
                  return (
                    <tr key={trx.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{trx.operatorRef}</td>
                      <td className="p-3">
                        {trx.paymentMethod === 'yass' ? (
                          <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                            MIXX BY YAS
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">
                            FOZZ
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900 block">{trx.userName}</span>
                        <span className="font-mono text-[10px] text-slate-500">{formatPhoneNumber(trx.payerPhone)}</span>
                      </td>
                      <td className="p-3 font-extrabold text-amber-600 text-sm">
                        {formatFCFA(trx.amount)}
                      </td>
                      <td className="p-3 text-slate-500">{formatDateFr(trx.timestamp)}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          2FA Validé
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-400 max-w-[120px] truncate" title={trx.securityHash}>
                        {trx.securityHash}
                      </td>
                      <td className="p-3 text-right">
                        {relatedOrder && (
                          <button
                            type="button"
                            onClick={() => onViewReceipt(trx, relatedOrder)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3 text-amber-600" />
                            Reçu
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Package, MapPin, Receipt } from 'lucide-react';
import { Order, Transaction } from '../../types';
import { formatFCFA, formatDateFr } from '../../utils/security';

interface ClientOrdersTabProps {
  allOrders: Order[];
  allTransactions: Transaction[];
  onViewReceipt: (transaction: Transaction, order: Order) => void;
}

export const ClientOrdersTab: React.FC<ClientOrdersTabProps> = ({
  allOrders,
  allTransactions,
  onViewReceipt,
}) => {
  const getOrderStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'paye':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Payé</span>;
      case 'en_preparation':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full">En préparation</span>;
      case 'expedie':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Expédié / En cours de livraison</span>;
      case 'livre':
        return <span className="bg-green-100 text-green-900 text-[11px] font-bold px-2 py-0.5 rounded-full">Livré</span>;
      case 'annule':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Annulé</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">En attente</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-900">
          Suivi de vos commandes
        </h3>
        <span className="text-xs text-slate-500">
          Paiements sécurisés par Yass & Flooz
        </span>
      </div>

      {allOrders.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-800">Aucune commande enregistrée</h4>
          <p className="text-xs text-slate-500 mt-1">
            Vos commandes payées par T-Money ou Flooz apparaîtront ici avec leur suivi en direct.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allOrders.map((order) => {
            const relatedTrx = allTransactions.find((t) => t.orderId === order.id || t.orderNumber === order.orderNumber);
            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {order.orderNumber}
                      </span>
                      {getOrderStatusBadge(order.orderStatus)}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Commandé le {formatDateFr(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-amber-600">
                      {formatFCFA(order.total)}
                    </span>
                    {relatedTrx && (
                      <button
                        type="button"
                        onClick={() => onViewReceipt(relatedTrx, order)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5 text-amber-600" />
                        <span>Voir Reçu Fiscal</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.productName}</p>
                        <p className="text-[10px] text-slate-500">
                          {item.quantity} x {formatFCFA(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery & Payment Badges */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Livraison à {order.shippingAddress.district}, {order.shippingAddress.city}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400">Paiement :</span>
                    <span className="font-bold text-slate-800">
                      {order.paymentMethod === 'yass' ? 'T-Money (Yass)' : 'Moov Flooz'}
                    </span>
                    <span className="text-slate-400">({order.operatorRef})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

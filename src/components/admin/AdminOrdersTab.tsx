import React from 'react';
import { ShoppingBag, Receipt } from 'lucide-react';
import { Order, Transaction, OrderStatus } from '../../types';
import { formatFCFA, formatDateFr, formatPhoneNumber } from '../../utils/security';

interface AdminOrdersTabProps {
  orders: Order[];
  transactions: Transaction[];
  orderFilterStatus: string;
  setOrderFilterStatus: (val: string) => void;
  handleUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onViewReceipt: (transaction: Transaction, order: Order) => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  transactions,
  orderFilterStatus,
  setOrderFilterStatus,
  handleUpdateOrderStatus,
  onViewReceipt
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900">
          Commandes reçues ({orders.length})
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filtrer statut :</span>
          <select
            value={orderFilterStatus}
            onChange={(e) => setOrderFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          >
            <option value="all">Tous les statuts</option>
            <option value="paye">Payé</option>
            <option value="en_preparation">En préparation</option>
            <option value="expedie">Expédié</option>
            <option value="livre">Livré</option>
            <option value="annule">Annulé</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-800">Aucune commande pour le moment</h4>
          <p className="text-xs text-slate-500 mt-1">
            Les commandes passées par vos clients via Mixx by Yas ou Flooz apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders
            .filter((o) => orderFilterStatus === 'all' || o.orderStatus === orderFilterStatus)
            .map((order) => {
              const relatedTrx = transactions.find((t) => t.orderId === order.id || t.orderNumber === order.orderNumber);
              return (
                <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                        <span className="text-xs text-slate-500">• {formatDateFr(order.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-semibold mt-0.5">
                        Client: {order.userName} ({formatPhoneNumber(order.userPhone)}) • {order.userEmail}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-amber-600">{formatFCFA(order.total)}</span>
                      {relatedTrx && (
                        <button
                          type="button"
                          onClick={() => onViewReceipt(relatedTrx, order)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5 text-amber-600" />
                          <span>Reçu</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items and Address details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-800">Articles commandés :</h5>
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between bg-slate-50 p-2 rounded-xl">
                            <span className="font-medium text-slate-800">{item.productName} (x{item.quantity})</span>
                            <span className="font-bold text-slate-900">{formatFCFA(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-800">Livraison & Paiement :</h5>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-600">
                        <p><strong>Lieu :</strong> {order.shippingAddress.district}, {order.shippingAddress.city}</p>
                        <p><strong>Détails :</strong> {order.shippingAddress.addressDetails}</p>
                        <p>
                          <strong>Mode :</strong> {order.paymentMethod === 'yass' ? 'Mixx by Yas' : 'Flooz'}
                          <span className="font-mono font-bold text-slate-800 ml-1">({order.operatorRef})</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status changer bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Mettre à jour le statut :</span>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="px-3 py-1.5 bg-amber-50 border border-amber-300 font-bold rounded-xl text-xs text-amber-900 outline-hidden"
                      >
                        <option value="paye">1. Payé (Confirmé)</option>
                        <option value="en_preparation">2. En préparation</option>
                        <option value="expedie">3. Expédié / En livraison</option>
                        <option value="livre">4. Livré au client</option>
                        <option value="annule">Annuler la commande</option>
                      </select>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      Trx ID: {order.transactionId}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

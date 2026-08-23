import React from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  QrCode, 
  Smartphone, 
  Building,
  Copy,
  Check
} from 'lucide-react';
import { Transaction, Order } from '../types';
import { formatFCFA, formatDateFr, formatPhoneNumber } from '../utils/security';

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  order: Order | null;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  order,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(transaction.securityHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-onyx-950/70 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose} role="dialog" aria-modal="true" aria-label="Reçu de transaction">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gold-500/20 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">Bordereau de Règlement Électronique</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-900 text-xs space-y-6 print:p-0">
          
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl mb-2 shadow-xs">
              FS
            </div>
            <h2 className="text-base font-black tracking-tight text-slate-900">
              Fido's Shop
            </h2>
            <p className="text-[11px] text-slate-500">
              Paiement Sécurisé Mobile Money (Mixx by Yas / Flooz)
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Agrément Établissement Financier UEMOA / Togo
            </p>
          </div>

          {/* Status Stamp */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-emerald-900 block text-xs">
                  Paiement 100% Validé & Conforme
                </span>
                <span className="text-[10px] text-emerald-700">
                  Transaction garantie par authentification forte 2FA
                </span>
              </div>
            </div>
            <span className="font-mono font-black text-emerald-900 text-xs bg-emerald-100 px-2 py-1 rounded">
              SUCCÈS
            </span>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-slate-400 block">Réf. Opérateur</span>
              <strong className="font-mono text-slate-900 text-xs">{transaction.operatorRef}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Commande N°</span>
              <strong className="font-mono text-slate-900 text-xs">{transaction.orderNumber}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Moyen de Paiement</span>
              <strong className="text-slate-900">
                {transaction.paymentMethod === 'yass' ? 'Mixx by Yas Togo' : 'Flooz'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Numéro Débité</span>
              <strong className="font-mono text-slate-900">{formatPhoneNumber(transaction.payerPhone)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Date & Heure</span>
              <span className="text-slate-800 font-medium">{formatDateFr(transaction.timestamp)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Bénéficiaire</span>
              <span className="text-slate-800 font-medium">Boutique Fido's Shop</span>
            </div>
          </div>

          {/* Ordered items if available */}
          {order && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Détail de la commande
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-2 text-xs">
                    <span>
                      {item.productName} <span className="text-slate-400 font-bold">x{item.quantity}</span>
                    </span>
                    <span className="font-bold text-slate-900">{formatFCFA(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between p-2 bg-slate-50 font-bold">
                  <span>Frais de livraison</span>
                  <span>{order.deliveryFee === 0 ? 'Gratuit' : formatFCFA(order.deliveryFee)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Amount Paid Box */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Montant Total Payé
              </span>
              <span className="text-xs text-slate-300">Toutes taxes comprises (TTC)</span>
            </div>
            <div className="text-xl font-black text-amber-400">
              {formatFCFA(transaction.amount)}
            </div>
          </div>

          {/* Cryptographic Signature Footer */}
          <div className="border-t border-slate-200 pt-4 space-y-2 text-[10px] text-slate-500">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Signature Numérique SHA-256 :</span>
              <button
                onClick={handleCopyHash}
                className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
            <p className="font-mono bg-slate-100 p-2 rounded-lg break-all text-[9px] text-slate-600 border border-slate-200">
              {transaction.securityHash}
            </p>
            <p className="text-center text-[10px] text-slate-400 pt-2">
              Merci pour votre achat sur Fido's Shop. Conservez ce reçu pour la livraison.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

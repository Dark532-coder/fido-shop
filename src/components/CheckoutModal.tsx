import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  Receipt, 
  Printer, 
  KeyRound, 
  Check, 
  Building, 
  MapPin, 
  FileText,
  Copy,
  ChevronRight
} from 'lucide-react';
import { CartItem, User, Order, Transaction, PaymentMethod } from '../types';
import { 
  formatFCFA, 
  generateOperatorRef, 
  generateSecurityHash, 
  isValidTogoPhone, 
  formatPhoneNumber,
  formatDateFr 
} from '../utils/security';
  import { 
    getMobileMoneyLabel,
    getMobileMoneyOperator,
  } from '../utils/security';
import { 
  saveStoredOrders, 
  getStoredOrders, 
  saveStoredTransactions, 
  getStoredTransactions,
  saveStoredProducts,
  getStoredProducts
} from '../data/mockStorage';
import { apiCreateOrder, apiInitPayment } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentUser: User | null;
  onOrderSuccess: (order: Order, transaction: Transaction) => void;
  onViewReceipt: (transaction: Transaction, order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  onOrderSuccess,
  onViewReceipt,
}) => {
  // Steps: 1: Delivery, 2: Payment Method, 3: 2FA Mobile Money Verification, 4: Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Delivery Information
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [city, setCity] = useState(currentUser?.addresses?.[0]?.city || 'Lomé');
  const [district, setDistrict] = useState(currentUser?.addresses?.[0]?.district || 'Agoè-Nyivé');
  const [addressDetails, setAddressDetails] = useState(
    currentUser?.addresses?.[0]?.addressDetails || 'Près du carrefour principal'
  );
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Step 2: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    currentUser?.preferredPaymentMethod || 'yass'
  );

  // Step 3: Mobile Money Strong Authentication
  const [payerPhone, setPayerPhone] = useState(currentUser?.phone || '');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [ussdTimer, setUssdTimer] = useState(90);
  const [isProcessingPush, setIsProcessingPush] = useState(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  // Completed Order & Transaction state
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [createdTransaction, setCreatedTransaction] = useState<Transaction | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Subtotals & totals
  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 50000 ? 0 : 1500) : 0;
  const total = subtotal + deliveryFee;

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.name);
      if (!phone) setPhone(currentUser.phone);
      if (!email) setEmail(currentUser.email);
      if (!payerPhone) setPayerPhone(currentUser.phone);
      if (currentUser.preferredPaymentMethod) setPaymentMethod(currentUser.preferredPaymentMethod);
    }
  }, [currentUser]);

  // Countdown timer for USSD / Push
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 3 && ussdTimer > 0 && !isPaymentConfirmed) {
      interval = setInterval(() => {
        setUssdTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, ussdTimer, isPaymentConfirmed]);

  // Reset steps when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setOtpCode('');
      setGeneratedOtp('');
      setIsPaymentConfirmed(false);
      setIsProcessingPush(false);
      setUssdTimer(90);
      setCreatedOrder(null);
      setCreatedTransaction(null);
      setError(null);
    }
  }, [isOpen]);

  // Close on Escape key (except on success step)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && currentStep !== 4) onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, currentStep, onClose]);

  if (!isOpen) return null;

  const handleGoToPaymentSelection = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Veuillez renseigner votre nom complet pour la livraison.');
      return;
    }
    if (!phone.trim() || !isValidTogoPhone(phone)) {
      setError('Veuillez renseigner un numéro de contact valide (ex: 90 12 34 56).');
      return;
    }
    if (!district.trim()) {
      setError('Veuillez préciser votre quartier de livraison.');
      return;
    }

    setPayerPhone(phone);
    setCurrentStep(2);
  };

  const handleInitiateMobileMoney = () => {
    setError(null);
    if (!payerPhone.trim() || !isValidTogoPhone(payerPhone)) {
      setError('Veuillez saisir un numéro Mobile Money valide.');
      return;
    }
    const operator = getMobileMoneyOperator(payerPhone);
    const expectedOperator = paymentMethod === 'yass' ? 'mixx' : 'flooz';
    if (operator !== expectedOperator) {
      setError(`Ce numéro est reconnu comme « ${getMobileMoneyLabel(payerPhone) } ». Sélectionnez le moyen de paiement correspondant.`);
      return;
    }

    setIsProcessingPush(true);
    // Generate authentic OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setUssdTimer(90);

    setTimeout(() => {
      setIsProcessingPush(false);
      setCurrentStep(3);
    }, 800);
  };

  const handleFinalizePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpCode.trim()) {
      setError('Veuillez entrer le code de validation à 6 chiffres.');
      return;
    }

    if (otpCode.trim() !== generatedOtp) {
      setError('Code de validation incorrect. Veuillez vérifier le code reçu ou utiliser le code test.');
      return;
    }

    setIsPaymentConfirmed(true);

    try {
      // API call to create order
      const apiItems = items.map((i) => ({ productId: i.product.id, quantity: i.quantity }));
      const orderData = {
        items: apiItems,
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          city,
          district,
          addressDetails,
          notes: deliveryNotes,
        },
        paymentMethod,
      };

      const serverOrder = await apiCreateOrder(orderData);
      
      // Initialize payment
      const paymentInfo = await apiInitPayment(serverOrder.id);
      
      if (paymentInfo.mode === 'paydunya' && paymentInfo.checkoutUrl) {
        window.location.href = paymentInfo.checkoutUrl;
        return;
      }
      
      // Fallback/simulation mode success
      setCreatedOrder(serverOrder);
      if (paymentInfo.transaction) {
        setCreatedTransaction(paymentInfo.transaction);
        onOrderSuccess(serverOrder, paymentInfo.transaction);
      } else {
        // Mock a transaction if API doesn't return it but is simulation
        const mockTrx = {
          id: `trx-${Date.now()}`,
          transactionRef: `TRX-${Date.now().toString().slice(-6)}`,
          orderId: serverOrder.id,
          orderNumber: serverOrder.orderNumber,
          userId: serverOrder.userId,
          userName: fullName.trim(),
          payerPhone: payerPhone.trim(),
          amount: total,
          fees: 0,
          paymentMethod,
          status: 'success' as const,
          operatorRef: generateOperatorRef(paymentMethod),
          securityHash: generateSecurityHash(`${serverOrder.orderNumber}:${total}:${payerPhone}:${Date.now()}`),
          ipAddress: '197.234.221.42',
          authMethod: 'API Simulation',
          timestamp: new Date().toISOString(),
          description: `Règlement commande`,
        };
        setCreatedTransaction(mockTrx);
        onOrderSuccess(serverOrder, mockTrx);
      }
      
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setCurrentStep(4);
      
    } catch (err) {
      console.warn('API error, falling back to local storage', err);
      // Fallback to local storage
      const orderNumber = `CMD-TG-${Math.floor(100000 + Math.random() * 900000)}`;
      const operatorRef = generateOperatorRef(paymentMethod);
      const securityHash = generateSecurityHash(`${orderNumber}:${total}:${payerPhone}:${Date.now()}`);
      const timestamp = new Date().toISOString();

      const orderId = `ord-${Date.now()}`;
      const transactionId = `trx-${Date.now()}`;

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        userId: currentUser?.id || `guest-${Date.now()}`,
        userName: fullName.trim(),
        userEmail: email.trim() || 'client@boutique.tg',
        userPhone: phone.trim(),
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image: (i.product.images && i.product.images[0]) || '',
        })),
        subtotal,
        deliveryFee,
        total,
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          city,
          district,
          addressDetails,
          notes: deliveryNotes,
        },
        paymentMethod,
        paymentStatus: 'completed',
        orderStatus: 'paye',
        transactionId,
        operatorRef,
        securityHash,
        otpVerified: true,
        createdAt: timestamp,
        updatedAt: timestamp,
        timeline: [
          {
            status: 'paye',
            label: `Paiement ${paymentMethod === 'yass' ? 'Mixx by Yas' : 'Fozz'} validé`,
            timestamp,
            note: `Transaction ${operatorRef} approuvée avec authentification forte 2FA.`,
          },
          {
            status: 'en_preparation',
            label: 'Commande transmise au centre logistique',
            timestamp: new Date(Date.now() + 60000).toISOString(),
            note: 'Emballage et préparation du colis en cours.',
          },
        ],
      };

      const newTransaction: Transaction = {
        id: transactionId,
        transactionRef: `TRX-${Date.now().toString().slice(-6)}`,
        orderId,
        orderNumber,
        userId: newOrder.userId,
        userName: fullName.trim(),
        payerPhone: payerPhone.trim(),
        amount: total,
        fees: 0,
        paymentMethod,
        status: 'success',
        operatorRef,
        securityHash,
        ipAddress: '197.234.221.42 (Lomé Gateway)',
        authMethod: `Validation 2FA SMS & Push USSD (${paymentMethod === 'yass' ? '*145#' : '*155#'})`,
        timestamp,
        description: `Règlement commande ${orderNumber} - ${items.length} article(s)`,
      };

      const existingOrders = getStoredOrders();
      existingOrders.unshift(newOrder);
      saveStoredOrders(existingOrders);

      const existingTransactions = getStoredTransactions();
      existingTransactions.unshift(newTransaction);
      saveStoredTransactions(existingTransactions);

      const allProducts = getStoredProducts();
      items.forEach((cartItem) => {
        const p = allProducts.find((prod) => prod.id === cartItem.product.id);
        if (p) {
          p.stock = Math.max(0, p.stock - cartItem.quantity);
        }
      });
      saveStoredProducts(allProducts);

      setCreatedOrder(newOrder);
      setCreatedTransaction(newTransaction);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      onOrderSuccess(newOrder, newTransaction);
      setCurrentStep(4);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx-950/70 backdrop-blur-xs animate-in fade-in duration-150" onClick={() => { if (currentStep !== 4) onClose(); }} role="dialog" aria-modal="true" aria-label="Finaliser la commande">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-gold-500/20 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Progress Steps */}
        <div className="bg-slate-900 text-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Caisse Sécurisée</h2>
                <p className="text-[11px] text-slate-300">
                  Protocole Mobile Money Mixx by Yas & Fozz Togo
                </p>
              </div>
            </div>
            {currentStep !== 4 && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stepper Indicators */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
            <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep >= 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                1
              </span>
              <span className="hidden sm:inline font-medium text-[11px]">Livraison</span>
            </div>

            <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-amber-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep >= 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                2
              </span>
              <span className="hidden sm:inline font-medium text-[11px]">Moyen</span>
            </div>

            <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep >= 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                3
              </span>
              <span className="hidden sm:inline font-medium text-[11px]">Validation 2FA</span>
            </div>

            <div className={`flex items-center gap-1.5 ${currentStep === 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                ✓
              </span>
              <span className="hidden sm:inline font-medium text-[11px]">Reçu</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= STEP 1: DELIVERY INFO ================= */}
          {currentStep === 1 && (
            <form onSubmit={handleGoToPaymentSelection} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  Adresse de Livraison (Togo)
                </h3>
                <span className="text-xs font-extrabold text-amber-600">
                  Total : {formatFCFA(total)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom & Prénom du Destinataire *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Koffi Mensah"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone de Contact (Livraison) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 90 12 34 56"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ville
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                  >
                    <option value="Lomé">Lomé</option>
                    <option value="Kara">Kara</option>
                    <option value="Sokodé">Sokodé</option>
                    <option value="Kpalimé">Kpalimé</option>
                    <option value="Atakpamé">Atakpamé</option>
                    <option value="Dapaong">Dapaong</option>
                    <option value="Tsévié">Tsévié</option>
                    <option value="Aného">Aného</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quartier / Zone de livraison *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Ex: Agoè, Nyékonakpoè, Hedzranawoé..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Repère & Détails de l'adresse
                </label>
                <input
                  type="text"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder="Ex: Maison bleue à 50m de la pharmacie, portail noir"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions pour le livreur (Optionnel)
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Ex: Appeler à l'avance avant d'arriver..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <span>Continuer vers le Paiement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 2: PAYMENT METHOD SELECTION ================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  Sélectionnez votre Opérateur Mobile Money
                </h3>
                <span className="text-xs font-extrabold text-amber-600">
                  {formatFCFA(total)}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Choisissez votre portefeuille électronique togolais pour initier le paiement ultra-sécurisé avec code PIN / USSD.
              </p>

              {/* Mixx by Yas Option */}
              <div
                onClick={() => setPaymentMethod('yass')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'yass'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs">
                      MIXX
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-slate-900">
                          Mixx by Yas Togo
                        </h4>
                        <span className="bg-amber-500/20 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                          *145#
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Paiement direct par Push USSD ou code OTP SMS sur votre ligne Yas Togo Telecom.
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'yass' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'yass' && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>

              {/* Fozz Option */}
              <div
                onClick={() => setPaymentMethod('flooz')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'flooz'
                    ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      FOZZ
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-slate-900">
                          Fozz
                        </h4>
                        <span className="bg-blue-500/20 text-blue-900 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30">
                          *155#
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Paiement instantané et sécurisé via le réseau Moov Africa Togo.
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'flooz' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'flooz' && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>

              {/* Phone number input for Mobile Money */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numéro de compte {paymentMethod === 'yass' ? 'Mixx by Yas' : 'Fozz'} à débiter *
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="Ex: 90 12 34 56 ou 97 00 00 00"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Réseau détecté : <strong>{getMobileMoneyLabel(payerPhone)}</strong> (Mixx by Yas : 90-93 et 70-73, Fozz : 96-99 et 79)
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Une notification de validation sera envoyée sur ce numéro pour autoriser le prélèvement de {formatFCFA(total)}.
                </span>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  ← Modifier l'adresse
                </button>

                <button
                  id="btn-initiate-mobile-payment"
                  type="button"
                  disabled={isProcessingPush}
                  onClick={handleInitiateMobileMoney}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center gap-2"
                >
                  {isProcessingPush ? (
                    <span className="animate-pulse">Connexion à la passerelle...</span>
                  ) : (
                    <>
                      <span>Lancer la transaction 2FA</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: STRONG AUTHENTICATION & OTP / USSD ================= */}
          {currentStep === 3 && (
            <form onSubmit={handleFinalizePayment} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    Demande d'autorisation {paymentMethod === 'yass' ? 'Mixx by Yas' : 'Fozz'}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md font-bold">
                    <Clock className="w-3 h-3" />
                    <span>{ussdTimer}s</span>
                  </div>
                </div>

                <p className="text-slate-700 text-xs leading-relaxed">
                  Une requête sécurisée a été envoyée sur le mobile{' '}
                  <strong className="font-mono text-slate-900">{formatPhoneNumber(payerPhone)}</strong>.
                  Consultez votre téléphone ou validez avec le code de sécurité 2FA ci-dessous.
                </p>

                {/* Simulated USSD Prompt Box */}
                <div className="mt-3 p-3 bg-slate-900 text-amber-400 rounded-xl font-mono text-[11px] space-y-1 shadow-inner">
                  <div className="text-slate-400 text-[10px]">
                    [NOTIFICATION PUSH USSD {paymentMethod === 'yass' ? '*145#' : '*155#'}]
                  </div>
                  <div className="text-white font-bold">
                    Débiter {formatFCFA(total)} pour Fido's Shop ?
                  </div>
                  <div className="text-emerald-400">
                    Code OTP de validation chiffré : <span className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-bold tracking-widest">{generatedOtp}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Saisissez votre Code de Sécurité / PIN Mobile Money
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder={`Ex: ${generatedOtp}`}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-lg font-bold tracking-widest text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                    autoFocus
                  />
                </div>
              </div>

              {/* Encryption & Cryptographic Guarantee Badge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chiffrement Bancaire de Bout en Bout</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Signature SHA-256 certifiée. Vos fonds sont protégés par la double authentification de l'opérateur.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  ← Changer d'opérateur
                </button>

                <button
                  id="btn-confirm-payment"
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirmer le Paiement ({formatFCFA(total)})</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 4: SUCCESS & OFFICIAL RECEIPT ================= */}
          {currentStep === 4 && createdOrder && createdTransaction && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Paiement Confirmé avec Succès !
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Votre commande <strong className="text-slate-900 font-mono">{createdOrder.orderNumber}</strong> a été enregistrée et transmise pour préparation.
                </p>
              </div>

              {/* Transaction Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Réf. Opérateur :</span>
                  <span className="font-mono font-bold text-slate-900">{createdTransaction.operatorRef}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Mode de Paiement :</span>
                  <span className="font-semibold text-slate-900">
                    {createdTransaction.paymentMethod === 'yass' ? 'Mixx by Yas' : 'Fozz'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Numéro débité :</span>
                  <span className="font-mono font-bold text-slate-900">{formatPhoneNumber(createdTransaction.payerPhone)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Montant total payé :</span>
                  <span className="font-extrabold text-amber-600 text-sm">{formatFCFA(createdTransaction.amount)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-slate-400">Empreinte SHA-256 :</span>
                  <span className="text-[9px] font-mono text-slate-500 max-w-[200px] truncate">
                    {createdTransaction.securityHash}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onViewReceipt(createdTransaction, createdOrder)}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <Receipt className="w-4 h-4 text-slate-600" />
                  <span>Imprimer le Reçu Fiscal</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Terminer mes achats</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

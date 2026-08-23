import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  Layers, 
  Image as ImageIcon, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Smartphone, 
  ArrowUpRight, 
  Download, 
  Eye, 
  Upload, 
  X, 
  Filter, 
  Save, 
  TrendingUp, 
  Truck, 
  Clock, 
  ShieldCheck, 
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { Product, Order, Transaction, OrderStatus, PaymentMethod, User } from '../types';
import { CATEGORIES } from '../data/categories';
import { formatFCFA, formatDateFr, formatPhoneNumber } from '../utils/security';
import { 
  getStoredProducts, 
  saveStoredProducts, 
  getStoredOrders, 
  saveStoredOrders, 
  getStoredTransactions 
} from '../data/mockStorage';
import {
  apiGetProducts,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiGetOrders,
  apiUpdateOrderStatus,
  apiGetTransactions
} from '../services/api';
import { AdminProductsTab } from './admin/AdminProductsTab';
import { AdminOrdersTab } from './admin/AdminOrdersTab';
import { AdminTransactionsTab } from './admin/AdminTransactionsTab';
import { AdminStatsTab } from './admin/AdminStatsTab';
import { AdminSettingsTab } from './admin/AdminSettingsTab';

interface AdminDashboardProps {
  initialTab?: string;
  currentUser: User;
  onAdminUpdated: (user: User) => void;
  onClose: () => void;
  onViewReceipt: (transaction: Transaction, order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialTab = 'products',
  currentUser,
  onAdminUpdated,
  onClose,
  onViewReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'transactions' | 'stats' | 'settings'>(
    (initialTab as any) || 'products'
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Search & Filter state
  const [productSearch, setProductSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [trxFilterMethod, setTrxFilterMethod] = useState<string>('all');

  // Product Form Modal state (Create / Edit)
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[1]?.name || 'Mode & Habillement');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const [apiProds, apiOrds, apiTrans] = await Promise.all([
        apiGetProducts(),
        apiGetOrders(),
        apiGetTransactions()
      ]);
      setProducts(apiProds);
      setOrders(apiOrds);
      setTransactions(apiTrans);
    } catch (err) {
      console.warn('API fetch failed, falling back to local storage', err);
      setProducts(getStoredProducts());
      setOrders(getStoredOrders());
      setTransactions(getStoredTransactions());
    }
  };

  React.useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Open Product Form for creating new
  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setFormName('');
    setFormCategory('Mode & Habillement');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormStock('15');
    setFormDescription('');
    setFormImages([]);
    setImageUrlInput('');
    setFormTags('');
    setFormError(null);
    setIsProductFormOpen(true);
  };

  // Open Product Form for editing existing
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(prod.price.toString());
    setFormOriginalPrice(prod.originalPrice ? prod.originalPrice.toString() : '');
    setFormStock(prod.stock.toString());
    setFormDescription(prod.description);
    setFormImages(prod.images || []);
    setImageUrlInput('');
    setFormTags(prod.tags ? prod.tags.join(', ') : '');
    setFormError(null);
    setIsProductFormOpen(true);
  };

  // Handle local image file upload (converts to DataURL)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setFormImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  // Remove photo from list
  const handleRemovePhoto = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Save product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Le nom de l\'article est obligatoire.');
      return;
    }
    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Veuillez renseigner un prix valide supérieur à 0 FCFA.');
      return;
    }

    const stockNum = parseInt(formStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Veuillez renseigner une quantité en stock valide.');
      return;
    }

    const originalPriceNum = formOriginalPrice ? parseFloat(formOriginalPrice) : undefined;
    const tagsArray = formTags
      ? formTags.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    const productData = {
      name: formName.trim(),
      category: formCategory,
      price: priceNum,
      originalPrice: originalPriceNum,
      stock: stockNum,
      description: formDescription.trim(),
      images: formImages.length > 0 ? formImages : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
      tags: tagsArray,
    };

    try {
      if (editingProductId) {
        await apiUpdateProduct(editingProductId, productData);
        showToast('Article modifié avec succès !');
      } else {
        await apiCreateProduct(productData);
        showToast('Nouvel article ajouté au catalogue avec succès !');
      }
      refreshData();
    } catch (err) {
      console.warn('API error, falling back to local storage', err);
      // Fallback
      const currentProds = getStoredProducts();
      const timestamp = new Date().toISOString();

      if (editingProductId) {
        const updated = currentProds.map((p) => {
          if (p.id === editingProductId) {
            return { ...p, ...productData, updatedAt: timestamp };
          }
          return p;
        });
        saveStoredProducts(updated);
        setProducts(updated);
        showToast('Article modifié avec succès (local) !');
      } else {
        const newProduct: Product = {
          id: `prod-${Date.now()}`,
          ...productData,
          featuredImageIndex: 0,
          isActive: true,
          reviews: [],
          averageRating: 5.0,
          reviewsCount: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        currentProds.unshift(newProduct);
        saveStoredProducts(currentProds);
        setProducts(currentProds);
        showToast('Nouvel article ajouté au catalogue avec succès (local) !');
      }
    }

    setIsProductFormOpen(false);
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cet article ?')) return;
    try {
      await apiDeleteProduct(productId);
      showToast('Article supprimé du catalogue.');
      refreshData();
    } catch (err) {
      console.warn('API error, falling back to local storage', err);
      const currentProds = getStoredProducts();
      const filtered = currentProds.filter((p) => p.id !== productId);
      saveStoredProducts(filtered);
      setProducts(filtered);
      showToast('Article supprimé du catalogue (local).');
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiUpdateOrderStatus(orderId, newStatus);
      showToast('Statut de la commande mis à jour.');
      refreshData();
    } catch (err) {
      console.warn('API error, falling back to local storage', err);
      const currentOrders = getStoredOrders();
      const updated = currentOrders.map((o) => {
        if (o.id === orderId) {
          const timestamp = new Date().toISOString();
          let statusLabel = 'Statut mis à jour';
          if (newStatus === 'en_preparation') statusLabel = 'Commande en cours de préparation';
          if (newStatus === 'expedie') statusLabel = 'Colis confié au livreur / Expédié';
          if (newStatus === 'livre') statusLabel = 'Commande livrée au client';
          if (newStatus === 'annule') statusLabel = 'Commande annulée';

          return {
            ...o,
            orderStatus: newStatus,
            updatedAt: timestamp,
            timeline: [
              ...o.timeline,
              {
                status: newStatus,
                label: statusLabel,
                timestamp,
                note: `Statut modifié par l'administrateur.`,
              },
            ],
          };
        }
        return o;
      });

      saveStoredOrders(updated);
      setOrders(updated);
      showToast('Statut de la commande mis à jour (local).');
    }
  };

  // Export Transactions CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Ref_Operateur', 'Methode', 'Client', 'Numero_Debite', 'Montant_FCFA', 'Date', 'Statut', 'Signature_Hash'];
    const rows = transactions.map((t) => [
      t.operatorRef,
      t.paymentMethod === 'yass' ? 'Mixx by Yas' : 'Fozz',
      `"${t.userName}"`,
      t.payerPhone,
      t.amount,
      t.timestamp,
      t.status,
      t.securityHash,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_mobile_money_tg_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats Calculations
  const totalRevenue = transactions.filter((t) => t.status === 'success').reduce((acc, t) => acc + t.amount, 0);
  const totalYassRevenue = transactions.filter((t) => t.status === 'success' && t.paymentMethod === 'yass').reduce((acc, t) => acc + t.amount, 0);
  const totalFloozRevenue = transactions.filter((t) => t.status === 'success' && t.paymentMethod === 'flooz').reduce((acc, t) => acc + t.amount, 0);
  const lowStockCount = products.filter((p) => p.stock <= 3).length;

  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-onyx-950/70 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose} role="dialog" aria-modal="true" aria-label="Tableau de Bord Administrateur">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden border border-gold-500/20 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-slate-950 text-white p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20">
              ADM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Tableau de Bord Administrateur</h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                  Fido's Shop - Mixx by Yas & Fozz
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ajoutez des articles, gérez les prix, descriptions, multi-photos et suivez les paiements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewProduct}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un article</span>
            </button>

            <button
              onClick={onClose}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-5 overflow-x-auto">
          <button
            id="tab-admin-products"
            onClick={() => setActiveTab('products')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'products'
                ? 'border-amber-600 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catalogue & Articles ({products.length})</span>
          </button>

          <button
            id="tab-admin-settings"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'settings'
                ? 'border-amber-600 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sécurité du compte</span>
          </button>

          <button
            id="tab-admin-orders"
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'orders'
                ? 'border-amber-600 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Commandes Clients ({orders.length})</span>
          </button>

          <button
            id="tab-admin-transactions"
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'transactions'
                ? 'border-amber-600 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Journal Paiements Mixx by Yas & Fozz ({transactions.length})</span>
          </button>

          <button
            id="tab-admin-stats"
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'stats'
                ? 'border-amber-600 text-amber-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Rapports & Ventes</span>
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-500 text-white text-xs font-bold py-2 px-4 text-center animate-in fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {/* ================= TAB 1: PRODUCT MANAGEMENT ================= */}
          {activeTab === 'products' && (
            <AdminProductsTab 
              products={products}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              handleOpenNewProduct={handleOpenNewProduct}
              handleOpenEditProduct={handleOpenEditProduct}
              handleDeleteProduct={handleDeleteProduct}
            />
          )}

          {/* ================= TAB 2: ORDERS MANAGEMENT ================= */}
          {activeTab === 'orders' && (
            <AdminOrdersTab 
              orders={orders}
              transactions={transactions}
              orderFilterStatus={orderFilterStatus}
              setOrderFilterStatus={setOrderFilterStatus}
              handleUpdateOrderStatus={handleUpdateOrderStatus}
              onViewReceipt={onViewReceipt}
            />
          )}

          {/* ================= TAB 3: TRANSACTIONS AUDIT ================= */}
          {activeTab === 'transactions' && (
            <AdminTransactionsTab 
              transactions={transactions}
              orders={orders}
              handleExportCSV={handleExportCSV}
              onViewReceipt={onViewReceipt}
            />
          )}

          {/* ================= TAB 4: STATS & REPORTS ================= */}
          {activeTab === 'stats' && (
            <AdminStatsTab 
              totalRevenue={totalRevenue}
              totalYassRevenue={totalYassRevenue}
              totalFloozRevenue={totalFloozRevenue}
              products={products}
              lowStockCount={lowStockCount}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsTab currentUser={currentUser} onAdminUpdated={onAdminUpdated} />
          )}
        </div>
      </div>

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {isProductFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Form Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingProductId ? 'Modifier l\'Article' : 'Ajouter un Nouvel Article'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Définissez le prix en FCFA, la description et ajoutez plusieurs photos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProductFormOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto flex-1 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom / Titre de l'article *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Smartphone Samsung Galaxy A54, Robe en Pagne..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'tous').map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, Promo price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prix de vente (FCFA / XOF) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="100"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="Ex: 25000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prix d'origine (Optionnel, pour promo)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="Ex: 30000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:bg-white focus:border-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantité en stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="Ex: 20"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description détaillée de l'article *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Décrivez les caractéristiques, la qualité, la taille, les matériaux ou la garantie..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden resize-none"
                />
              </div>

              {/* MULTI-PHOTOS SECTION */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>Galerie Multi-Photos ({formImages.length} photo{formImages.length > 1 ? 's' : ''})</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Upload direct ou URLs web
                  </span>
                </div>

                {/* Upload Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 cursor-pointer py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 shadow-xs transition-colors">
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>Téléverser des photos depuis l'appareil</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Or Add by Image URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Ou collez une URL d'image (ex: https://images.unsplash.com/...)"
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    Ajouter URL
                  </button>
                </div>

                {/* Image Thumbnails List */}
                {formImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-white border border-slate-200 group">
                        <img src={img} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow-xs">
                            Couverture
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-90 group-hover:opacity-100 transition-opacity"
                          title="Supprimer cette photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags / Mots-clés (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Ex: téléphone, 5G, promo, nouveauté"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProductId ? 'Enregistrer les modifications' : 'Publier l\'article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

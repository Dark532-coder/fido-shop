import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter } from 'lucide-react';
import { Product, User, CartItem, Order, Transaction, ProductReview } from './types';
import { CATEGORIES } from './data/categories';
import { getCategoryIcon } from './utils/categoryIcons';
import { 
  getStoredProducts, 
  saveStoredProducts,
  getCurrentUser, 
  setCurrentUser, 
  getStoredCart, 
  saveStoredCart 
} from './data/mockStorage';
import { apiGetProducts, apiLogout, getAuthToken, apiGetProfile } from './services/api';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { EmptyCatalogHero } from './components/EmptyCatalogHero';
import { Footer } from './components/Footer';

export default function App() {
  const [products, setProducts] = useState<Product[]>(getStoredProducts());
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const storedUser = getCurrentUser();
    return storedUser?.role === 'admin' && !getAuthToken() ? null : storedUser;
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isClientDashboardOpen, setIsClientDashboardOpen] = useState(false);
  const [clientDashboardTab, setClientDashboardTab] = useState('orders');
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [adminDashboardTab, setAdminDashboardTab] = useState('products');
  const [isLightTheme, setIsLightTheme] = useState(() => localStorage.getItem('fido_theme') === 'light');

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptTrx, setSelectedReceiptTrx] = useState<Transaction | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsProductsLoading(true);
      try {
        const data = await apiGetProducts();
        setProducts(data);
      } catch (err) {
        setProducts(getStoredProducts());
      } finally {
        setIsProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      if (getAuthToken()) {
        try {
          const { user } = await apiGetProfile();
          setCurrentUserState(user);
          setCurrentUser(user);
        } catch (err) {
          setCurrentUserState(getCurrentUser());
        }
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    const handleProductsUpdated = async () => {
      try {
        const data = await apiGetProducts();
        setProducts(data);
      } catch (err) {
        setProducts(getStoredProducts());
      }
    };
    const handleAuthUpdated = () => setCurrentUserState(getCurrentUser());

    window.addEventListener('products_updated', handleProductsUpdated);
    window.addEventListener('auth_updated', handleAuthUpdated);

    return () => {
      window.removeEventListener('products_updated', handleProductsUpdated);
      window.removeEventListener('auth_updated', handleAuthUpdated);
    };
  }, []);

  useEffect(() => {
    const rawCart = getStoredCart();
    const hydrated: CartItem[] = [];
    rawCart.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        hydrated.push({ product: prod, quantity: item.quantity });
      }
    });
    setCartItems(hydrated);
  }, [products]);

  const updateCartState = (newItems: CartItem[]) => {
    setCartItems(newItems);
    saveStoredCart(newItems.map((i) => ({ productId: i.product.id, quantity: i.quantity })));
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    const existingIndex = cartItems.findIndex((i) => i.product.id === product.id);
    let updated: CartItem[];
    if (existingIndex >= 0) {
      updated = cartItems.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
          : item
      );
    } else {
      updated = [...cartItems, { product, quantity }];
    }
    updateCartState(updated);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const updated = cartItems.map((i) => {
      if (i.product.id === productId) {
        return { ...i, quantity: Math.min(i.product.stock, quantity) };
      }
      return i;
    });
    updateCartState(updated);
  };

  const handleRemoveCartItem = (productId: string) => {
    const updated = cartItems.filter((i) => i.product.id !== productId);
    updateCartState(updated);
  };

  const handleClearCart = () => {
    updateCartState([]);
  };

  const handleLogout = () => {
    apiLogout();
    setCurrentUser(null);
    setCurrentUserState(null);
  };

  const openAdminDashboard = (tab = 'products') => {
    if (currentUser?.role !== 'admin' || !getAuthToken()) {
      setIsAuthOpen(true);
      return;
    }
    setAdminDashboardTab(tab);
    setIsAdminDashboardOpen(true);
  };

  const toggleTheme = () => {
    setIsLightTheme((current) => {
      const next = !current;
      localStorage.setItem('fido_theme', next ? 'light' : 'dark');
      return next;
    });
  };

  const handleAddReview = (productId: string, reviewData: Omit<ProductReview, 'id' | 'createdAt'>) => {
    const newReview: ProductReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedProducts = products.map((prod) => {
      if (prod.id === productId) {
        const existingReviews = prod.reviews || [];
        const newReviews = [newReview, ...existingReviews];
        const avg = Number((newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length).toFixed(1));
        return {
          ...prod,
          reviews: newReviews,
          averageRating: avg,
          reviewsCount: newReviews.length,
        };
      }
      return prod;
    });

    setProducts(updatedProducts);
    saveStoredProducts(updatedProducts);

    if (selectedProductDetail && selectedProductDetail.id === productId) {
      const updatedSelected = updatedProducts.find((p) => p.id === productId) || null;
      setSelectedProductDetail(updatedSelected);
    }
  };

  const handleOpenReceipt = (trx: Transaction, ord: Order) => {
    setSelectedReceiptTrx(trx);
    setSelectedReceiptOrder(ord);
    setReceiptModalOpen(true);
  };

  const scrollToProducts = () => {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'tous' ||
      prod.category.toLowerCase() === selectedCategory.toLowerCase() ||
      CATEGORIES.find((c) => c.id === selectedCategory)?.name.toLowerCase() === prod.category.toLowerCase();

    return matchesSearch && matchesCategory && prod.isActive;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') {
      const aRating = a.averageRating || 5;
      const bRating = b.averageRating || 5;
      return bRating - aRating;
    }
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className={`min-h-screen bg-onyx-950 flex flex-col text-onyx-50 font-sans antialiased selection:bg-gold-500 selection:text-onyx-950 ${isLightTheme ? 'theme-light' : ''}`}>
      
      <Navbar
        currentUser={currentUser}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenClientDashboard={(tab) => {
          setClientDashboardTab(tab || 'orders');
          setIsClientDashboardOpen(true);
        }}
        onOpenAdminDashboard={openAdminDashboard}
        isLightTheme={isLightTheme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onNewProductClick={() => {
          openAdminDashboard('products');
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">

        {/* HERO */}
        <HeroBanner
          onDiscoverClick={scrollToProducts}
          onAuthClick={() => setIsAuthOpen(true)}
          hasUser={!!currentUser}
        />

        {/* Catégories en icônes */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-black text-onyx-400 uppercase tracking-widest flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gold-400" />
              Explorez nos rayons
            </h2>
            <span className="text-xs text-gold-300 font-bold bg-gold-500/10 border border-gold-500/20 px-2.5 py-0.5 rounded-full">
              {products.length} {products.length > 1 ? 'articles' : 'article'}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const Icon = getCategoryIcon(cat.iconName);
              return (
                <motion.button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center gap-2 shrink-0 px-4 py-3 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-gold-500/10 border border-gold-500/40'
                      : 'bg-onyx-900 border border-onyx-800 hover:border-onyx-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-gold-500 text-onyx-950' : 'bg-onyx-800 text-onyx-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] font-bold whitespace-nowrap ${
                    isSelected ? 'text-gold-300' : 'text-onyx-400'
                  }`}>
                    {cat.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* En-tête section produits + tri */}
        <div id="products-section" className="flex flex-wrap items-center justify-between gap-4 pt-2 scroll-mt-24">
          <div className="flex items-center gap-3">
            <span className="w-1 h-8 rounded-full bg-gradient-to-b from-gold-400 to-gold-600" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-onyx-50 tracking-tight">
                {selectedCategory === 'tous'
                  ? 'Tous nos Articles'
                  : CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Articles'}
              </h1>
              <p className="text-xs text-onyx-500 mt-0.5">
                Paiement instantané par Mixx by Yas & Fozz avec validation SMS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-onyx-400">Trier :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-onyx-900 border border-onyx-700 rounded-2xl text-xs font-bold text-onyx-100 shadow-xs focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/20 outline-hidden cursor-pointer"
            >
              <option value="newest">Nouveautés d'abord</option>
              <option value="rating">Mieux notés (Avis ★)</option>
              <option value="price_asc">Prix croissant (FCFA)</option>
              <option value="price_desc">Prix décroissant (FCFA)</option>
            </select>
          </div>
        </div>

        {/* Grille produits / états vides */}
        {isProductsLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
          </div>
        ) : products.length === 0 ? (
          <EmptyCatalogHero
            isAdmin={currentUser?.role === 'admin'}
            hasUser={!!currentUser}
            onAddProduct={() => {
              openAdminDashboard('products');
            }}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        ) : sortedProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-onyx-900 rounded-3xl border border-onyx-700 p-12 text-center shadow-lg shadow-black/20"
          >
            <Search className="w-10 h-10 text-onyx-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-onyx-50">Aucun article ne correspond à votre recherche</h3>
            <p className="text-xs text-onyx-500 mt-1">
              Essayez un autre mot-clé ou sélectionnez "Tous les rayons".
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('tous');
              }}
              className="mt-4 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-onyx-950 text-xs font-bold rounded-xl shadow-xs"
            >
              Réinitialiser les filtres
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {sortedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onQuickView={(p) => setSelectedProductDetail(p)}
              />
            ))}
          </motion.div>
        )}
      </main>

      <Footer
        onOpenAdminAuth={() => {
          if (currentUser?.role === 'admin') {
            openAdminDashboard('products');
          } else {
            setIsAuthOpen(true);
          }
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <ProductDetailModal
        product={selectedProductDetail}
        currentUser={currentUser}
        isOpen={!!selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={handleAddToCart}
        onAddReview={handleAddReview}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currentUser={currentUser}
        onOrderSuccess={(_order, _transaction) => {
          handleClearCart();
          setProducts(getStoredProducts());
        }}
        onViewReceipt={(trx, ord) => handleOpenReceipt(trx, ord)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUserState(user);
          if (user.role === 'admin') {
            setIsAdminDashboardOpen(true);
          }
        }}
      />

      {isClientDashboardOpen && currentUser && (
        <ClientDashboard
          currentUser={currentUser}
          initialTab={clientDashboardTab}
          onClose={() => setIsClientDashboardOpen(false)}
          onViewReceipt={(trx, ord) => handleOpenReceipt(trx, ord)}
        />
      )}

      {isAdminDashboardOpen && (
        <AdminDashboard
          initialTab={adminDashboardTab}
          currentUser={currentUser!}
          onAdminUpdated={(user) => {
            setCurrentUserState(user);
            setCurrentUser(user);
          }}
          onClose={() => {
            setIsAdminDashboardOpen(false);
            setProducts(getStoredProducts());
          }}
          onViewReceipt={(trx, ord) => handleOpenReceipt(trx, ord)}
        />
      )}

      <TransactionReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        transaction={selectedReceiptTrx}
        order={selectedReceiptOrder}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Search, 
  SlidersHorizontal,
  PlusCircle,
  Package,
  Smartphone,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenClientDashboard: (tab?: string) => void;
  onOpenAdminDashboard: (tab?: string) => void;
  onLogout: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onNewProductClick?: () => void;
  isLightTheme: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  cartCount,
  onOpenCart,
  onOpenAuth,
  onOpenClientDashboard,
  onOpenAdminDashboard,
  onLogout,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onNewProductClick,
  isLightTheme,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-onyx-950/90 backdrop-blur-xl border-b border-gold-500/10 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectCategory('tous')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-gold-700 via-gold-500 to-gold-300 flex items-center justify-center text-onyx-950 shadow-md shadow-gold-500/20 group-hover:shadow-gold-500/40 transition-all duration-300">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="text-lg sm:text-xl font-black text-onyx-50 tracking-tight block">
                  Fido's <span className="text-gold-400">Shop</span>
                </span>
                <span className="text-[10px] text-onyx-500 font-medium tracking-widest uppercase">
                  Boutique Officielle Togo
                </span>
              </div>
            </motion.button>
          </div>

          {/* Search Input (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-onyx-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-nav-search"
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher des articles, marques, catégories..."
                className="w-full pl-10 pr-10 py-2.5 bg-onyx-800/70 hover:bg-onyx-800 focus:bg-onyx-900 text-sm text-onyx-50 rounded-2xl border border-onyx-700 focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/10 outline-hidden transition-all placeholder:text-onyx-500"
              />
              {searchTerm ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-onyx-500 hover:text-gold-400 text-xs font-semibold p-1"
                >
                  ✕
                </button>
              ) : null}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isLightTheme ? 'Activer le thème sombre' : 'Activer le thème clair'}
              title={isLightTheme ? 'Thème sombre' : 'Thème clair'}
              className="p-2 rounded-xl text-onyx-300 hover:bg-onyx-800 hover:text-gold-300 transition-colors"
            >
              {isLightTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            
            {currentUser?.role === 'admin' && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                id="btn-nav-add-product"
                onClick={() => {
                  if (onNewProductClick) {
                    onNewProductClick();
                  } else {
                    onOpenAdminDashboard('products');
                  }
                }}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 bg-gold-500 hover:bg-gold-400 text-onyx-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ajouter un article</span>
              </motion.button>
            )}

            {/* Auth / Profile Button */}
            {currentUser ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id="btn-user-profile-menu"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-onyx-800/80 hover:bg-onyx-800 text-onyx-100 text-sm font-medium transition-colors border border-onyx-700"
                >
                  <div className="w-7 h-7 rounded-lg bg-gold-500 text-onyx-950 flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate text-xs font-semibold">
                    {currentUser.name}
                  </span>
                  <span className={`hidden sm:inline text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    currentUser.role === 'admin' ? 'bg-gold-500/20 text-gold-300' : 'bg-onyx-700 text-onyx-300'
                  }`}>
                    {currentUser.role === 'admin' ? 'Admin' : 'Client'}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-onyx-900 rounded-2xl shadow-2xl shadow-black/60 border border-onyx-700 py-2 z-50 overflow-hidden"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 bg-onyx-800 border-b border-onyx-700">
                        <p className="text-xs font-bold text-onyx-50 truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-onyx-400 truncate">{currentUser.email}</p>
                        <p className="text-[11px] text-onyx-500 font-mono mt-0.5">{currentUser.phone}</p>
                      </div>

                      {currentUser.role === 'admin' ? (
                        <>
                          <div className="px-2 py-1">
                            <button
                              id="dropdown-admin-dashboard"
                              onClick={() => {
                                setUserDropdownOpen(false);
                                onOpenAdminDashboard('products');
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-gold-300 hover:bg-gold-500/10 rounded-xl flex items-center gap-2 transition-colors"
                            >
                              <SlidersHorizontal className="w-4 h-4 text-gold-400" />
                              Gestion du Catalogue
                            </button>
                            <button
                              id="dropdown-admin-orders"
                              onClick={() => {
                                setUserDropdownOpen(false);
                                onOpenAdminDashboard('orders');
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-onyx-200 hover:bg-onyx-800 rounded-xl flex items-center gap-2 transition-colors"
                            >
                              <Package className="w-4 h-4 text-onyx-400" />
                              Commandes Clients
                            </button>
                            <button
                              id="dropdown-admin-transactions"
                              onClick={() => {
                                setUserDropdownOpen(false);
                                onOpenAdminDashboard('transactions');
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-onyx-200 hover:bg-onyx-800 rounded-xl flex items-center gap-2 transition-colors"
                            >
                              <Smartphone className="w-4 h-4 text-onyx-400" />
                              Transactions Mixx by Yas & Flooz
                            </button>
                          </div>
                          <div className="border-t border-onyx-700 my-1" />
                        </>
                      ) : (
                        <div className="px-2 py-1">
                          <button
                            id="dropdown-client-orders"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenClientDashboard('orders');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-onyx-100 hover:bg-onyx-800 rounded-xl flex items-center gap-2 transition-colors"
                          >
                            <Package className="w-4 h-4 text-gold-400" />
                            Mes Commandes & Suivi
                          </button>
                          <button
                            id="dropdown-client-transactions"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenClientDashboard('transactions');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-onyx-200 hover:bg-onyx-800 rounded-xl flex items-center gap-2 transition-colors"
                          >
                            <Smartphone className="w-4 h-4 text-onyx-400" />
                            Paiements Mobile Money
                          </button>
                          <button
                            id="dropdown-client-profile"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenClientDashboard('profile');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-onyx-200 hover:bg-onyx-800 rounded-xl flex items-center gap-2 transition-colors"
                          >
                            <UserIcon className="w-4 h-4 text-onyx-400" />
                            Mon Profil & Sécurité
                          </button>
                        </div>
                      )}

                      <div className="px-2 py-1 border-t border-onyx-700">
                        <button
                          id="dropdown-logout"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                id="btn-nav-login"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-onyx-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Connexion</span>
              </motion.button>
            )}

            {/* Shopping Cart Button */}
            <motion.button
              id="btn-nav-cart"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenCart}
              className="relative p-2.5 sm:px-4 sm:py-2 bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 rounded-xl font-bold text-xs flex items-center gap-2 transition-all border border-gold-500/20"
              aria-label="Voir le panier"
            >
              <ShoppingBag className="w-4 h-4 text-gold-400" />
              <span className="hidden sm:inline">Panier</span>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    key={cartCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                    className="bg-gold-500 text-onyx-950 text-[11px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-xs"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-onyx-300 hover:bg-onyx-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-onyx-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher un article..."
              className="w-full pl-10 pr-4 py-2 bg-onyx-800 text-sm text-onyx-50 rounded-xl border border-onyx-700 outline-hidden placeholder:text-onyx-500"
            />
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-onyx-800"
            >
              <div className="py-3 px-2 space-y-1">
                {currentUser ? (
                  <>
                    <div className="px-3 py-2 text-xs text-onyx-400">
                      Connecté : <span className="font-bold text-onyx-200">{currentUser.name}</span>
                      <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        currentUser.role === 'admin' ? 'bg-gold-500/20 text-gold-300' : 'bg-onyx-700 text-onyx-300'
                      }`}>
                        {currentUser.role === 'admin' ? 'Admin' : 'Client'}
                      </span>
                    </div>

                    {currentUser.role === 'admin' ? (
                      <>
                        <button
                          onClick={() => { setMobileMenuOpen(false); onOpenAdminDashboard('products'); }}
                          className="w-full text-left px-3 py-2.5 text-xs font-semibold text-gold-300 hover:bg-gold-500/10 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <SlidersHorizontal className="w-4 h-4 text-gold-400" />
                          Gestion du Catalogue
                        </button>
                        <button
                          onClick={() => { setMobileMenuOpen(false); onOpenAdminDashboard('orders'); }}
                          className="w-full text-left px-3 py-2.5 text-xs font-medium text-onyx-200 hover:bg-onyx-800 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <Package className="w-4 h-4 text-onyx-400" />
                          Commandes Clients
                        </button>
                        <button
                          onClick={() => {
                            if (onNewProductClick) { setMobileMenuOpen(false); onNewProductClick(); }
                            else { setMobileMenuOpen(false); onOpenAdminDashboard('products'); }
                          }}
                          className="w-full text-left px-3 py-2.5 text-xs font-bold text-onyx-950 bg-gold-500 hover:bg-gold-400 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Ajouter un article
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setMobileMenuOpen(false); onOpenClientDashboard('orders'); }}
                          className="w-full text-left px-3 py-2.5 text-xs font-semibold text-onyx-100 hover:bg-onyx-800 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gold-400" />
                          Mes Commandes & Suivi
                        </button>
                        <button
                          onClick={() => { setMobileMenuOpen(false); onOpenClientDashboard('transactions'); }}
                          className="w-full text-left px-3 py-2.5 text-xs font-medium text-onyx-200 hover:bg-onyx-800 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <Smartphone className="w-4 h-4 text-onyx-400" />
                          Paiements Mobile Money
                        </button>
                        <button
                          onClick={() => { setMobileMenuOpen(false); onOpenClientDashboard('profile'); }}
                          className="w-full text-left px-3 py-2.5 text-xs font-medium text-onyx-200 hover:bg-onyx-800 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-onyx-400" />
                          Mon Profil & Sécurité
                        </button>
                      </>
                    )}

                    <div className="border-t border-onyx-800 my-1" />
                    <button
                      onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                      className="w-full text-left px-3 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                    className="w-full text-left px-3 py-2.5 text-xs font-bold text-gold-300 hover:bg-gold-500/10 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-gold-400" />
                    Se connecter / Créer un compte
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

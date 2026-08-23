import { Product, User, Order, Transaction } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'ecommerce_tg_products_v1',
  USERS: 'ecommerce_tg_users_v1',
  CURRENT_USER: 'ecommerce_tg_current_user_v1',
  ORDERS: 'ecommerce_tg_orders_v1',
  TRANSACTIONS: 'ecommerce_tg_transactions_v1',
  CART: 'ecommerce_tg_cart_v1',
};

// 1. PRODUCTS (Starts EMPTY as requested by the user: "n'ajoute aucun article")
export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) return [];
    const products: unknown = JSON.parse(raw);
    return Array.isArray(products) ? products as Product[] : [];
  } catch {
    return [];
  }
}

export function saveStoredProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  window.dispatchEvent(new CustomEvent('products_updated', { detail: products }));
}

// 2. USERS
export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      return [];
    }
    const users: User[] = JSON.parse(raw);
    return users;
  } catch {
    return [];
  }
}

export function saveStoredUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  window.dispatchEvent(new CustomEvent('users_updated', { detail: users }));
}

// 3. CURRENT AUTH USER
export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
  window.dispatchEvent(new CustomEvent('auth_updated', { detail: user }));
}

// 4. ORDERS
export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) return [];
    const orders: unknown = JSON.parse(raw);
    return Array.isArray(orders) ? orders as Order[] : [];
  } catch {
    return [];
  }
}

export function saveStoredOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent('orders_updated', { detail: orders }));
}

// 5. TRANSACTIONS
export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return [];
    const transactions: unknown = JSON.parse(raw);
    return Array.isArray(transactions) ? transactions as Transaction[] : [];
  } catch {
    return [];
  }
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  window.dispatchEvent(new CustomEvent('transactions_updated', { detail: transactions }));
}

// CART PERSISTENCE
export function getStoredCart(): { productId: string; quantity: number }[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    if (!raw) return [];
    const cart: unknown = JSON.parse(raw);
    return Array.isArray(cart) ? cart as { productId: string; quantity: number }[] : [];
  } catch {
    return [];
  }
}

export function saveStoredCart(cart: { productId: string; quantity: number }[]): void {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cart_updated', { detail: cart }));
}

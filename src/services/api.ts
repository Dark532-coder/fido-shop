/**
 * Fido's Shop — API Client
 * 
 * This service replaces localStorage calls with real API calls.
 * Falls back to localStorage when the API is unavailable (offline mode).
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Token storage
let authToken: string | null = localStorage.getItem('fido_auth_token');

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur réseau.' }));
    throw new Error(error.error || `Erreur ${response.status}`);
  }

  return response.json();
}

// ─── Auth ────────────────────────────────────────────────────

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('fido_auth_token', token);
  } else {
    localStorage.removeItem('fido_auth_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function apiRegister(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ user: any; token: string }> {
  const result = await apiRequest<{ user: any; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setAuthToken(result.token);
  return result;
}

export async function apiLogin(data: {
  email: string;
  password: string;
}): Promise<{ user: any; token: string }> {
  const result = await apiRequest<{ user: any; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setAuthToken(result.token);
  return result;
}

export async function apiGetProfile(): Promise<{ user: any }> {
  return apiRequest<{ user: any }>('/auth/me');
}

export function apiLogout() {
  setAuthToken(null);
  localStorage.removeItem('fido_current_user');
}

// ─── Products ────────────────────────────────────────────────

export async function apiGetProducts(params?: {
  category?: string;
  search?: string;
  featured?: boolean;
}): Promise<any[]> {
  const searchParams = new URLSearchParams();
  if (params?.category && params.category !== 'tous') searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.featured) searchParams.set('featured', 'true');

  const query = searchParams.toString();
  return apiRequest<any[]>(`/products${query ? `?${query}` : ''}`);
}

export async function apiGetProduct(id: string): Promise<any> {
  return apiRequest<any>(`/products/${id}`);
}

export async function apiCreateProduct(data: any): Promise<any> {
  return apiRequest<any>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateProduct(id: string, data: any): Promise<any> {
  return apiRequest<any>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteProduct(id: string): Promise<void> {
  await apiRequest(`/products/${id}`, { method: 'DELETE' });
}

export async function apiAddReview(productId: string, data: {
  rating: number;
  title?: string;
  comment?: string;
}): Promise<any> {
  return apiRequest<any>(`/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Orders ──────────────────────────────────────────────────

export async function apiCreateOrder(data: {
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: any;
  paymentMethod: 'yass' | 'flooz';
}): Promise<any> {
  return apiRequest<any>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetOrders(): Promise<any[]> {
  return apiRequest<any[]>('/orders');
}

export async function apiUpdateOrderStatus(orderId: string, orderStatus: string): Promise<any> {
  return apiRequest<any>(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ orderStatus }),
  });
}

// ─── Payments ────────────────────────────────────────────────

export async function apiInitPayment(orderId: string): Promise<{
  mode: 'paydunya' | 'simulation';
  checkoutUrl?: string;
  transaction?: any;
  message?: string;
}> {
  return apiRequest('/payments/init', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

// ─── Transactions ────────────────────────────────────────────

export async function apiGetTransactions(): Promise<any[]> {
  return apiRequest<any[]>('/payments/transactions');
}

// ─── Health ──────────────────────────────────────────────────

export async function apiHealthCheck(): Promise<{ status: string }> {
  return apiRequest<{ status: string }>('/health');
}

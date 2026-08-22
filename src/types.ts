export type UserRole = 'client' | 'admin';

export interface UserAddress {
  id: string;
  label: string; // e.g. "Domicile", "Bureau"
  fullName: string;
  phone: string;
  city: string;
  district: string;
  addressDetails: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  addresses: UserAddress[];
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  avatar?: string;
  createdAt: string;
  preferredPaymentMethod?: 'yass' | 'flooz';
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  createdAt: string;
  isVerifiedPurchase?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in FCFA (XOF)
  originalPrice?: number;
  category: string;
  stock: number;
  images: string[]; // Multiple photos
  featuredImageIndex: number;
  tags: string[];
  isActive: boolean;
  reviews?: ProductReview[];
  averageRating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'en_attente' | 'paye' | 'en_preparation' | 'expedie' | 'livre' | 'annule';
export type PaymentMethod = 'yass' | 'flooz';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note?: string;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  addressDetails: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  shippingAddress: ShippingInfo;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionId: string;
  operatorRef: string;
  securityHash: string;
  otpVerified: boolean;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
}

export interface Transaction {
  id: string;
  transactionRef: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userName: string;
  payerPhone: string;
  amount: number;
  fees: number;
  paymentMethod: PaymentMethod;
  status: 'success' | 'pending' | 'failed';
  operatorRef: string;
  securityHash: string;
  ipAddress: string;
  authMethod: string; // e.g. "2FA OTP + USSD Push"
  timestamp: string;
  description: string;
}

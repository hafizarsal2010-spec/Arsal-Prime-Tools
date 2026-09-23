export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'staff' | 'customer';
  permissions: string[];
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice: number;
  duration: string;
  deliveryMethod: string;
  warranty: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  featured: boolean;
  shortDescription: string;
  description: string;
  features: string[];
  image: string;
  instructions: string;
  rating: number;
  reviewsCount: number;
  isArchived?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  duration: string;
  deliveryMethod: string;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface Order {
  id: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryEmail: string;
  whatsappNumber: string;
  deliveryNotes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  total: number;
  currency: 'PKR';
  paymentMethod: 'jazzcash' | 'easypaisa' | 'raast_bank' | 'nayapay' | 'manual_card';
  paymentReference: string;
  paymentProofNote: string;
  status: 'Placed' | 'Payment Pending' | 'Payment Confirmed' | 'Processing' | 'Delivered' | 'Cancelled' | 'Refunded';
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  deliveryCredentials: string | null;
  adminNotes: string | null;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  eligibleCategories: string[];
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  orderId?: string;
  title: string;
  message: string;
  type: 'order_placed' | 'payment_pending' | 'payment_confirmed' | 'processing' | 'delivered' | 'cancelled' | 'refunded' | 'system';
  read: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  targetType: 'order' | 'product' | 'coupon' | 'review' | 'user' | 'settings' | 'auth';
  targetId?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface SiteSettings {
  storeName: string;
  storeTagline: string;
  logoUrl: string;
  whatsappNumber: string;
  supportEmail: string;
  announcementBarText: string;
  announcementBarActive: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  currency: string;
  primaryColor: string;
  paymentInstructions: {
    jazzcash: { title: string; accountTitle: string; accountNumber: string; instructions: string };
    easypaisa: { title: string; accountTitle: string; accountNumber: string; instructions: string };
    raast_bank: { title: string; accountTitle: string; accountNumber: string; instructions: string };
    nayapay: { title: string; accountTitle: string; accountNumber: string; instructions: string };
  };
  termsOfService: string;
  refundPolicy: string;
  privacyPolicy: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

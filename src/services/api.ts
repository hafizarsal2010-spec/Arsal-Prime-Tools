import {
  User,
  Product,
  Category,
  Order,
  Coupon,
  Review,
  Notification,
  Activity,
  ContactMessage,
  SiteSettings,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('apt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP error! status: ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  async register(body: { name: string; email: string; phone?: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<{ user: User; token: string; message: string }>(res);
  },

  async login(body: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<{ user: User; token: string; message: string }>(res);
  },

  async resetPassword(body: { email: string; newPassword?: string }) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<{ message: string }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ user: User }>(res);
  },

  async updateProfile(body: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ user: User; message: string }>(res);
  },

  // Products
  async getProducts(params?: { category?: string; search?: string; sort?: string; featured?: boolean; includeArchived?: boolean }) {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.search) q.set('search', params.search);
    if (params?.sort) q.set('sort', params.sort);
    if (params?.featured) q.set('featured', 'true');
    if (params?.includeArchived) q.set('includeArchived', 'true');

    const res = await fetch(`${API_BASE}/products?${q.toString()}`);
    return handleResponse<{ products: Product[] }>(res);
  },

  async getProduct(id: string) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse<{ product: Product; reviews: Review[] }>(res);
  },

  async createProduct(body: Partial<Product>) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ product: Product; message: string }>(res);
  },

  async updateProduct(id: string, body: Partial<Product>) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ product: Product; message: string }>(res);
  },

  async archiveProduct(id: string) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse<{ categories: Category[] }>(res);
  },

  // Coupons
  async getActiveCoupons() {
    const res = await fetch(`${API_BASE}/coupons/active`);
    return handleResponse<{ coupons: Coupon[] }>(res);
  },

  async validateCoupon(code: string, subtotal: number) {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    return handleResponse<{ valid: boolean; coupon: { code: string; type: string; value: number; discount: number } }>(res);
  },

  async getAdminCoupons() {
    const res = await fetch(`${API_BASE}/admin/coupons`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ coupons: Coupon[] }>(res);
  },

  async createCoupon(body: Partial<Coupon>) {
    const res = await fetch(`${API_BASE}/admin/coupons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ coupon: Coupon; message: string }>(res);
  },

  async updateCoupon(id: string, body: Partial<Coupon>) {
    const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ coupon: Coupon; message: string }>(res);
  },

  async deleteCoupon(id: string) {
    const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Orders
  async createOrder(body: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryEmail?: string;
    whatsappNumber?: string;
    deliveryNotes?: string;
    items: Array<{ productId: string; name: string; price: number; quantity: number }>;
    couponCode?: string | null;
    paymentMethod: string;
    paymentReference?: string;
    paymentProofNote?: string;
    userId?: string;
  }) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<{ order: Order; message: string }>(res);
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ orders: Order[] }>(res);
  },

  async trackOrder(orderId: string, emailOrPhone: string) {
    const q = new URLSearchParams({ orderId, emailOrPhone });
    const res = await fetch(`${API_BASE}/orders/track?${q.toString()}`);
    return handleResponse<{ order: Order }>(res);
  },

  async getOrder(id: string) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ order: Order }>(res);
  },

  async submitPaymentProof(id: string, body: { paymentMethod?: string; paymentReference: string; paymentProofNote?: string }) {
    const res = await fetch(`${API_BASE}/orders/${id}/payment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<{ order: Order; message: string }>(res);
  },

  async getAdminOrders(params?: { status?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const res = await fetch(`${API_BASE}/admin/orders?${q.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ orders: Order[] }>(res);
  },

  async updateOrderStatus(id: string, body: {
    status: string;
    note?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    deliveryCredentials?: string;
    adminNotes?: string;
  }) {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ order: Order; message: string }>(res);
  },

  async updateOrderDetails(id: string, body: {
    deliveryCredentials?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    adminNotes?: string;
  }) {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/details`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ order: Order; message: string }>(res);
  },

  // Reviews
  async submitReview(body: { productId: string; rating: number; comment: string }) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ review: Review; message: string }>(res);
  },

  async getAdminReviews() {
    const res = await fetch(`${API_BASE}/admin/reviews`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ reviews: Review[] }>(res);
  },

  async updateReviewStatus(id: string, status: 'approved' | 'rejected') {
    const res = await fetch(`${API_BASE}/admin/reviews/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<{ review: Review; message: string }>(res);
  },

  async deleteReview(id: string) {
    const res = await fetch(`${API_BASE}/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Customer Notifications & Activities
  async getNotifications() {
    const res = await fetch(`${API_BASE}/customer/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ notifications: Notification[] }>(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/customer/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/customer/notifications/mark-all-read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async getCustomerActivities() {
    const res = await fetch(`${API_BASE}/customer/activity`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ activities: Activity[] }>(res);
  },

  // Admin Overview & Management
  async getAdminOverview() {
    const res = await fetch(`${API_BASE}/admin/overview`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{
      stats: {
        totalSales: number;
        totalOrders: number;
        pendingPaymentsCount: number;
        processingOrdersCount: number;
        deliveredOrdersCount: number;
        customersCount: number;
        activeProductsCount: number;
      };
      recentOrders: Order[];
      recentActivities: Activity[];
      popularProducts: Array<{ id: string; name: string; salesCount: number; revenue: number }>;
    }>(res);
  },

  async getAdminCustomers() {
    const res = await fetch(`${API_BASE}/admin/customers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ customers: Array<User & { ordersCount: number; totalSpent: number; lastOrderAt: string | null }> }>(res);
  },

  async updateCustomerStatus(id: string, status: 'active' | 'suspended') {
    const res = await fetch(`${API_BASE}/admin/customers/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<{ customer: User; message: string }>(res);
  },

  async getAdminStaff() {
    const res = await fetch(`${API_BASE}/admin/staff`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ staff: User[] }>(res);
  },

  async addAdminStaff(body: { name: string; email: string; phone?: string; password: string; role?: string; permissions?: string[] }) {
    const res = await fetch(`${API_BASE}/admin/staff`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ staff: User; message: string }>(res);
  },

  async getAdminActivities() {
    const res = await fetch(`${API_BASE}/admin/activities`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ activities: Activity[] }>(res);
  },

  async broadcastNotification(body: { title: string; message: string; targetRole?: string }) {
    const res = await fetch(`${API_BASE}/admin/notifications/broadcast`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Contact
  async sendContactMessage(body: { name: string; email: string; phone?: string; subject?: string; message: string }) {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<{ message: string }>(res);
  },

  async getAdminMessages() {
    const res = await fetch(`${API_BASE}/admin/messages`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ messages: ContactMessage[] }>(res);
  },

  async replyMessage(id: string, reply: string) {
    const res = await fetch(`${API_BASE}/admin/messages/${id}/reply`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reply, status: 'replied' }),
    });
    return handleResponse<{ message: string; data: ContactMessage }>(res);
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse<{ settings: SiteSettings }>(res);
  },

  async updateSettings(body: Partial<SiteSettings>) {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ settings: SiteSettings; message: string }>(res);
  },
};

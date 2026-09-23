import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Product,
  Order,
  User,
  Coupon,
  Review,
  ContactMessage,
  SiteSettings,
  Activity
} from '../types';
import { api } from '../services/api';
import {
  Shield,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tag,
  Star,
  Bell,
  MessageSquare,
  Settings as SettingsIcon,
  UserCheck,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  ExternalLink,
  Eye,
  Key,
  Calendar,
  Save,
  Clock,
  ArrowRight,
  LogOut,
  RefreshCw,
  Send
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, loginUser, logoutUser, showToast, refreshSettings } = useStore();

  // Admin login form states (if not logged in as admin)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'orders'
    | 'products'
    | 'customers'
    | 'coupons'
    | 'reviews'
    | 'messages'
    | 'notifications'
    | 'settings'
    | 'staff'
  >('overview');

  // Overview Data
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Order Edit in Modal
  const [modalOrderStatus, setModalOrderStatus] = useState('');
  const [modalOrderNote, setModalOrderNote] = useState('');
  const [modalCredentials, setModalCredentials] = useState('');
  const [modalStartDate, setModalStartDate] = useState('');
  const [modalEndDate, setModalEndDate] = useState('');
  const [modalAdminNotes, setModalAdminNotes] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(false);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Customers State
  const [customers, setCustomers] = useState<any[]>([]);

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: 15,
    minOrder: 1000,
    usageLimit: 100,
  });

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);

  // Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [replyMessageId, setReplyMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Notifications Broadcast
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Store Settings State
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Staff & Logs
  const [staffList, setStaffList] = useState<User[]>([]);
  const [auditActivities, setAuditActivities] = useState<Activity[]>([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    permissions: ['manage_orders', 'manage_products'],
  });

  const isAdminOrStaff = user && (user.role === 'admin' || user.role === 'staff');

  const loadOverview = useCallback(async () => {
    try {
      setOverviewLoading(true);
      const res = await api.getAdminOverview();
      setOverviewStats(res);
    } catch (err) {
      console.error(err);
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const res = await api.getAdminOrders({
        status: orderStatusFilter !== 'all' ? orderStatusFilter : undefined,
        search: orderSearch || undefined,
      });
      setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    }
  }, [orderStatusFilter, orderSearch]);

  const loadProducts = useCallback(async () => {
    try {
      const res = await api.getProducts({ includeArchived: true, search: productSearch });
      setProducts(res.products || []);
    } catch (err) {
      console.error(err);
    }
  }, [productSearch]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await api.getAdminCustomers();
      setCustomers(res.customers || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadCoupons = useCallback(async () => {
    try {
      const res = await api.getAdminCoupons();
      setCoupons(res.coupons || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadReviews = useCallback(async () => {
    try {
      const res = await api.getAdminReviews();
      setReviews(res.reviews || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const res = await api.getAdminMessages();
      setMessages(res.messages || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const res = await api.getSettings();
      setSettingsForm(res.settings);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadStaffAndLogs = useCallback(async () => {
    try {
      const [sRes, aRes] = await Promise.all([
        api.getAdminStaff(),
        api.getAdminActivities(),
      ]);
      setStaffList(sRes.staff || []);
      setAuditActivities(aRes.activities || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Dispatch data fetch according to active tab
  useEffect(() => {
    if (!isAdminOrStaff) return;
    if (activeTab === 'overview') loadOverview();
    else if (activeTab === 'orders') loadOrders();
    else if (activeTab === 'products') loadProducts();
    else if (activeTab === 'customers') loadCustomers();
    else if (activeTab === 'coupons') loadCoupons();
    else if (activeTab === 'reviews') loadReviews();
    else if (activeTab === 'messages') loadMessages();
    else if (activeTab === 'settings') loadSettings();
    else if (activeTab === 'staff') loadStaffAndLogs();
  }, [
    isAdminOrStaff,
    activeTab,
    loadOverview,
    loadOrders,
    loadProducts,
    loadCustomers,
    loadCoupons,
    loadReviews,
    loadMessages,
    loadSettings,
    loadStaffAndLogs,
  ]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      const res = await api.login({ email: adminEmail, password: adminPassword });
      if (res.user.role !== 'admin' && res.user.role !== 'staff') {
        showToast('Access denied: This account lacks administrative privileges.', 'error');
        return;
      }
      loginUser(res.user, res.token);
      showToast(`Welcome to Admin Management, ${res.user.name}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleOpenOrderModal = (ord: Order) => {
    setSelectedOrder(ord);
    setModalOrderStatus(ord.status);
    setModalOrderNote('');
    setModalCredentials(ord.deliveryCredentials || '');
    setModalStartDate(ord.subscriptionStartDate ? ord.subscriptionStartDate.substring(0, 10) : '');
    setModalEndDate(ord.subscriptionEndDate ? ord.subscriptionEndDate.substring(0, 10) : '');
    setModalAdminNotes(ord.adminNotes || '');
  };

  const handleSaveOrderModal = async () => {
    if (!selectedOrder) return;
    try {
      setUpdatingOrder(true);
      const res = await api.updateOrderStatus(selectedOrder.id, {
        status: modalOrderStatus,
        note: modalOrderNote || undefined,
        deliveryCredentials: modalCredentials || undefined,
        subscriptionStartDate: modalStartDate || undefined,
        subscriptionEndDate: modalEndDate || undefined,
        adminNotes: modalAdminNotes || undefined,
      });
      showToast(res.message || 'Order updated successfully', 'success');
      setSelectedOrder(res.order);
      loadOrders();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order', 'error');
    } finally {
      setUpdatingOrder(false);
    }
  };

  const handleQuickConfirmPayment = async (orderId: string) => {
    try {
      const res = await api.updateOrderStatus(orderId, {
        status: 'Payment Confirmed',
        note: 'Payment verified and transaction ID approved by admin.',
      });
      showToast(res.message, 'success');
      loadOrders();
    } catch (err: any) {
      showToast(err.message || 'Failed to update payment status', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || editingProduct.price === undefined) {
      showToast('Name and price are required', 'error');
      return;
    }

    try {
      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, editingProduct);
        showToast('Product updated successfully!', 'success');
      } else {
        await api.createProduct(editingProduct);
        showToast('Product created successfully!', 'success');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleArchiveProduct = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product?')) return;
    try {
      await api.archiveProduct(id);
      showToast('Product archived', 'info');
      loadProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to archive', 'error');
    }
  };

  const handleToggleCustomerStatus = async (id: string, current: string) => {
    const nextStatus = current === 'active' ? 'suspended' : 'active';
    try {
      await api.updateCustomerStatus(id, nextStatus as any);
      showToast(`Customer status updated to ${nextStatus}`, 'success');
      loadCustomers();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCoupon(newCoupon as any);
      showToast('New coupon created successfully!', 'success');
      setShowCouponModal(false);
      setNewCoupon({ code: '', type: 'percentage', value: 15, minOrder: 1000, usageLimit: 100 });
      loadCoupons();
    } catch (err: any) {
      showToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.deleteCoupon(id);
      showToast('Coupon deleted', 'info');
      loadCoupons();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete coupon', 'error');
    }
  };

  const handleReviewAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.updateReviewStatus(id, status);
      showToast(`Review ${status}`, 'success');
      loadReviews();
    } catch (err: any) {
      showToast(err.message || 'Failed to update review', 'error');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await api.deleteReview(id);
      showToast('Review removed', 'info');
      loadReviews();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete review', 'error');
    }
  };

  const handleReplyMessage = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await api.replyMessage(id, replyText.trim());
      showToast('Reply recorded and customer informed!', 'success');
      setReplyMessageId(null);
      setReplyText('');
      loadMessages();
    } catch (err: any) {
      showToast(err.message || 'Failed to reply', 'error');
    }
  };

  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    try {
      setSendingBroadcast(true);
      await api.broadcastNotification({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        targetRole: broadcastTarget,
      });
      showToast('Broadcast dispatched successfully to customers!', 'success');
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err: any) {
      showToast(err.message || 'Broadcast failed', 'error');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      setSavingSettings(true);
      const res = await api.updateSettings(settingsForm);
      showToast(res.message || 'Settings saved successfully!', 'success');
      refreshSettings();
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addAdminStaff(newStaff);
      showToast('Staff member added successfully!', 'success');
      setShowStaffModal(false);
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'staff',
        permissions: ['manage_orders', 'manage_products'],
      });
      loadStaffAndLogs();
    } catch (err: any) {
      showToast(err.message || 'Failed to add staff', 'error');
    }
  };

  // If user is not authenticated as admin, show dedicated Admin Login Screen
  if (!isAdminOrStaff) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="p-8 rounded-3xl bg-[#13161f] border border-red-500/30 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto shadow-inner">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-['Syne',sans-serif]">
              Admin Control Center
            </h1>
            <p className="text-xs text-zinc-400">
              Staff &amp; Executive credentials required. Public visitors cannot register as administrators.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Administrator Email</label>
              <input
                type="email"
                required
                placeholder="admin@arsalprimetools.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Password</label>
              <input
                type="password"
                required
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-950/60 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Access Admin Dashboard'}
            </button>
          </form>

          {/* Quick Fill Demo Admin Credentials Button */}
          <div className="pt-2 border-t border-white/[0.06] text-center">
            <button
              onClick={() => {
                setAdminEmail('admin@arsalprimetools.com');
                setAdminPassword('Admin@Arsal2026!');
              }}
              className="text-[11px] text-zinc-500 hover:text-red-400 underline"
            >
              Auto-fill default seed administrator credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Admin Header Bar */}
      <div className="p-5 rounded-2xl bg-[#13161f] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-red-950">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white font-['Syne',sans-serif]">
                Arsal Prime Tools · Dashboard
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Logged in as {user.name} ({user.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === 'overview') loadOverview();
              else if (activeTab === 'orders') loadOrders();
              else if (activeTab === 'products') loadProducts();
              showToast('Data refreshed', 'info');
            }}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.08] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh current view"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={logoutUser}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-red-400 hover:text-red-300 border border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Admin Layout: Navigation Tabs & Workspace */}
      <div className="space-y-6">
        {/* Navigation Tabs Horizontal Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-white/[0.08]">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: overviewStats?.stats?.pendingPaymentsCount },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'coupons', label: 'Offers & Coupons', icon: Tag },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'notifications', label: 'Broadcast', icon: Bell },
            { id: 'settings', label: 'Store Settings', icon: SettingsIcon },
            { id: 'staff', label: 'Staff & Audit Logs', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-zinc-950">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {overviewLoading || !overviewStats ? (
              <div className="p-12 text-center text-xs text-zinc-400">
                Loading dashboard metrics...
              </div>
            ) : (
              <>
                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-1">
                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      Total Revenue (PKR)
                    </span>
                    <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
                      Rs. {overviewStats.stats.totalSales.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-emerald-400">Completed &amp; Verified Sales</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-1">
                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      Total Orders
                    </span>
                    <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
                      {overviewStats.stats.totalOrders}
                    </div>
                    <span className="text-[10px] text-zinc-400">All customer checkouts</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#13161f] border border-amber-500/30 space-y-1">
                    <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">
                      Pending Payments
                    </span>
                    <div className="text-2xl font-extrabold text-amber-300 font-mono tabular-nums">
                      {overviewStats.stats.pendingPaymentsCount}
                    </div>
                    <span className="text-[10px] text-amber-400">Require TID verification</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-1">
                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      Registered Customers
                    </span>
                    <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
                      {overviewStats.stats.customersCount}
                    </div>
                    <span className="text-[10px] text-zinc-400">Active customer accounts</span>
                  </div>
                </div>

                {/* Popular Products & Recent Orders Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Popular Products */}
                  <div className="lg:col-span-5 p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Top Selling Subscriptions
                    </h3>

                    <div className="divide-y divide-white/[0.06] text-xs">
                      {overviewStats.popularProducts?.map((item: any) => (
                        <div key={item.id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">{item.name}</div>
                            <div className="text-[11px] text-zinc-400">{item.salesCount} sold</div>
                          </div>
                          <div className="font-mono font-bold text-white text-right">
                            Rs. {item.revenue.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity Audit */}
                  <div className="lg:col-span-7 p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Recent System Events
                    </h3>

                    <div className="divide-y divide-white/[0.06] text-xs max-h-80 overflow-y-auto">
                      {overviewStats.recentActivities?.map((act: any) => (
                        <div key={act.id} className="py-2.5 flex items-start justify-between gap-3">
                          <div>
                            <span className="font-bold text-white mr-1.5">{act.action}:</span>
                            <span className="text-zinc-400">{act.details}</span>
                            <span className="text-[10px] text-zinc-500 block">By: {act.userName} ({act.userRole})</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                            {new Date(act.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ORDERS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Orders Filter & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#13161f] border border-white/[0.08]">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID, name, email, phone, TID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-white/[0.1] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {['all', 'Payment Pending', 'Processing', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                      orderStatusFilter === st
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {st === 'all' ? 'All Orders' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-2xl bg-[#13161f] border border-white/[0.08]">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/90 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-white/[0.08]">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Total (PKR)</th>
                    <th className="p-3.5">TID / Ref</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-zinc-500">
                        No orders match the current criteria.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-white">{ord.id}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{ord.customerName}</div>
                          <div className="text-[11px] text-zinc-400">{ord.customerPhone}</div>
                        </td>
                        <td className="p-3.5 max-w-xs truncate">
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">
                          Rs. {ord.total.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          {ord.paymentReference ? (
                            <span className="text-amber-400 font-semibold">{ord.paymentReference}</span>
                          ) : (
                            <span className="text-zinc-600">Pending</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                                : ord.status === 'Payment Confirmed'
                                ? 'bg-blue-950/80 text-blue-300 border-blue-700/50'
                                : ord.status === 'Processing'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-700/50'
                                : ord.status === 'Cancelled'
                                ? 'bg-red-950/80 text-red-300 border-red-700/50'
                                : 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          {ord.status === 'Payment Pending' && (
                            <button
                              onClick={() => handleQuickConfirmPayment(ord.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
                              title="Verify Payment TID"
                            >
                              Verify Payment
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenOrderModal(ord)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Order Management Detailed Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                <div className="w-full max-w-2xl bg-[#13161f] border border-white/[0.1] rounded-3xl p-6 space-y-5 shadow-2xl my-8">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white font-mono">
                        Manage Order #{selectedOrder.id}
                      </h3>
                      <span className="text-xs text-zinc-400">
                        {selectedOrder.customerName} · {selectedOrder.customerEmail} · {selectedOrder.customerPhone}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Status update selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-semibold">Update Status</label>
                      <select
                        value={modalOrderStatus}
                        onChange={(e) => setModalOrderStatus(e.target.value)}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                      >
                        {[
                          'Placed',
                          'Payment Pending',
                          'Payment Confirmed',
                          'Processing',
                          'Delivered',
                          'Cancelled',
                          'Refunded',
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-300 font-semibold">Status Timeline Note</label>
                      <input
                        type="text"
                        placeholder="e.g. Verified via JazzCash 0300... / Credentials generated"
                        value={modalOrderNote}
                        onChange={(e) => setModalOrderNote(e.target.value)}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Delivery Credentials Input */}
                  <div className="space-y-1 text-xs">
                    <label className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      <span>Delivery Credentials (Visible to customer upon delivery)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Account Email: user@domain.com&#10;Password: SecretPass123!&#10;Profile / PIN: Profile 2 / 1234&#10;Access Link: https://..."
                      value={modalCredentials}
                      onChange={(e) => setModalCredentials(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-200 font-mono focus:outline-none"
                    />
                  </div>

                  {/* Subscription Validity Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Subscription Start Date</label>
                      <input
                        type="date"
                        value={modalStartDate}
                        onChange={(e) => setModalStartDate(e.target.value)}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Subscription End Date</label>
                      <input
                        type="date"
                        value={modalEndDate}
                        onChange={(e) => setModalEndDate(e.target.value)}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Internal Admin Note */}
                  <div className="space-y-1 text-xs">
                    <label className="text-zinc-400 font-medium">Internal Staff Notes</label>
                    <input
                      type="text"
                      placeholder="Internal remarks (not shown to customer)"
                      value={modalAdminNotes}
                      onChange={(e) => setModalAdminNotes(e.target.value)}
                      className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleSaveOrderModal}
                      disabled={updatingOrder}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-950 disabled:opacity-50 cursor-pointer"
                    >
                      {updatingOrder ? 'Saving...' : 'Save Order Details'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PRODUCTS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#13161f] border border-white/[0.08]">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-white/[0.1] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    category: 'AI & Automation',
                    price: 1999,
                    originalPrice: 2999,
                    duration: '1 Month Access',
                    deliveryMethod: 'Direct Email Credentials',
                    warranty: '30-Day Full Replacement Warranty',
                    stockStatus: 'in_stock',
                    featured: false,
                    shortDescription: '',
                    description: '',
                    features: ['Genuine License', 'Instant Delivery', 'Full Warranty'],
                    image: '/assets/chatgpt_suite.svg',
                    instructions: 'Credentials dispatched to email and WhatsApp.',
                  });
                  setShowProductModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-red-950 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Digital Tool</span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className={`p-5 rounded-2xl bg-[#13161f] border transition-all flex flex-col justify-between space-y-4 ${
                    prod.isArchived ? 'opacity-50 border-zinc-800' : 'border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-contain bg-zinc-900 p-1 border border-white/[0.06]"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{prod.name}</h4>
                          <span className="text-[10px] text-red-400 font-semibold">{prod.category}</span>
                        </div>
                      </div>
                      {prod.featured && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/40">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white font-bold">Rs. {prod.price.toLocaleString()}</span>
                      <span className="text-zinc-500 line-through">Rs. {prod.originalPrice.toLocaleString()}</span>
                    </div>

                    <div className="text-[11px] text-zinc-400">
                      Duration: <strong>{prod.duration}</strong> · Warranty: <strong>{prod.warranty}</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-emerald-400 font-semibold capitalize">
                      {prod.stockStatus.replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setShowProductModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                        title="Edit tool"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {!prod.isArchived && (
                        <button
                          onClick={() => handleArchiveProduct(prod.id)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400"
                          title="Archive tool"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Add / Edit Modal */}
            {showProductModal && editingProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                <form
                  onSubmit={handleSaveProduct}
                  className="w-full max-w-2xl bg-[#13161f] border border-white/[0.1] rounded-3xl p-6 space-y-4 shadow-2xl my-8 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <h3 className="text-base font-bold text-white">
                      {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Product Name *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Category *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.category || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Price (PKR) *</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.price ?? ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Original Price (PKR)</label>
                      <input
                        type="number"
                        value={editingProduct.originalPrice ?? ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Subscription Duration</label>
                      <input
                        type="text"
                        value={editingProduct.duration || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, duration: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Warranty Terms</label>
                      <input
                        type="text"
                        value={editingProduct.warranty || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, warranty: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Image URL / Asset Path</label>
                      <input
                        type="text"
                        value={editingProduct.image || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Stock Status</label>
                      <select
                        value={editingProduct.stockStatus || 'in_stock'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stockStatus: e.target.value as any })}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="featCheck"
                      checked={Boolean(editingProduct.featured)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                      className="rounded bg-zinc-900 border-white/[0.2] text-red-600"
                    />
                    <label htmlFor="featCheck" className="text-zinc-300 font-semibold cursor-pointer">
                      Feature on Storefront Homepage
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-medium">Short Description</label>
                    <input
                      type="text"
                      value={editingProduct.shortDescription || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                      className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-medium">Full Description</label>
                    <textarea
                      rows={3}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CUSTOMERS */}
        {/* ========================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl bg-[#13161f] border border-white/[0.08]">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/90 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-white/[0.08]">
                  <tr>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Total Orders</th>
                    <th className="p-3.5">Total Spent</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-white">{c.name}</td>
                      <td className="p-3.5 text-zinc-400">{c.email}</td>
                      <td className="p-3.5 text-zinc-400">{c.phone || 'N/A'}</td>
                      <td className="p-3.5 font-mono font-bold text-white">{c.ordersCount}</td>
                      <td className="p-3.5 font-mono font-bold text-white">Rs. {c.totalSpent.toLocaleString()}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            c.status === 'active' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleCustomerStatus(c.id, c.status)}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
                        >
                          {c.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: OFFERS & COUPONS */}
        {/* ========================================================= */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowCouponModal(true)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-950 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-lg text-white">{c.code}</span>
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-zinc-300">
                    Discount: <strong>{c.type === 'percentage' ? `${c.value}%` : `Rs. ${c.value}`}</strong>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Min Order: Rs. {c.minOrder.toLocaleString()} · Used: {c.usedCount} / {c.usageLimit}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Expires: {new Date(c.validUntil).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Create Coupon Modal */}
            {showCouponModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <form
                  onSubmit={handleCreateCoupon}
                  className="w-full max-w-md bg-[#13161f] border border-white/[0.1] rounded-3xl p-6 space-y-4 shadow-2xl text-xs"
                >
                  <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                    <h3 className="text-sm font-bold text-white">Create Discount Coupon</h3>
                    <button type="button" onClick={() => setShowCouponModal(false)} className="text-zinc-400">
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-medium">Coupon Code (Uppercase)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SUMMER2026"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white font-mono uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Type</label>
                      <select
                        value={newCoupon.type}
                        onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (PKR)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Discount Value</label>
                      <input
                        type="number"
                        required
                        value={newCoupon.value}
                        onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Min Order (PKR)</label>
                      <input
                        type="number"
                        value={newCoupon.minOrder}
                        onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-300 font-medium">Usage Limit</label>
                      <input
                        type="number"
                        value={newCoupon.usageLimit}
                        onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setShowCouponModal(false)}
                      className="px-4 py-2 text-zinc-400"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold">
                      Create Coupon
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: REVIEWS */}
        {/* ========================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white mr-2">{rev.userName}</span>
                      <span className="text-zinc-500">on {rev.productName}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rev.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-300'
                          : rev.status === 'rejected'
                          ? 'bg-red-950 text-red-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-zinc-700'}`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-zinc-300 italic">"{rev.comment}"</p>

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(rev.createdAt).toLocaleString()}
                    </span>
                    <div className="space-x-2">
                      {rev.status !== 'approved' && (
                        <button
                          onClick={() => handleReviewAction(rev.id, 'approved')}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      {rev.status !== 'rejected' && (
                        <button
                          onClick={() => handleReviewAction(rev.id, 'rejected')}
                          className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-[11px]"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="px-2.5 py-1 rounded bg-red-950 text-red-300 text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: MESSAGES */}
        {/* ========================================================= */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="p-12 text-center text-xs text-zinc-400">No contact inquiries received yet.</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-5 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-xs">{msg.subject}</h4>
                        <span className="text-zinc-400 text-[11px]">
                          From: {msg.name} ({msg.email} {msg.phone ? `· ${msg.phone}` : ''})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 bg-zinc-900/80 p-3 rounded-xl border border-white/[0.04]">
                      {msg.message}
                    </p>

                    {msg.reply && (
                      <div className="text-xs text-emerald-300 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
                        <strong>Reply:</strong> {msg.reply}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          setReplyMessageId(msg.id);
                          setReplyText(msg.reply || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
                      >
                        {msg.reply ? 'Edit Reply' : 'Send Reply'}
                      </button>
                    </div>

                    {replyMessageId === msg.id && (
                      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write reply to customer..."
                          className="w-full p-2 bg-zinc-900 rounded-xl border border-white/[0.1] text-xs text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setReplyMessageId(null)}
                            className="px-3 py-1 text-xs text-zinc-400"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReplyMessage(msg.id)}
                            className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold"
                          >
                            Send Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: BROADCAST NOTIFICATIONS */}
        {/* ========================================================= */}
        {activeTab === 'notifications' && (
          <div className="max-w-xl p-6 rounded-3xl bg-[#13161f] border border-white/[0.08] space-y-4 text-xs">
            <h3 className="text-base font-bold text-white font-['Syne',sans-serif]">
              Broadcast System Notification
            </h3>
            <p className="text-zinc-400">
              Send instant alert notifications into all customer account dashboards.
            </p>

            <form onSubmit={handleBroadcastNotification} className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Notification Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Sale: 20% OFF AI Subscriptions!"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Message Body *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details and coupon instructions..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Recipient Target</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                >
                  <option value="all">All Users &amp; Customers</option>
                  <option value="customer">Customers Only</option>
                  <option value="staff">Staff Only</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={sendingBroadcast}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingBroadcast ? 'Sending...' : 'Dispatch Broadcast'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 9: SETTINGS */}
        {/* ========================================================= */}
        {activeTab === 'settings' && settingsForm && (
          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs max-w-4xl">
            {/* General Store Identity */}
            <div className="p-6 rounded-3xl bg-[#13161f] border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-3">
                Store Branding &amp; Support Contacts
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Store Name</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Store Tagline</label>
                  <input
                    type="text"
                    value={settingsForm.storeTagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeTagline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Custom Logo URL (Replaces default)</label>
                  <input
                    type="text"
                    placeholder="https://... (or leave blank for standard vector logo)"
                    value={settingsForm.logoUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">WhatsApp Support Number (Updates Site-wide)</label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-medium">Support Email Address</label>
                  <input
                    type="email"
                    value={settingsForm.supportEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                  />
                </div>
              </div>
            </div>

            {/* Announcement Bar & Hero Headline */}
            <div className="p-6 rounded-3xl bg-[#13161f] border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-3">
                Announcement Bar &amp; Hero Content
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="annActive"
                    checked={settingsForm.announcementBarActive}
                    onChange={(e) => setSettingsForm({ ...settingsForm, announcementBarActive: e.target.checked })}
                    className="rounded bg-zinc-900 border-white/[0.2] text-red-600"
                  />
                  <label htmlFor="annActive" className="text-zinc-300 font-semibold cursor-pointer">
                    Enable Top Announcement Bar
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Announcement Bar Text</label>
                  <input
                    type="text"
                    value={settingsForm.announcementBarText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, announcementBarText: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Hero Section Headline</label>
                  <input
                    type="text"
                    value={settingsForm.heroHeadline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroHeadline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Hero Section Subheadline</label>
                  <textarea
                    rows={2}
                    value={settingsForm.heroSubheadline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSubheadline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Gateways Config */}
            <div className="p-6 rounded-3xl bg-[#13161f] border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-3">
                Pakistani Payment Methods Configuration
              </h3>

              {/* JazzCash */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/[0.06] space-y-2">
                <div className="font-bold text-white">JazzCash Account Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Account Title"
                    value={settingsForm.paymentInstructions.jazzcash.accountTitle}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentInstructions: {
                          ...settingsForm.paymentInstructions,
                          jazzcash: {
                            ...settingsForm.paymentInstructions.jazzcash,
                            accountTitle: e.target.value,
                          },
                        },
                      })
                    }
                    className="p-2 rounded-lg bg-zinc-950 border border-white/[0.1] text-white"
                  />
                  <input
                    type="text"
                    placeholder="Mobile Account Number"
                    value={settingsForm.paymentInstructions.jazzcash.accountNumber}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentInstructions: {
                          ...settingsForm.paymentInstructions,
                          jazzcash: {
                            ...settingsForm.paymentInstructions.jazzcash,
                            accountNumber: e.target.value,
                          },
                        },
                      })
                    }
                    className="p-2 rounded-lg bg-zinc-950 border border-white/[0.1] text-white font-mono"
                  />
                </div>
              </div>

              {/* EasyPaisa */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/[0.06] space-y-2">
                <div className="font-bold text-white">EasyPaisa Account Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Account Title"
                    value={settingsForm.paymentInstructions.easypaisa.accountTitle}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentInstructions: {
                          ...settingsForm.paymentInstructions,
                          easypaisa: {
                            ...settingsForm.paymentInstructions.easypaisa,
                            accountTitle: e.target.value,
                          },
                        },
                      })
                    }
                    className="p-2 rounded-lg bg-zinc-950 border border-white/[0.1] text-white"
                  />
                  <input
                    type="text"
                    placeholder="Mobile Account Number"
                    value={settingsForm.paymentInstructions.easypaisa.accountNumber}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentInstructions: {
                          ...settingsForm.paymentInstructions,
                          easypaisa: {
                            ...settingsForm.paymentInstructions.easypaisa,
                            accountNumber: e.target.value,
                          },
                        },
                      })
                    }
                    className="p-2 rounded-lg bg-zinc-950 border border-white/[0.1] text-white font-mono"
                  />
                </div>
              </div>

              {/* Raast / Bank */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/[0.06] space-y-2">
                <div className="font-bold text-white">Bank IBFT / Raast ID Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Account Title / Bank Name"
                    value={settingsForm.paymentInstructions.raast_bank.accountTitle}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentInstructions: {
                          ...settingsForm.paymentInstructions,
                          raast_bank: {
                            ...settingsForm.paymentInstructions.raast_bank,
                            accountTitle: e.target.value,
                          },
                        },
                      })
                    }
                    className="p-2 rounded-lg bg-zinc-950 border border-white/[0.1] text-white"
                  />
                  <input
                    type="text"
                    placeholder="Account Number / Raast ID"
                    value={settingsForm.paymentInstructions.raast_bank.accountNumber}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentInstructions: {
                          ...settingsForm.paymentInstructions,
                          raast_bank: {
                            ...settingsForm.paymentInstructions.raast_bank,
                            accountNumber: e.target.value,
                          },
                        },
                      })
                    }
                    className="p-2 rounded-lg bg-zinc-950 border border-white/[0.1] text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving...' : 'Save All Settings'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 10: STAFF & AUDIT LOGS */}
        {/* ========================================================= */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Staff Members with Administrative Privileges
              </h3>
              <button
                onClick={() => setShowStaffModal(true)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Invite Staff Member</span>
              </button>
            </div>

            {/* Staff list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map((st) => (
                <div key={st.id} className="p-5 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-xs">{st.name}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-950 text-red-300">
                      {st.role}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400">{st.email}</div>
                  <div className="text-[11px] text-zinc-500">
                    Permissions: {st.permissions.join(', ') || 'All standard'}
                  </div>
                </div>
              ))}
            </div>

            {/* Audit Log Table */}
            <div className="space-y-3 pt-6 border-t border-white/[0.08]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Full System Security Audit Trail
              </h3>

              <div className="overflow-x-auto rounded-2xl bg-[#13161f] border border-white/[0.08]">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/90 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-white/[0.08]">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Actor</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {auditActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-zinc-800/40">
                        <td className="p-3.5 font-mono text-[11px] text-zinc-500 shrink-0">
                          {new Date(act.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-bold text-white">{act.userName}</td>
                        <td className="p-3.5 uppercase text-[10px] text-red-400 font-semibold">{act.userRole}</td>
                        <td className="p-3.5 font-semibold text-zinc-200">{act.action}</td>
                        <td className="p-3.5 text-zinc-400">{act.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invite Staff Modal */}
            {showStaffModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <form
                  onSubmit={handleCreateStaff}
                  className="w-full max-w-md bg-[#13161f] border border-white/[0.1] rounded-3xl p-6 space-y-4 shadow-2xl text-xs"
                >
                  <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                    <h3 className="text-sm font-bold text-white">Add Staff Member</h3>
                    <button type="button" onClick={() => setShowStaffModal(false)} className="text-zinc-400">
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-medium">Name</label>
                    <input
                      type="text"
                      required
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-medium">Email</label>
                    <input
                      type="email"
                      required
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-medium">Phone</label>
                    <input
                      type="tel"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-medium">Temporary Password (min 6 chars)</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-medium">Role</label>
                    <select
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      className="w-full p-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                    >
                      <option value="staff">Staff (Orders &amp; Products)</option>
                      <option value="admin">Administrator (Full Access)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setShowStaffModal(false)}
                      className="px-4 py-2 text-zinc-400"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold">
                      Add Staff
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

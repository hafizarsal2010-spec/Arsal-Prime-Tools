import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, Activity, Notification } from '../types';
import { api } from '../services/api';
import {
  User as UserIcon,
  ShoppingBag,
  Bell,
  History,
  Shield,
  Key,
  LogOut,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  Lock,
  Edit2,
  ExternalLink
} from 'lucide-react';

export const CustomerAccountPage: React.FC = () => {
  const {
    user,
    token,
    loginUser,
    logoutUser,
    refreshUser,
    trackOrderDirect,
    viewProductDetails,
    showToast,
    notifications,
    refreshNotifications,
  } = useStore();

  // Auth form states
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard states
  const [dashboardTab, setDashboardTab] = useState<'profile' | 'orders' | 'subscriptions' | 'notifications' | 'activity'>('orders');
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [myActivities, setMyActivities] = useState<Activity[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile update form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
      loadCustomerData();
    }
  }, [user]);

  const loadCustomerData = async () => {
    try {
      setLoadingOrders(true);
      const [orderRes, actRes] = await Promise.all([
        api.getMyOrders(),
        api.getCustomerActivities(),
      ]);
      setMyOrders(orderRes.orders || []);
      setMyActivities(actRes.activities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Auth Actions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      const res = await api.login({ email: loginEmail, password: loginPassword });
      loginUser(res.user, res.token);
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      const res = await api.register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });
      loginUser(res.user, res.token);
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      const res = await api.resetPassword({
        email: resetEmail,
        newPassword: resetNewPassword,
      });
      showToast(res.message, 'success');
      setAuthTab('login');
      setLoginEmail(resetEmail);
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await api.updateProfile({
        name: profileName,
        phone: profilePhone,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      showToast(res.message || 'Profile updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      refreshUser();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    await api.markNotificationRead(id);
    refreshNotifications();
  };

  const handleMarkAllNotifsRead = async () => {
    await api.markAllNotificationsRead();
    refreshNotifications();
    showToast('All notifications marked as read', 'info');
  };

  // If user is not logged in: Show Auth Forms
  if (!user || !token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-[#13161f] border border-white/[0.08] rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
              <UserIcon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-['Syne',sans-serif]">
              Customer Account Portal
            </h1>
            <p className="text-xs text-zinc-400">
              Manage your digital orders, licenses, and verified subscription warranties.
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex rounded-xl bg-zinc-900/90 p-1 border border-white/[0.06]">
            <button
              onClick={() => setAuthTab('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                authTab === 'login' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthTab('register')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                authTab === 'register' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => setAuthTab('forgot')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                authTab === 'forgot' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Reset
            </button>
          </div>

          {/* Tab 1: Login */}
          {authTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-zinc-300 font-medium">Password</label>
                  <button
                    type="button"
                    onClick={() => setAuthTab('forgot')}
                    className="text-[11px] text-red-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-950/50 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? 'Signing in...' : 'Sign In to Account'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('ali.customer@example.com');
                    setLoginPassword('Customer@2026!');
                  }}
                  className="text-[11px] text-zinc-500 hover:text-red-400 underline"
                >
                  Quick fill demo customer credentials
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Register */}
          {authTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Raza"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="0300 1234567"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Password (min 6 characters) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Create secure password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-950/50 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? 'Creating account...' : 'Create Customer Account'}
              </button>
            </form>
          )}

          {/* Tab 3: Reset Password */}
          {authTab === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Account Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Set New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="New password (min 6 chars)"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-950/50 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? 'Resetting password...' : 'Update Password & Login'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Active subscriptions calculation
  const activeSubscriptions = myOrders.filter(
    (o) => o.status === 'Delivered' || o.status === 'Processing'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Profile Header */}
      <div className="p-6 rounded-3xl bg-[#13161f] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-extrabold text-xl shadow-xl shadow-red-950/50">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-['Syne',sans-serif]">{user.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/40">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {user.email} {user.phone && `· ${user.phone}`}
            </p>
          </div>
        </div>

        <button
          onClick={logoutUser}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-white/[0.08] transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/[0.08]">
        {[
          { id: 'orders', label: 'My Orders', icon: ShoppingBag, count: myOrders.length },
          { id: 'subscriptions', label: 'Active Subscriptions', icon: Calendar, count: activeSubscriptions.length },
          {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            count: notifications.filter((n) => !n.read).length,
          },
          { id: 'profile', label: 'Profile & Settings', icon: Edit2 },
          { id: 'activity', label: 'Activity Log', icon: History, count: myActivities.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = dashboardTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setDashboardTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-red-600' : 'bg-red-600 text-white'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: My Orders */}
      {dashboardTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-12 text-center text-xs text-zinc-400">Loading your orders...</div>
          ) : myOrders.length === 0 ? (
            <div className="p-16 rounded-3xl bg-[#13161f] border border-white/[0.08] text-center space-y-3">
              <ShoppingBag className="w-8 h-8 text-zinc-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No orders placed yet</h3>
              <p className="text-xs text-zinc-400">
                Explore our digital tools catalogue and purchase your favorite subscriptions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-white text-sm">
                        #{ord.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                            : ord.status === 'Payment Confirmed'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-700/50'
                            : ord.status === 'Processing'
                            ? 'bg-purple-950/80 text-purple-300 border-purple-700/50'
                            : 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-zinc-400">
                      <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                      <span className="font-mono font-bold text-white text-sm">
                        Rs. {ord.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-1 text-xs">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-300">
                        <span>
                          {item.quantity}x {item.name} ({item.duration})
                        </span>
                        <span className="font-mono text-zinc-400">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Credentials / Action */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {ord.status === 'Delivered' && ord.deliveryCredentials ? (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Key className="w-4 h-4" />
                        <span className="font-semibold">Credentials Ready in Details</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Payment reference: {ord.paymentReference || 'None'}</span>
                      </div>
                    )}

                    <button
                      onClick={() => trackOrderDirect(ord.id)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View Live Timeline &amp; Credentials</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Active Subscriptions with remaining days */}
      {dashboardTab === 'subscriptions' && (
        <div className="space-y-4">
          {activeSubscriptions.length === 0 ? (
            <div className="p-16 rounded-3xl bg-[#13161f] border border-white/[0.08] text-center space-y-3">
              <Calendar className="w-8 h-8 text-zinc-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No active subscriptions currently recorded</h3>
              <p className="text-xs text-zinc-400">
                When your order is delivered with validity dates, the remaining days countdown will display here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSubscriptions.map((sub) => {
                let remDays: number | null = null;
                if (sub.subscriptionStartDate && sub.subscriptionEndDate) {
                  const end = new Date(sub.subscriptionEndDate).getTime();
                  remDays = Math.max(0, Math.round((end - Date.now()) / (1000 * 60 * 60 * 24)));
                }

                return (
                  <div
                    key={sub.id}
                    className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-red-400 font-bold">#{sub.id}</span>
                        <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 text-[10px]">
                          Active Warranty
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">
                        {sub.items.map((i) => i.name).join(', ')}
                      </h4>

                      {remDays !== null ? (
                        <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.06] space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-zinc-400">Remaining Period:</span>
                            <span className="text-red-400 font-mono">{remDays} Days Left</span>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-red-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(10, (remDays / 30) * 100))}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400">
                          30-Day Replacement Warranty active.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => trackOrderDirect(sub.id)}
                      className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Access Details
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Notifications Center */}
      {dashboardTab === 'notifications' && (
        <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Account Notifications
            </h3>
            {notifications.some((n) => !n.read) && (
              <button
                onClick={handleMarkAllNotifsRead}
                className="text-xs text-red-400 hover:text-red-300 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06] text-xs">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`py-3.5 flex items-start justify-between gap-4 ${
                    !n.read ? 'bg-red-950/10' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{n.title}</span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                      )}
                    </div>
                    <p className="text-zinc-400 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => handleMarkNotifRead(n.id)}
                      className="text-[11px] text-zinc-400 hover:text-white shrink-0 px-2 py-1 rounded bg-zinc-800"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 4: Profile & Settings */}
      {dashboardTab === 'profile' && (
        <div className="max-w-2xl p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-3">
            Edit Contact &amp; Account Security
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Phone / WhatsApp Number</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-500" />
                <span>Change Password (Leave blank to keep unchanged)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400">New Password (min 6 chars)</label>
                  <input
                    type="password"
                    minLength={6}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md shadow-red-950/50 cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? 'Saving Changes...' : 'Save Profile Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content 5: Activity Log */}
      {dashboardTab === 'activity' && (
        <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-3">
            Your Account Activity History
          </h3>

          {myActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No recent activity recorded.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06] text-xs">
              {myActivities.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white">{act.action}</div>
                    <div className="text-zinc-400">{act.details}</div>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono shrink-0">
                    {new Date(act.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

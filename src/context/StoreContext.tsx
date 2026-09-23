import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Product, CartItem, SiteSettings, Notification } from '../types';
import { api } from '../services/api';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppliedCoupon {
  code: string;
  type: string;
  value: number;
  discount: number;
}

interface StoreContextType {
  user: User | null;
  token: string | null;
  settings: SiteSettings | null;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartTotal: number;
  appliedCoupon: AppliedCoupon | null;
  isCartOpen: boolean;
  activeView: string;
  selectedProductId: string | null;
  trackingOrderId: string | null;
  notifications: Notification[];
  unreadNotificationsCount: number;
  toasts: ToastState[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  setActiveView: (view: string) => void;
  viewProductDetails: (productId: string) => void;
  trackOrderDirect: (orderId: string) => void;
  loginUser: (user: User, token: string) => void;
  logoutUser: () => void;
  refreshUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  storeName: 'Arsal Prime Tools',
  storeTagline: 'Pakistan’s Premier Digital Tools & Subscription Marketplace',
  logoUrl: '',
  whatsappNumber: '+92 300 1234567',
  supportEmail: 'support@arsalprimetools.com',
  announcementBarText: '⚡ LIMITED TIME OFFER: Use code PRIME2026 for 15% OFF all AI & Developer Subscriptions! Instant Dispatch via Email & WhatsApp 🚀',
  announcementBarActive: true,
  heroHeadline: 'Genuine Digital Subscriptions at Pakistani Rupee Rates',
  heroSubheadline: 'Save up to 80% on genuine AI, SEO, design, and developer tools with local JazzCash, EasyPaisa & Raast bank payments and guaranteed replacement warranties.',
  currency: 'PKR',
  primaryColor: '#dc2626',
  paymentInstructions: {
    jazzcash: {
      title: 'JazzCash',
      accountTitle: 'Arsal Prime Tools / Hafiz Arsal',
      accountNumber: '0300-1234567',
      instructions: 'Open your JazzCash app, send money to Mobile Account 0300-1234567, and copy the 10 or 12-digit TID from SMS.',
    },
    easypaisa: {
      title: 'EasyPaisa',
      accountTitle: 'Arsal Prime Services',
      accountNumber: '0345-9876543',
      instructions: 'Open EasyPaisa app, select Send Money to EasyPaisa Mobile 0345-9876543, and enter the Transaction ID below.',
    },
    raast_bank: {
      title: 'Bank Transfer / Raast ID',
      accountTitle: 'Arsal Prime Tools (Meezan Bank Ltd)',
      accountNumber: '0101-0105893201 / Raast: 03001234567',
      instructions: 'Transfer funds from any 1Link bank app via IBFT or instant Raast ID to Meezan Bank, and provide bank reference number.',
    },
    nayapay: {
      title: 'NayaPay / SadaPay',
      accountTitle: 'Arsal Prime',
      accountNumber: 'NayaPay ID: @arsalprime / SadaPay: 03001234567',
      instructions: 'Send money to @arsalprime on NayaPay or SadaPay mobile account, and write down reference note.',
    }
  },
  termsOfService: 'All digital accounts and license keys provided by Arsal Prime Tools come with our stated replacement warranty. Accounts are strictly for personal or business ethical use.',
  refundPolicy: 'If a tool cannot be delivered or experiences unresolved issues within the warranty duration, we issue a prompt replacement or prorated refund back to your JazzCash, EasyPaisa, or bank account.',
  privacyPolicy: 'We respect your confidentiality. Delivery credentials and customer phone/email details are encrypted and strictly protected.',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('apt_token'));
  const [settings, setSettings] = useState<SiteSettings | null>(DEFAULT_SETTINGS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('apt_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('apt_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('apt_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Persist coupon
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('apt_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('apt_coupon');
      }
    } catch (e) {
      console.error(e);
    }
  }, [appliedCoupon]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await api.getSettings();
      if (res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('apt_token');
    if (!currentToken) {
      setUser(null);
      return;
    }
    try {
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
      }
    } catch {
      localStorage.removeItem('apt_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      return;
    }
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    refreshSettings();
    if (token) {
      refreshUser();
      refreshNotifications();
    }
  }, [token, refreshSettings, refreshUser, refreshNotifications]);

  const loginUser = (newUser: User, newToken: string) => {
    localStorage.setItem('apt_token', newToken);
    setToken(newToken);
    setUser(newUser);
    showToast(`Welcome back, ${newUser.name}!`, 'success');
  };

  const logoutUser = () => {
    localStorage.removeItem('apt_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
    showToast('Logged out successfully', 'info');
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.name}" to cart!`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await api.validateCoupon(code, cartSubtotal);
      if (res.valid) {
        setAppliedCoupon({
          code: res.coupon.code,
          type: res.coupon.type,
          value: res.coupon.value,
          discount: res.coupon.discount,
        });
        showToast(`Coupon ${res.coupon.code} applied! Saved Rs. ${res.coupon.discount.toLocaleString()}`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Invalid coupon', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Dynamic recalculation of discount if subtotal changes
  let currentDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      currentDiscount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
    } else {
      currentDiscount = Math.min(appliedCoupon.value, cartSubtotal);
    }
  }

  const cartTotal = Math.max(0, cartSubtotal - currentDiscount);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const viewProductDetails = (productId: string) => {
    setSelectedProductId(productId);
    setActiveView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const trackOrderDirect = (orderId: string) => {
    setTrackingOrderId(orderId);
    setActiveView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        token,
        settings,
        cart,
        cartCount,
        cartSubtotal,
        cartTotal,
        appliedCoupon: appliedCoupon ? { ...appliedCoupon, discount: currentDiscount } : null,
        isCartOpen,
        activeView,
        selectedProductId,
        trackingOrderId,
        notifications,
        unreadNotificationsCount,
        toasts,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        setActiveView,
        viewProductDetails,
        trackOrderDirect,
        loginUser,
        logoutUser,
        refreshUser,
        refreshSettings,
        refreshNotifications,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

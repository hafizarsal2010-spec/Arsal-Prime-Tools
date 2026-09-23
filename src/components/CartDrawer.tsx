import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, Zap } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    closeCart,
    cart,
    cartCount,
    cartSubtotal,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    setActiveView,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponInput.trim());
    setIsApplying(false);
    setCouponInput('');
  };

  const handleProceedCheckout = () => {
    closeCart();
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#13161d] text-zinc-100 border-l border-white/[0.08] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white font-['Syne',sans-serif]">
                Shopping Bag
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-white/[0.08] flex items-center justify-center text-zinc-400">
                  <Zap className="w-8 h-8 text-red-500/70" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">Your bag is empty</h3>
                  <p className="text-xs text-zinc-400 max-w-xs">
                    Explore our genuine digital tools, AI subscriptions, and developer licenses.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    setActiveView('catalogue');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-lg shadow-red-900/30"
                >
                  Browse Tools &amp; Accounts
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/[0.06] hover:border-white/[0.12] transition-colors flex gap-3.5"
                  >
                    <div className="w-16 h-16 rounded-lg bg-zinc-800 shrink-0 overflow-hidden border border-white/[0.06] p-1 flex items-center justify-center">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors p-0.5"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {item.product.duration} · {item.product.deliveryMethod}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.04]">
                        {/* Quantity Stepper */}
                        <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-white/[0.06]">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-xs font-bold text-white font-mono tabular-nums">
                            Rs. {(item.product.price * item.quantity).toLocaleString()}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] text-zinc-500 font-mono">
                              Rs. {item.product.price.toLocaleString()} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer (Only when cart has items) */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-white/[0.08] bg-zinc-950/60 space-y-4">
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-medium">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Code: <strong>{appliedCoupon.code}</strong></span>
                      <span className="text-emerald-400">(-Rs. {appliedCoupon.discount.toLocaleString()})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-zinc-400 hover:text-zinc-100 p-1"
                      title="Remove coupon"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. PRIME2026)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full bg-zinc-900 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500 font-mono uppercase"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplying || !couponInput.trim()}
                      className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      {isApplying ? 'Checking...' : 'Apply'}
                    </button>
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-zinc-200">
                    Rs. {cartSubtotal.toLocaleString()}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-mono tabular-nums">
                      - Rs. {appliedCoupon.discount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/[0.08] flex justify-between text-sm font-bold text-white">
                  <span>Total Amount (PKR)</span>
                  <span className="text-base text-red-500 font-mono tabular-nums">
                    Rs. {cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-900/60 p-2 rounded-lg border border-white/[0.04]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Replacement Warranty · Fast WhatsApp / Email Dispatch</span>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedCheckout}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

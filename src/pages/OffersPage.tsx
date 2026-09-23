import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Coupon } from '../types';
import { api } from '../services/api';
import { Tag, Copy, Check, Clock, Sparkles, ArrowRight } from 'lucide-react';

export const OffersPage: React.FC = () => {
  const { applyCoupon, setActiveView, showToast, cartCount } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoupons() {
      try {
        setLoading(true);
        const res = await api.getActiveCoupons();
        setCoupons(res.coupons || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Code "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleApply = async (code: string) => {
    if (cartCount === 0) {
      handleCopy(code);
      showToast(`Code "${code}" copied. Add tools to your cart to use it!`, 'info');
      setActiveView('catalogue');
      return;
    }
    const success = await applyCoupon(code);
    if (success) {
      showToast(`Code "${code}" applied to your current cart!`, 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-white/[0.08] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Verified Deals &amp; Discounts</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Syne',sans-serif]">
          Active Offers &amp; Promo Coupons
        </h1>
        <p className="text-xs text-zinc-400 max-w-2xl">
          Apply these limited-time promotional vouchers during checkout to save even more on digital tools and subscriptions. Expired deals are automatically removed.
        </p>
      </div>

      {/* Offers Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-zinc-900/40 animate-pulse border border-white/[0.06]" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#13161f] border border-white/[0.08] text-center space-y-3">
          <Tag className="w-8 h-8 text-zinc-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No active public coupons at this moment</h3>
          <p className="text-xs text-zinc-400">
            Check back regularly or join our WhatsApp community for flash sales and seasonal promo codes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const isCopied = copiedCode === coupon.code;
            return (
              <div
                key={coupon.id}
                className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] hover:border-red-500/40 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group"
              >
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-2xl rounded-full pointer-events-none group-hover:bg-red-600/20 transition-all" />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest">
                      Special Voucher
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Expires {new Date(coupon.validUntil).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <div>
                    <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                      {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `Rs. ${coupon.value} OFF`}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      {coupon.minOrder > 0
                        ? `Valid on orders of Rs. ${coupon.minOrder.toLocaleString()} or more.`
                        : 'No minimum order required.'}
                    </p>
                  </div>

                  {/* Coupon Code Pill */}
                  <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-white/[0.08]">
                    <span className="font-mono font-extrabold text-base text-white tracking-widest pl-2">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between relative z-10">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {coupon.usageLimit - coupon.usedCount} uses remaining
                  </span>
                  <button
                    onClick={() => handleApply(coupon.code)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-red-950/40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Apply to Bag</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

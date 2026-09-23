import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import {
  ShieldCheck,
  CheckCircle,
  Copy,
  Tag,
  ArrowRight,
  Zap,
  Clock,
  AlertCircle
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
    user,
    settings,
    setActiveView,
    trackOrderDirect,
    showToast,
  } = useStore();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryEmail, setDeliveryEmail] = useState(user?.email || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.phone || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa' | 'raast_bank' | 'nayapay'>('jazzcash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProofNote, setPaymentProofNote] = useState('');

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-400 mx-auto">
          <Zap className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white font-['Syne',sans-serif]">Your bag is currently empty</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Add digital tools or subscriptions to proceed with checkout.
        </p>
        <button
          onClick={() => setActiveView('catalogue')}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-lg shadow-red-950/40"
        >
          Browse Catalogue
        </button>
      </div>
    );
  }

  const selectedPaymentInfo = settings?.paymentInstructions?.[paymentMethod] || {
    title: 'Manual Payment',
    accountTitle: 'Arsal Prime Tools',
    accountNumber: '0300-1234567',
    instructions: 'Send money to our mobile account and enter the TID number.',
  };

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    showToast(`Account number copied to clipboard!`, 'info');
    setTimeout(() => setCopiedAccount(false), 3000);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponCodeInput.trim());
    setIsApplyingCoupon(false);
    setCouponCodeInput('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMsg('Please complete your full name, contact email, and phone number.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        deliveryEmail: deliveryEmail.trim() || customerEmail.trim(),
        whatsappNumber: whatsappNumber.trim() || customerPhone.trim(),
        deliveryNotes: deliveryNotes.trim() || undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          duration: item.product.duration,
          deliveryMethod: item.product.deliveryMethod,
        })),
        couponCode: appliedCoupon?.code || null,
        paymentMethod,
        paymentReference: paymentReference.trim(),
        paymentProofNote: paymentProofNote.trim(),
        userId: user?.id,
      };

      const res = await api.createOrder(payload);

      clearCart();
      showToast(res.message || 'Order placed successfully!', 'success');
      trackOrderDirect(res.order.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Title */}
      <div className="border-b border-white/[0.08] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Syne',sans-serif]">
          Secure Digital Checkout
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Complete your contact &amp; payment verification. All licenses are covered by our replacement warranty.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer Details & Payment Options */}
        <div className="lg:col-span-7 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Customer Information */}
          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/[0.06] pb-3">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Customer Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-zinc-400 font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ali"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Account &amp; Receipt Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="0300 1234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Digital Delivery Preferences */}
          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/[0.06] pb-3">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Digital Credentials Dispatch Destination</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Email for Login / Invitation</label>
                <input
                  type="email"
                  placeholder="Where should we dispatch credentials?"
                  value={deliveryEmail}
                  onChange={(e) => setDeliveryEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-zinc-500">Defaults to your billing email if left blank</span>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">WhatsApp for Instant Alert</label>
                <input
                  type="tel"
                  placeholder="0300 1234567"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-zinc-500">For instant SMS/WhatsApp credential ping</span>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-zinc-400 font-medium">Delivery Notes / Specific Preferences (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please invite my existing Canva/Semrush email or send fresh profile credentials"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method & Instructions */}
          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/[0.06] pb-3">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Pakistani Payment Gateway</span>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'jazzcash', label: 'JazzCash' },
                { id: 'easypaisa', label: 'EasyPaisa' },
                { id: 'raast_bank', label: 'Raast / Bank' },
                { id: 'nayapay', label: 'NayaPay / Sada' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'bg-red-600/20 border-red-500 text-white shadow-md'
                      : 'bg-zinc-900 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Interactive Payment Instructions Box */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-red-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Account Title:</span>
                <span className="font-bold text-white">{selectedPaymentInfo.accountTitle}</span>
              </div>

              <div className="flex items-center justify-between text-xs bg-zinc-950 p-2.5 rounded-lg border border-white/[0.08]">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Account / Mobile / Raast ID:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {selectedPaymentInfo.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAccount(selectedPaymentInfo.accountNumber)}
                  className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {selectedPaymentInfo.instructions}
              </p>
            </div>

            {/* Payment Verification Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold flex items-center justify-between">
                  <span>Transaction ID (TID) / Reference Number *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1029384756 (or submit later)"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500 font-mono"
                />
                <span className="text-[10px] text-zinc-500">
                  If you haven't transferred yet, you can also submit your TID from your Order Tracking page.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Sender Name / Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. Sent from Ali 0312..."
                  value={paymentProofNote}
                  onChange={(e) => setPaymentProofNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-zinc-500">Helps fast-track manual transaction verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-6 sticky top-24">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-3">
              Order Summary
            </h3>

            {/* Itemized list */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white truncate">{item.product.name}</div>
                    <div className="text-[11px] text-zinc-500">
                      Qty: {item.quantity} · {item.product.duration}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-white tabular-nums">
                    Rs. {(item.product.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-3 border-t border-white/[0.06]">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong></span>
                    <span className="text-emerald-400">(-Rs. {appliedCoupon.discount.toLocaleString()})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-zinc-400 hover:text-white p-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. PRIME2026)"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-zinc-900 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white uppercase font-mono placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCodeInput.trim()}
                    className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-200">Rs. {cartSubtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span className="font-mono">- Rs. {appliedCoupon.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Instant Digital Delivery</span>
                <span className="text-emerald-400 font-semibold">FREE (WhatsApp &amp; Email)</span>
              </div>
              <div className="pt-3 border-t border-white/[0.08] flex justify-between items-baseline text-sm font-bold text-white">
                <span>Grand Total (PKR)</span>
                <span className="text-xl text-red-500 font-mono tabular-nums">
                  Rs. {cartTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 transition-all disabled:opacity-60 cursor-pointer"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Place Order & Get Order ID'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust reassurance */}
            <div className="text-[11px] text-zinc-400 space-y-1.5 pt-2">
              <div className="flex items-center gap-2 text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span>Replacement Warranty Protection</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Credentials dispatched upon TID verification</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

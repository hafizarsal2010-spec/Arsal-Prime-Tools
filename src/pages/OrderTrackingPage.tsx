import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { api } from '../services/api';
import {
  Search,
  CheckCircle,
  Clock,
  ShieldCheck,
  Key,
  Copy,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Calendar,
  Send
} from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { trackingOrderId, user, settings, showToast } = useStore();

  const [orderIdInput, setOrderIdInput] = useState(trackingOrderId || '');
  const [verificationInput, setVerificationInput] = useState(user?.email || user?.phone || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Payment update form
  const [paymentTid, setPaymentTid] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  useEffect(() => {
    if (trackingOrderId) {
      setOrderIdInput(trackingOrderId);
      // Auto attempt track if user email is available
      if (user?.email) {
        setVerificationInput(user.email);
        performTrack(trackingOrderId, user.email);
      }
    }
  }, [trackingOrderId, user]);

  const performTrack = async (oid: string, ver: string) => {
    if (!oid.trim() || !ver.trim()) {
      setErrorMsg('Please enter both Order ID and your Email or Phone Number.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.trackOrder(oid.trim(), ver.trim());
      setOrder(res.order);
      setPaymentTid(res.order.paymentReference || '');
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to find order. Please verify details.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performTrack(orderIdInput, verificationInput);
  };

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!paymentTid.trim()) {
      showToast('Please enter your Transaction ID (TID)', 'error');
      return;
    }

    try {
      setSubmittingPayment(true);
      const res = await api.submitPaymentProof(order.id, {
        paymentReference: paymentTid.trim(),
        paymentProofNote: paymentNote.trim(),
      });
      setOrder(res.order);
      showToast('Payment reference submitted! Verification in progress.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit payment details', 'error');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCopyCredentials = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    showToast('Credentials copied to clipboard!', 'success');
    setTimeout(() => setCopiedCreds(false), 3000);
  };

  // Remaining subscription days calculation
  let remainingDays: number | null = null;
  let totalDays: number | null = null;
  let progressPercent = 0;

  if (order?.subscriptionStartDate && order?.subscriptionEndDate) {
    const start = new Date(order.subscriptionStartDate).getTime();
    const end = new Date(order.subscriptionEndDate).getTime();
    const now = Date.now();
    totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    remainingDays = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24)));
    progressPercent = Math.min(100, Math.max(0, Math.round((remainingDays / totalDays) * 100)));
  }

  const cleanWhatsApp = (settings?.whatsappNumber || '+923001234567').replace(/[^0-9]/g, '');
  const waUrl = order
    ? `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
        `Hello Arsal Prime Tools, I need assistance with Order #${order.id} (${order.status}).`
      )}`
    : `https://wa.me/${cleanWhatsApp}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2 border-b border-white/[0.08] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif]">
          Order Tracking &amp; Subscription Timeline
        </h1>
        <p className="text-xs text-zinc-400 max-w-lg mx-auto">
          Enter your Order Number and verification detail (email or phone) to view real-time status, live progress timeline, and delivered credentials.
        </p>
      </div>

      {/* Tracking Form */}
      <form
        onSubmit={handleTrackSubmit}
        className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] shadow-xl space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-300 font-medium">Order Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. APT-2026-1042"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white uppercase font-mono placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-300 font-medium">Verification Email or Phone *</label>
            <input
              type="text"
              required
              placeholder="Email or phone used at checkout"
              value={verificationInput}
              onChange={(e) => setVerificationInput(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{loading ? 'Tracking Order...' : 'Track Order Progress'}</span>
          </button>
        </div>
      </form>

      {/* Order Details Display Card */}
      {order && (
        <div className="space-y-6">
          {/* Status Header */}
          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-mono font-extrabold text-white">#{order.id}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                      : order.status === 'Payment Confirmed'
                      ? 'bg-blue-950/80 text-blue-300 border-blue-700/50'
                      : order.status === 'Processing'
                      ? 'bg-purple-950/80 text-purple-300 border-purple-700/50'
                      : order.status === 'Cancelled' || order.status === 'Refunded'
                      ? 'bg-red-950/80 text-red-300 border-red-700/50'
                      : 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Placed on {new Date(order.createdAt).toLocaleString()} · Recipient: {order.customerName}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs text-zinc-400">Total Amount</div>
              <div className="text-xl font-mono font-extrabold text-white">
                Rs. {order.total.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Active Subscription Countdown (if dates are set) */}
          {remainingDays !== null && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Calendar className="w-4 h-4 text-red-400" />
                  <span>Subscription Validity &amp; Remaining Days</span>
                </div>
                <span className="font-mono font-bold text-red-400 text-sm">
                  {remainingDays} Days Left
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-600 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>Start: {new Date(order.subscriptionStartDate!).toLocaleDateString()}</span>
                <span>End: {new Date(order.subscriptionEndDate!).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* Credentials Delivery Box (If Delivered) */}
          {order.status === 'Delivered' && order.deliveryCredentials ? (
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-600/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Key className="w-4 h-4" />
                  <span>Your Digital Credentials &amp; Access Details</span>
                </div>
                <button
                  onClick={() => handleCopyCredentials(order.deliveryCredentials!)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCreds ? 'Copied' : 'Copy All'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-black/70 border border-emerald-800/40 font-mono text-xs text-emerald-200 whitespace-pre-wrap select-all leading-relaxed">
                {order.deliveryCredentials}
              </div>

              <p className="text-[11px] text-zinc-400">
                Credentials have also been dispatched to <strong>{order.deliveryEmail}</strong> and WhatsApp <strong>{order.whatsappNumber}</strong>. Keep them secure.
              </p>
            </div>
          ) : order.status === 'Payment Pending' ? (
            <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-600/40 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>Payment Verification In Progress</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                We have received your payment reference (<strong>{order.paymentReference || 'Pending TID'}</strong>). Our verification team is confirming your JazzCash / EasyPaisa / Raast transfer. Your access details will display above and be dispatched via WhatsApp as soon as approved.
              </p>
            </div>
          ) : order.status === 'Placed' ? (
            <div className="p-6 rounded-2xl bg-[#13161f] border border-red-500/30 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Payment Reference Needed to Start Processing</span>
              </div>
              <p className="text-xs text-zinc-300">
                Please transfer <strong>Rs. {order.total.toLocaleString()}</strong> to our account and submit your Transaction ID (TID) below:
              </p>

              <form onSubmit={handleSubmitPaymentProof} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Enter 10-12 digit Transaction ID (TID)"
                    value={paymentTid}
                    onChange={(e) => setPaymentTid(e.target.value)}
                    className="p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white font-mono focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Sender name / mobile account (optional)"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingPayment ? 'Submitting...' : 'Submit Payment Reference'}</span>
                </button>
              </form>
            </div>
          ) : null}

          {/* Progress Timeline */}
          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Dated Progress Timeline
            </h3>

            <div className="relative pl-6 border-l-2 border-zinc-800 space-y-6">
              {order.timeline.map((entry, idx) => (
                <div key={idx} className="relative">
                  {/* Dot */}
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-red-600 border-4 border-[#13161f]" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{entry.status}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {entry.note}
                      </p>
                    )}
                    <div className="text-[10px] text-zinc-500">
                      Logged by: {entry.actor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ordered Items Table */}
          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Ordered Digital Subscriptions
            </h3>
            <div className="divide-y divide-white/[0.06] text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white">{item.name}</div>
                    <div className="text-[11px] text-zinc-500">
                      Qty: {item.quantity} · {item.duration} · {item.deliveryMethod}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-white tabular-nums">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Need help with order? WhatsApp CTA */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center justify-between gap-4">
            <div className="text-xs text-zinc-300">
              Need immediate help or replacement for Order <strong>#{order.id}</strong>?
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Admin</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

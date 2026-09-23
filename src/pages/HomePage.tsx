import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Copy,
  Check,
  Layers,
  Search
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { settings, setActiveView, showToast } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [pRes, cRes] = await Promise.all([
          api.getProducts({ featured: true }),
          api.getCategories(),
        ]);
        setProducts(pRes.products || []);
        setCategories(cRes.categories || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    showToast(`Coupon code ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-white/[0.08] bg-gradient-to-b from-[#141820] via-[#0f1116] to-[#0b0d11]">
        {/* Subtle Ambient Red Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Pakistan’s #1 Digital Tool &amp; Account Marketplace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-['Syne',sans-serif]">
              {settings?.heroHeadline || 'Genuine Digital Subscriptions at Pakistani Rupee Rates'}
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              {settings?.heroSubheadline ||
                'Save up to 80% on genuine AI, SEO, design, and developer tools with local JazzCash, EasyPaisa & Raast bank payments and guaranteed replacement warranties.'}
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  setActiveView('catalogue');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm shadow-xl shadow-red-950/50 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Browse All 50+ Tools</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveView('track');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-white/[0.12] font-semibold text-sm transition-all cursor-pointer"
              >
                <span>Track Existing Order</span>
              </button>
            </div>

            {/* Trust Badges Bar */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto border-t border-white/[0.06] text-xs text-zinc-400">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
                <span>100% Replacement Warranty</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>15-Min Instant Dispatch</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-emerald-400 shrink-0 fill-current" />
                <span>5,000+ Verified Orders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Product Categories Filter Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-['Syne',sans-serif]">
              Explore by Category
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Curated tools for programmers, content creators, marketers, and researchers.
            </p>
          </div>
          <button
            onClick={() => setActiveView('catalogue')}
            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveView('catalogue');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-4 rounded-xl bg-[#13161f] border border-white/[0.08] hover:border-red-500/50 hover:bg-[#181d28] transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                  {cat.name}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                  {cat.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Tools & Subscriptions Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
              Handpicked Pro Subscriptions
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Syne',sans-serif]">
              Featured Digital Accounts
            </h2>
          </div>
          <button
            onClick={() => setActiveView('catalogue')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold border border-white/[0.08] transition-colors"
          >
            <span>Full Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 bg-zinc-900/40 rounded-2xl animate-pulse border border-white/[0.05]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Active Offers & Deals Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/80 via-[#201015] to-[#141820] border border-red-600/30 p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <div className="inline-block px-3 py-1 rounded bg-red-600 text-white font-bold text-xs uppercase tracking-wider">
                Special Pakistani Freelancer Discount
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif]">
                Get 15% OFF On Any AI Or Developer Plan
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Use our verified voucher code during checkout to enjoy instant 15% discount on ChatGPT Plus, Claude Pro, GitHub Copilot, and more.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 bg-zinc-950/90 border border-red-500/30 p-5 rounded-2xl backdrop-blur-md shadow-xl">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Voucher Code
              </div>
              <div className="flex items-center gap-3 bg-zinc-900 border border-white/[0.1] px-4 py-2 rounded-xl font-mono text-lg font-extrabold text-white tracking-widest">
                <span>PRIME2026</span>
                <button
                  onClick={() => handleCopyCoupon('PRIME2026')}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Copy coupon code"
                >
                  {copiedCoupon ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[10px] text-zinc-400">
                Min. order Rs. 1,500 · Valid until Dec 2026
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why Choose Arsal Prime Tools */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif]">
            Why 5,000+ Pakistani Creators Trust Arsal Prime
          </h2>
          <p className="text-xs text-zinc-400">
            We solve international credit card payment barriers with local PKR ease and rock-solid warranty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Instant WhatsApp Dispatch</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No waiting days for approvals. As soon as payment TID is verified, credentials arrive in your account dashboard and WhatsApp.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Guaranteed Warranty</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              If an account suffers any downtime or credential issue, our team resolves or replaces it with zero hassle during the subscription period.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Pakistani Rupee Pricing</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Avoid high currency exchange markups, state bank international card restrictions, and foreign taxes. Pay cleanly in PKR.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">24/7 Priority Support</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dedicated Pakistani customer care team available on WhatsApp and email from 9:00 AM to 12:00 Midnight PKT daily.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews & Social Proof */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="flex items-center justify-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif]">
            Verified Customer Reviews
          </h2>
          <p className="text-xs text-zinc-400">
            Real feedback from Pakistani developers, agencies, and students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                "Super fast delivery! Received ChatGPT Plus login credentials within 10 minutes of JazzCash payment confirmation. Canvas and GPT-4o working smoothly without issues. 10/10 service."
              </p>
            </div>
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">Hamza Khan</div>
                <div className="text-[11px] text-zinc-500">Full-Stack Engineer, Lahore</div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Verified Buyer
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                "Semrush portal works with zero downtime. We use it daily for client keyword audits and rank tracking. Great prices in PKR instead of paying expensive dollar rates on international cards."
              </p>
            </div>
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">Bilal Ahmad</div>
                <div className="text-[11px] text-zinc-500">SEO Agency Director, Islamabad</div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Verified Buyer
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#13161f] border border-white/[0.08] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                "Canva Pro was activated directly onto my personal Gmail account within 15 minutes. All Pro fonts, magic background remover, and brand kits are unlocked. Highly recommended!"
              </p>
            </div>
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">Ayesha Tariq</div>
                <div className="text-[11px] text-zinc-500">Graphic Designer, Karachi</div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Verified Buyer
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

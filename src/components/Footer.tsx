import React from 'react';
import { useStore } from '../context/StoreContext';
import { Shield, Clock, HelpCircle, MessageSquare, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setActiveView } = useStore();

  const handleNav = (view: string) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanWhatsApp = (settings?.whatsappNumber || '+923001234567').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent('Hello Arsal Prime Tools, I would like to inquire about digital tool subscriptions.')}`;

  return (
    <footer className="bg-[#0b0d11] border-t border-white/[0.08] text-zinc-400 text-xs">
      {/* Upper Value Proposition Bar */}
      <div className="border-b border-white/[0.06] bg-[#0d1016]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Instant 15-Min Dispatch</div>
              <div className="text-xs text-zinc-400">Credentials delivered via Email and WhatsApp</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Guaranteed Warranty</div>
              <div className="text-xs text-zinc-400">Full 30-Day or 365-Day replacement guarantee</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Local Pakistani Payments</div>
              <div className="text-xs text-zinc-400">Pay directly via JazzCash, EasyPaisa &amp; Raast</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Tagline */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-red-950">
              AP
            </div>
            <span className="text-base font-extrabold text-white tracking-tight font-['Syne',sans-serif]">
              {settings?.storeName || 'Arsal Prime Tools'}
            </span>
          </div>
          <p className="text-zinc-400 leading-relaxed text-xs">
            {settings?.storeTagline ||
              'Pakistan’s trusted destination for genuine digital tool subscriptions, SEO portals, and developer licenses.'}
          </p>
          <div className="pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Support</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Store Navigation</h3>
          <ul className="space-y-2">
            <li>
              <button onClick={() => handleNav('home')} className="hover:text-white transition-colors">
                Home
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('catalogue')} className="hover:text-white transition-colors">
                All Products &amp; Tools
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('offers')} className="hover:text-white transition-colors">
                Active Deals &amp; Coupons
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('track')} className="hover:text-white transition-colors">
                Track Your Order
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('contact')} className="hover:text-white transition-colors">
                Customer Support &amp; FAQ
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Popular Subscriptions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Popular Subscriptions</h3>
          <ul className="space-y-2">
            <li className="hover:text-white transition-colors cursor-pointer" onClick={() => handleNav('catalogue')}>
              ChatGPT Plus &amp; Canvas
            </li>
            <li className="hover:text-white transition-colors cursor-pointer" onClick={() => handleNav('catalogue')}>
              Semrush Guru SEO Suite
            </li>
            <li className="hover:text-white transition-colors cursor-pointer" onClick={() => handleNav('catalogue')}>
              Claude Pro Sonnet 3.7
            </li>
            <li className="hover:text-white transition-colors cursor-pointer" onClick={() => handleNav('catalogue')}>
              Canva Pro 1-Year Personal
            </li>
            <li className="hover:text-white transition-colors cursor-pointer" onClick={() => handleNav('catalogue')}>
              GitHub Copilot Business
            </li>
          </ul>
        </div>

        {/* Col 4: Payment Methods & Admin */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Accepted Payments</h3>
          <p className="text-xs text-zinc-400">
            Pay safely in PKR with real-time verification:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-white/[0.08] text-[11px] font-semibold text-zinc-300">
              JazzCash
            </span>
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-white/[0.08] text-[11px] font-semibold text-zinc-300">
              EasyPaisa
            </span>
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-white/[0.08] text-[11px] font-semibold text-zinc-300">
              Raast IBFT
            </span>
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-white/[0.08] text-[11px] font-semibold text-zinc-300">
              NayaPay / SadaPay
            </span>
          </div>
          <div className="pt-3 border-t border-white/[0.06]">
            <button
              onClick={() => handleNav('admin')}
              className="text-zinc-500 hover:text-red-400 text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Admin Management Dashboard</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/[0.06] py-6 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} {settings?.storeName || 'Arsal Prime Tools'}. All rights reserved. Registered Digital Vendor.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => handleNav('contact')} className="hover:text-zinc-300">
              Terms of Service
            </button>
            <span>·</span>
            <button onClick={() => handleNav('contact')} className="hover:text-zinc-300">
              Refund Policy
            </button>
            <span>·</span>
            <button onClick={() => handleNav('contact')} className="hover:text-zinc-300">
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Action Button */}
      <aside aria-label="Support contacts">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-950/60 font-semibold text-xs border border-emerald-400/40 transition-all hover:scale-105"
          title="Chat with Arsal Prime Support on WhatsApp"
        >
          <MessageSquare className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">WhatsApp Help ({settings?.whatsappNumber || '+92 300 1234567'})</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </aside>
    </footer>
  );
};

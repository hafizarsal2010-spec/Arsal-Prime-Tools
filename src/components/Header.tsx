import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, User, Shield, Menu, X, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    settings,
    cartCount,
    openCart,
    user,
    activeView,
    setActiveView,
    unreadNotificationsCount,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  const navLinks = [
    { label: 'Home', view: 'home' },
    { label: 'Catalogue', view: 'catalogue' },
    { label: 'Offers & Deals', view: 'offers' },
    { label: 'Track Order', view: 'track' },
    { label: 'Contact', view: 'contact' },
  ];

  const handleNav = (view: string) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showAnnouncement = settings?.announcementBarActive && settings?.announcementBarText && !announcementDismissed;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0f1115]/95 backdrop-blur-md border-b border-white/[0.08]">
      {/* 1. Editable Announcement Bar */}
      {showAnnouncement && (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white text-xs font-medium py-2 px-4 shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 text-center truncate tracking-wide">
              {settings.announcementBarText}
            </div>
            <button
              onClick={() => setAnnouncementDismissed(true)}
              className="text-white/80 hover:text-white shrink-0 text-xs px-1 hover:bg-black/20 rounded"
              title="Dismiss announcement"
              aria-label="Dismiss announcement"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Bar (Three-Zone Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark / Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.storeName}
              className="h-10 w-auto object-contain"
              onError={(e) => {
                // fallback to default vector logo if custom image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-950/40 border border-red-500/30 group-hover:scale-105 transition-transform duration-200">
              <span className="font-extrabold text-white text-lg tracking-wider">AP</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-red-400 transition-colors uppercase font-['Syne',sans-serif]">
              {settings?.storeName || 'Arsal Prime Tools'}
            </span>
            <span className="text-[10px] tracking-widest text-red-400 font-semibold uppercase -mt-0.5">
              Digital Subscriptions
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = activeView === link.view;
            return (
              <button
                key={link.view}
                onClick={() => handleNav(link.view)}
                className={`relative py-1 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Cart & Customer / Admin) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Switch Link */}
          <button
            onClick={() => handleNav('admin')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeView === 'admin'
                ? 'bg-red-600/20 border-red-500/50 text-red-300'
                : 'bg-zinc-900/80 border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Admin Dashboard"
          >
            <Shield className="w-3.5 h-3.5 text-red-400" />
            <span>Admin</span>
          </button>

          {/* Customer Account Button */}
          <button
            onClick={() => handleNav('account')}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeView === 'account'
                ? 'bg-zinc-800 border-white/20 text-white'
                : 'bg-zinc-900/80 border-white/[0.08] text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <User className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">
              {user ? user.name.split(' ')[0] : 'Account'}
            </span>
            {user && unreadNotificationsCount > 0 && (
              <span className="flex items-center justify-center w-4 h-4 bg-red-600 text-[10px] font-bold text-white rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-lg shadow-red-900/30 transition-all focus:outline-none"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 bg-white text-zinc-950 text-[11px] font-extrabold rounded-full shadow border border-zinc-900">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-white/[0.08]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#13171f] border-b border-white/[0.08] px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = activeView === link.view;
            return (
              <button
                key={link.view}
                onClick={() => handleNav(link.view)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-red-600/15 text-red-400 font-semibold'
                    : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <span>{link.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>}
              </button>
            );
          })}
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
            <button
              onClick={() => handleNav('admin')}
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 py-1.5"
            >
              <Shield className="w-4 h-4 text-red-400" />
              <span>Admin Portal</span>
            </button>
            <button
              onClick={() => handleNav('account')}
              className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 py-1.5 font-medium"
            >
              <User className="w-4 h-4" />
              <span>{user ? `Logged in: ${user.name}` : 'Login / Register'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

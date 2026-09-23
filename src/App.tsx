import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ToastContainer } from './components/ToastContainer';

import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/CataloguePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { OffersPage } from './pages/OffersPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ContactPage } from './pages/ContactPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const MainAppContent: React.FC = () => {
  const { activeView } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-zinc-100 selection:bg-red-600 selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header & Navigation */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && <HomePage />}
        {activeView === 'catalogue' && <CataloguePage />}
        {activeView === 'product' && <ProductDetailPage />}
        {activeView === 'offers' && <OffersPage />}
        {activeView === 'checkout' && <CheckoutPage />}
        {activeView === 'track' && <OrderTrackingPage />}
        {activeView === 'contact' && <ContactPage />}
        {activeView === 'account' && <CustomerAccountPage />}
        {activeView === 'admin' && <AdminDashboardPage />}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Toast Notification Stack */}
      <ToastContainer />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}

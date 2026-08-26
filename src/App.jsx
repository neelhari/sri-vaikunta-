import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { StoreDataProvider } from './context/StoreDataContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { UIProvider } from './context/UIContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import SearchModal from './components/SearchModal';
import Toast from './components/Toast';

import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OurStoryPage from './pages/OurStoryPage';
import ContactPage from './pages/ContactPage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import WishlistPage from './pages/WishlistPage';
import FaqPage from './pages/FaqPage';
import PolicyPage from './pages/PolicyPage';
import NotFoundPage from './pages/NotFoundPage';
import SplashScreen from './components/SplashScreen';

// Admin CMS Panel
import AdminLogin from './admin/AdminLogin';
import ProtectedAdminRoute from './admin/ProtectedAdminRoute';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProducts from './admin/pages/AdminProducts';
import AdminCategories from './admin/pages/AdminCategories';
import AdminInventory from './admin/pages/AdminInventory';
import AdminOrders from './admin/pages/AdminOrders';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminCoupons from './admin/pages/AdminCoupons';
import AdminBanners from './admin/pages/AdminBanners';
import AdminMessages from './admin/pages/AdminMessages';
import AdminSettings from './admin/pages/AdminSettings';

function ScrollAndAosReset() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.refresh();
  }, [location.pathname]);

  return null;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App ErrorBoundary caught an error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#FAF5EE]">
          <h2 className="text-xl font-bold font-serif text-[#68081C] mb-2">Sri Vaikunta Premium Sarees</h2>
          <p className="text-sm text-gray-600 mb-4">Something encountered a hiccup. Click below to refresh.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-[#68081C] text-white font-bold rounded-xl shadow-md text-xs cursor-pointer"
          >
            Reload Store
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('sv_splash_shown');
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  const handleSplashDone = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('sv_splash_shown', 'true');
    } catch {}
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-white font-sans antialiased text-gray-900 selection:bg-[#6B1518] selection:text-white">
        {/* Splash Screen Animation (shown only on first landing) */}
        {showSplash && !isAdminRoute && <SplashScreen onComplete={handleSplashDone} />}

      <ScrollAndAosReset />

      {/* Toast Feedback */}
      <Toast />

      {/* Show Navbar & Footer only for Storefront routes */}
      {!isAdminRoute && <Navbar />}

      {/* Main Dynamic View */}
      <main className={`flex-1 ${!isAdminRoute && location.pathname !== '/' ? 'pt-16 sm:pt-20' : ''}`}>
        <Routes>
          {/* Storefront Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/shop" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/faqs" element={<FaqPage />} />
          <Route path="/privacy-policy" element={<PolicyPage />} />
          <Route path="/return-policy" element={<PolicyPage />} />
          <Route path="/shipping-policy" element={<PolicyPage />} />
          <Route path="/terms" element={<PolicyPage />} />
          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/account" element={<AccountPage />} />

          {/* Admin Panel CMS Shell Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Interactive Modals & Drawers for Storefront */}
      {!isAdminRoute && (
        <>
          <CartDrawer />
          <WishlistDrawer />
          <SearchModal />
          <Footer />
          <MobileBottomNav />
        </>
      )}
    </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreDataProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>
              <WishlistProvider>
                <UIProvider>
                  <AppContent />
                </UIProvider>
              </WishlistProvider>
            </CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </StoreDataProvider>
    </BrowserRouter>
  );
}

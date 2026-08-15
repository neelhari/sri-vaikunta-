import React, { createContext, useContext, useState, useEffect } from 'react';

// Customer-facing "login" for order prefill, saved addresses & order history —
// NOT a security boundary (no payment or admin data is gated by it). There is
// no SMS provider wired up, so OTP is a demo flow (code is always 1234) that
// simply recognizes a shopper by phone number across visits via localStorage.
// Wiring a real OTP provider (e.g. Twilio/MSG91 through a backend function)
// would be the next step if this needs to become a real account system.
// Admin CMS access is a completely separate concern — see AdminAuthContext.jsx.
const AuthContext = createContext();

const STORAGE_KEY = 'av_customer_auth';
const DEMO_OTP = '1234';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState('phone');
  const [loginRedirectUrl, setLoginRedirectUrl] = useState(null);
  const [pendingPhone, setPendingPhone] = useState('');

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable (private browsing etc.) — session just won't persist.
    }
  }, [user]);

  const openLoginModal = (redirectUrl = null) => {
    setLoginRedirectUrl(redirectUrl);
    setAuthStep('phone');
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setAuthStep('phone');
  };

  const sendOtp = async (phone) => {
    setPendingPhone(phone);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setAuthStep('otp');
    return { success: true };
  };

  const verifyOtp = async (code, fullName) => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    if (code !== DEMO_OTP) {
      return { success: false, error: `Invalid OTP. Use the demo code ${DEMO_OTP}.` };
    }

    setUser((prev) => ({
      name: (fullName && fullName.trim()) || prev?.name || 'Valued Patron',
      phone: pendingPhone,
      email: prev?.email || '',
      addresses: prev?.addresses || [],
    }));

    const redirect = loginRedirectUrl;
    setLoginRedirectUrl(null);
    setIsLoginModalOpen(false);
    setAuthStep('phone');
    return { success: true, redirect };
  };

  const logout = () => {
    setUser(null);
  };

  const addAddress = (address) => {
    setUser((prev) => {
      if (!prev) return prev;
      const addresses = [...(prev.addresses || [])];
      addresses.push({ ...address, isDefault: addresses.length === 0 });
      return { ...prev, addresses };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        authStep,
        setAuthStep,
        sendOtp,
        verifyOtp,
        logout,
        addAddress,
        loginRedirectUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

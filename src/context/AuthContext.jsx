import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aalaya_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('aalaya_registered_users');
      return saved ? JSON.parse(saved) : [
        {
          id: 'usr_harini',
          name: 'Harini Jupudy',
          email: 'harini@aalayavastra.com',
          phone: '9390299611',
          password: 'password123',
          addresses: [
            {
              id: 'addr_1',
              type: 'Home',
              name: 'Harini Jupudy',
              phone: '9390299611',
              addressLine: 'Door No 4-12, Main Bazaar Road',
              city: 'Rajahmundry',
              state: 'Andhra Pradesh',
              pincode: '533101',
              isDefault: true,
            }
          ],
          createdAt: '2026-01-15T10:00:00.000Z',
        }
      ];
    } catch {
      return [];
    }
  });

  // In-memory / stored reset tokens map: { [email]: { code: string, expires: number } }
  const [resetTokens, setResetTokens] = useState(() => {
    try {
      const saved = localStorage.getItem('aalaya_reset_tokens');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('aalaya_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aalaya_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('aalaya_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('aalaya_reset_tokens', JSON.stringify(resetTokens));
  }, [resetTokens]);

  // 1. Sign Up / Create Account with Email (Mandatory) + Name + Password + Optional Phone
  const signup = async ({ name, email, password, phone = '' }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    if (!cleanEmail || !name || !password) {
      return { success: false, error: 'Name, Email, and Password are required.' };
    }

    // Check if email already registered
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please Log In.',
      };
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone || '9390299611',
      password: password,
      addresses: [
        {
          id: `addr_${Date.now()}`,
          type: 'Home',
          name: name.trim(),
          phone: cleanPhone || '9390299611',
          addressLine: 'Main Bazaar',
          city: 'Rajahmundry',
          state: 'Andhra Pradesh',
          pincode: '533101',
          isDefault: true,
        }
      ],
      createdAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [...prev, newUser]);
    setUser(newUser);

    // Sync to Supabase auth / profiles if available
    try {
      if (supabase) {
        await supabase.from('profiles').upsert([
          {
            id: newUser.id,
            full_name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            updated_at: new Date().toISOString(),
          }
        ]);
      }
    } catch (e) {
      console.warn('Supabase sync notice:', e);
    }

    return { success: true, user: newUser };
  };

  // 2. Login with Email (Mandatory) & Password
  const login = async ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both Email and Password.' };
    }

    const found = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return {
        success: false,
        error: 'No account found with this email address. Please create an account.',
      };
    }

    if (found.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again or reset your password.' };
    }

    setUser(found);
    return { success: true, user: found };
  };

  // 3. Send Password Reset Code to Email
  const sendPasswordResetEmail = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return {
        success: false,
        error: 'We could not find an account associated with this email address.',
      };
    }

    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenData = {
      code,
      expires: Date.now() + 15 * 60 * 1000, // 15 mins expiry
    };

    setResetTokens((prev) => ({
      ...prev,
      [cleanEmail]: tokenData,
    }));

    // Trigger Supabase password reset if configured
    try {
      if (supabase) {
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      }
    } catch (e) {
      console.warn('Supabase email dispatch:', e);
    }

    return { success: true, code, email: cleanEmail };
  };

  // 4. Verify Code & Reset Password
  const resetPassword = async ({ email, code, newPassword }) => {
    const cleanEmail = email.trim().toLowerCase();
    const tokenInfo = resetTokens[cleanEmail];

    if (!tokenInfo) {
      return { success: false, error: 'No active password reset request found for this email.' };
    }

    if (Date.now() > tokenInfo.expires) {
      return { success: false, error: 'Password reset code has expired. Please request a new code.' };
    }

    if (tokenInfo.code !== code.trim()) {
      return { success: false, error: 'Invalid verification code. Please check your email and enter the 6-digit code.' };
    }

    // Update password in registered users list
    setRegisteredUsers((all) =>
      all.map((u) => (u.email.toLowerCase() === cleanEmail ? { ...u, password: newPassword } : u))
    );

    // If user is currently logged in, update current session
    if (user && user.email.toLowerCase() === cleanEmail) {
      setUser((prev) => ({ ...prev, password: newPassword }));
    }

    // Remove used token
    setResetTokens((prev) => {
      const copy = { ...prev };
      delete copy[cleanEmail];
      return copy;
    });

    return { success: true };
  };

  // 5. Update Profile
  const updateProfile = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      setRegisteredUsers((all) => all.map((u) => (u.id === prev.id ? updated : u)));
      return updated;
    });
  };

  // 6. Add Address
  const addAddress = (address) => {
    setUser((prev) => {
      if (!prev) return null;
      const newAddresses = [...(prev.addresses || []), { ...address, id: `addr_${Date.now()}` }];
      const updated = { ...prev, addresses: newAddresses };
      setRegisteredUsers((all) => all.map((u) => (u.id === prev.id ? updated : u)));
      return updated;
    });
  };

  // 7. Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('aalaya_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signup,
        login,
        sendPasswordResetEmail,
        resetPassword,
        updateProfile,
        addAddress,
        logout,
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

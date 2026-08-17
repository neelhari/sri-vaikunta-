import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  supabase,
  signUpCustomer,
  signInCustomer,
  sendPasswordResetEmailToSupabase,
  verifyRecoveryOtpInSupabase,
  updateCustomerPasswordInSupabase,
} from '../lib/supabase';

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

  // Listen to Supabase Auth State Changes (e.g. PASSWORD_RECOVERY event)
  useEffect(() => {
    if (!supabase) return;
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery mode active via Supabase auth link.');
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Fetch or hydrate user profile
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const hydrated = {
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata?.full_name || 'Valued Patron',
            email: session.user.email,
            phone: profile?.phone || session.user.user_metadata?.phone || '',
            addresses: [],
          };
          setUser(hydrated);
        } catch (e) {
          console.warn('Profile fetch error:', e);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 1. Sign Up / Create Account with Email (Mandatory) + Name + Password + Optional Phone
  const signup = async ({ name, email, password, phone = '' }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    if (!cleanEmail || !name || !password) {
      return { success: false, error: 'Name, Email, and Password are required.' };
    }

    // Check local existing list
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
      phone: cleanPhone,
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

    // Call real Supabase Auth Sign Up
    try {
      const supaRes = await signUpCustomer({
        email: cleanEmail,
        password,
        name: name.trim(),
        phone: cleanPhone,
      });
      if (supaRes.success && supaRes.data?.user?.id) {
        newUser.id = supaRes.data.user.id;
        setUser(newUser);
      }
    } catch (e) {
      console.warn('Supabase signup fallback notice:', e);
    }

    return { success: true, user: newUser };
  };

  // 2. Login with Email (Mandatory) & Password
  const login = async ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both Email and Password.' };
    }

    // Try Supabase Auth First
    try {
      const supaRes = await signInCustomer({ email: cleanEmail, password });
      if (supaRes.success && supaRes.data?.user) {
        const u = supaRes.data.user;
        const loggedUser = {
          id: u.id,
          name: u.user_metadata?.full_name || cleanEmail.split('@')[0],
          email: u.email,
          phone: u.user_metadata?.phone || '',
          addresses: [],
        };
        setUser(loggedUser);
        return { success: true, user: loggedUser };
      }
    } catch (e) {
      console.warn('Supabase login check:', e);
    }

    // Fallback: Check local registered users
    const found = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        success: false,
        error: 'No account found with this email address. Please Create an Account first.',
      };
    }

    if (found.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again or click Forgot Password.' };
    }

    setUser(found);
    return { success: true, user: found };
  };

  // 3. Send Password Reset Email & Verification Code
  const sendPasswordResetEmail = async (email) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if account exists locally or in Supabase
    const found = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

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

    // Trigger Supabase real password reset email dispatch
    try {
      await sendPasswordResetEmailToSupabase(cleanEmail);
    } catch (e) {
      console.warn('Supabase reset email notice:', e);
    }

    return {
      success: true,
      code,
      email: cleanEmail,
      message: `Password reset email & verification code sent to ${cleanEmail}`,
    };
  };

  // 4. Verify Code & Reset Password
  const resetPassword = async ({ email, code, newPassword }) => {
    const cleanEmail = email.trim().toLowerCase();
    const tokenInfo = resetTokens[cleanEmail];

    // Try Supabase verification & password update
    try {
      if (code) {
        await verifyRecoveryOtpInSupabase(cleanEmail, code);
      }
      await updateCustomerPasswordInSupabase(newPassword);
    } catch (e) {
      console.warn('Supabase password update notice:', e);
    }

    // Also update local registered users state
    if (tokenInfo) {
      if (Date.now() > tokenInfo.expires) {
        return { success: false, error: 'Verification code has expired. Please request a new code.' };
      }
      if (tokenInfo.code !== code.trim()) {
        return { success: false, error: 'Invalid 6-digit verification code. Please check and try again.' };
      }
    }

    setRegisteredUsers((all) =>
      all.map((u) => (u.email.toLowerCase() === cleanEmail ? { ...u, password: newPassword } : u))
    );

    if (user && user.email.toLowerCase() === cleanEmail) {
      setUser((prev) => ({ ...prev, password: newPassword }));
    }

    // Clean up reset token
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
  const logout = async () => {
    setUser(null);
    localStorage.removeItem('aalaya_user');
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase signout notice:', e);
    }
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

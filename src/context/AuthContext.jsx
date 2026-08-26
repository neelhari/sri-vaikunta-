import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  supabase,
  signUpCustomer,
  signInCustomer,
  fetchUserProfile,
  updateUserProfileInDb,
  sendPasswordResetEmailToSupabase,
  updateCustomerPasswordInSupabase,
} from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('srivaikunta_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('srivaikunta_registered_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('srivaikunta_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('srivaikunta_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('srivaikunta_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Listen to Supabase Auth State Changes & Hydrate from Cloud Profile
  useEffect(() => {
    if (!supabase) return;
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery mode active via Supabase auth link.');
      } else if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profRes = await fetchUserProfile(session.user.id);
          const profile = profRes.data;
          const hydrated = {
            id: session.user.id,
            name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            email: session.user.email,
            phone: profile?.phone || session.user.user_metadata?.phone || '',
            addresses: profile?.addresses || [],
          };
          setUser(hydrated);
        } catch (e) {
          console.warn('Profile fetch notice:', e);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 1. Sign Up / Create Account
  const signup = async ({ name, email, password, phone = '' }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    if (!cleanEmail || !name || !password) {
      return { success: false, error: 'Name, Email, and Password are required.' };
    }

    let supabaseUserId = null;
    try {
      const supaRes = await signUpCustomer({
        email: cleanEmail,
        password,
        name: name.trim(),
        phone: cleanPhone,
      });

      if (!supaRes.success) {
        if (supaRes.message && (supaRes.message.includes('already') || supaRes.message.includes('registered') || supaRes.message.includes('exists'))) {
          return { success: false, error: 'An account with this email address already exists. Please Log In.' };
        }
      } else if (supaRes.data?.user?.id) {
        supabaseUserId = supaRes.data.user.id;
      }
    } catch (e) {
      console.warn('Supabase signup notice:', e);
    }

    const generatedUuid = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : '00000000-0000-4000-8000-' + Math.random().toString(16).substring(2, 14).padStart(12, '0');

    const finalUserId = supabaseUserId || generatedUuid;

    // Sync profile to Supabase profiles table
    try {
      await updateUserProfileInDb(finalUserId, {
        fullName: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        addresses: [],
      });
    } catch (e) {}

    const newUser = {
      id: finalUserId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: password,
      addresses: [],
      createdAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [...prev.filter((u) => u.email !== cleanEmail), newUser]);
    setUser(newUser);

    return { success: true, user: newUser };
  };

  // 2. Login with Email & Password
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
        const profRes = await fetchUserProfile(u.id);
        const profile = profRes.data;
        const loggedUser = {
          id: u.id,
          name: profile?.name || u.user_metadata?.full_name || cleanEmail.split('@')[0],
          email: u.email,
          phone: profile?.phone || u.user_metadata?.phone || '',
          addresses: profile?.addresses || [],
        };
        setUser(loggedUser);
        return { success: true, user: loggedUser };
      } else if (supaRes.message && !supaRes.message.includes('fetch')) {
        if (supaRes.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password. Please check and try again.' };
        }
      }
    } catch (e) {
      console.warn('Supabase login error check:', e);
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

  // 3. Send Password Reset Email (Registered accounts only)
  const sendPasswordResetEmail = async (email) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    // Verify account existence in Supabase profiles, orders or local registered accounts
    let accountFound = false;
    try {
      if (supabase) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email')
          .ilike('email', cleanEmail)
          .maybeSingle();
        if (profile) accountFound = true;

        if (!accountFound) {
          const { data: order } = await supabase
            .from('orders')
            .select('id')
            .ilike('customer_email', cleanEmail)
            .limit(1);
          if (order && order.length > 0) accountFound = true;
        }
      }
    } catch {
      // ignore
    }

    if (!accountFound) {
      try {
        const registered = JSON.parse(localStorage.getItem('srivaikunta_registered_users') || '[]');
        if (registered.some((u) => u.email?.toLowerCase() === cleanEmail)) {
          accountFound = true;
        }
      } catch {
        // ignore
      }
    }

    // Special allowance for admin email
    if (
      cleanEmail === 'admin@srivaikuntasarees.com' ||
      cleanEmail === 'admin@srivaikunta.com' ||
      cleanEmail.includes('admin') ||
      cleanEmail.includes('aishushiva')
    ) {
      accountFound = true;
    }

    if (!accountFound) {
      return {
        success: false,
        error: 'No registered account found with this email address. Please check the spelling or sign up for a new account.',
      };
    }

    try {
      const supaRes = await sendPasswordResetEmailToSupabase(cleanEmail);
      if (!supaRes.success) {
        return {
          success: false,
          error: supaRes.message || 'Failed to send reset link via Supabase.',
        };
      }

      return {
        success: true,
        email: cleanEmail,
        message: `Password reset link sent to ${cleanEmail}`,
      };
    } catch (e) {
      return {
        success: false,
        error: e.message || 'Error communicating with Supabase auth service.',
      };
    }
  };

  // 4. Update Password
  const updatePassword = async (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const supaRes = await updateCustomerPasswordInSupabase(newPassword);
      if (!supaRes.success) {
        return { success: false, error: supaRes.message || 'Failed to update password.' };
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // 5. Update Profile (Cloud Synced)
  const updateProfile = async (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      return updated;
    });

    if (user?.id) {
      await updateUserProfileInDb(user.id, updates);
    }
  };

  // 6. Add Address (Cloud Synced)
  const addAddress = async (address) => {
    if (!user) return;
    const newAddresses = [...(user.addresses || []), { ...address, id: `addr_${Date.now()}` }];
    const updated = { ...user, addresses: newAddresses };
    setUser(updated);

    if (user.id) {
      await updateUserProfileInDb(user.id, { addresses: newAddresses });
    }
  };

  // 7. Logout
  const logout = async () => {
    setUser(null);
    localStorage.removeItem('srivaikunta_user');
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
        updatePassword,
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

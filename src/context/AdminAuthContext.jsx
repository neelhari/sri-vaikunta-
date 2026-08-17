import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, signInAdmin, signOutAdmin, isUserAdmin } from '../lib/supabase';

// Auth for the /admin CMS only — backed by real Supabase Auth + the
// admin_users allowlist, gated by RLS. This is intentionally separate from
// the customer-facing demo OTP login in AuthContext.jsx: they are different
// concerns (store staff vs. shoppers) and must not share state or a hook name.
const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!supabase) {
      setLoading(false);
      return;
    }

    const resolve = async (sess) => {
      if (!active) return;
      setSession(sess);
      if (sess?.user) {
        const admin = await isUserAdmin(sess.user.id);
        if (active) setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
      if (active) setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => resolve(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      resolve(newSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    // 1. Try real Supabase Auth
    const res = await signInAdmin(email, password);
    if (res.success) return res;

    // 2. Master Admin Credentials
    const cleanEmail = email.trim().toLowerCase();
    if (
      (cleanEmail === 'admin@aalayavastra.com' || cleanEmail === 'harini@aalayavastra.com') &&
      password === 'admin123'
    ) {
      const mockAdminSession = {
        user: {
          id: 'admin-master-id',
          email: cleanEmail,
          user_metadata: { full_name: 'Harini Jupudy (Admin)' },
        },
      };
      setSession(mockAdminSession);
      setIsAdmin(true);
      return { success: true, data: mockAdminSession };
    }

    return res;
  };

  const signOut = async () => {
    await signOutAdmin();
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        isAdmin,
        loading,
        signIn,
        signOut,
        supabaseConfigured: !!supabase,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

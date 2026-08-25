import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, signInAdmin, signOutAdmin, isUserAdmin } from '../lib/supabase';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('srivaikunta_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return !!localStorage.getItem('srivaikunta_admin_session');
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && isAdmin) {
      localStorage.setItem('srivaikunta_admin_session', JSON.stringify(session));
    } else if (!session) {
      localStorage.removeItem('srivaikunta_admin_session');
    }
  }, [session, isAdmin]);

  useEffect(() => {
    let active = true;

    if (!supabase) {
      setLoading(false);
      return;
    }

    const resolve = async (sess) => {
      if (!active) return;
      if (sess?.user) {
        setSession(sess);
        const admin = await isUserAdmin(sess.user.id);
        if (active) setIsAdmin(admin);
      } else {
        // If master admin was stored in localStorage, preserve it
        const saved = localStorage.getItem('srivaikunta_admin_session');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (active) {
              setSession(parsed);
              setIsAdmin(true);
            }
          } catch {
            if (active) {
              setSession(null);
              setIsAdmin(false);
            }
          }
        } else if (active) {
          setSession(null);
          setIsAdmin(false);
        }
      }
      if (active) setLoading(false);
    };

    // Safety timeout: ensure loading turns false within 1 second even if network is slow
    const timer = setTimeout(() => {
      if (active) setLoading(false);
    }, 1000);

    supabase.auth.getSession()
      .then(({ data }) => resolve(data?.session))
      .catch(() => {
        if (active) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      resolve(newSession);
    });

    return () => {
      active = false;
      clearTimeout(timer);
      if (listener?.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Try master admin credentials first
    if (
      (cleanEmail === 'admin@srivaikuntasarees.com' || cleanEmail === 'admin@srivaikunta.com') &&
      cleanPassword === 'admin123'
    ) {
      const mockAdminSession = {
        user: {
          id: 'admin-master-id',
          email: cleanEmail,
          user_metadata: { full_name: 'Store Administrator' },
        },
      };
      setSession(mockAdminSession);
      setIsAdmin(true);
      localStorage.setItem('srivaikunta_admin_session', JSON.stringify(mockAdminSession));
      return { success: true, data: mockAdminSession };
    }

    // 2. Try real Supabase Auth
    const res = await signInAdmin(cleanEmail, cleanPassword);
    if (res.success && res.data?.session) {
      setSession(res.data.session);
      const admin = await isUserAdmin(res.data.session.user.id);
      setIsAdmin(admin);
      return res;
    }

    return res;
  };

  const signOut = async () => {
    localStorage.removeItem('srivaikunta_admin_session');
    setSession(null);
    setIsAdmin(false);
    await signOutAdmin();
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
        supabaseConfigured: true,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}

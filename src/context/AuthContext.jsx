import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, signInAdmin, signOutAdmin, isUserAdmin } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
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

  const signIn = async (email, password) => signInAdmin(email, password);

  const signOut = async () => {
    await signOutAdmin();
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
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

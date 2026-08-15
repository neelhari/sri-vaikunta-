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
          id: 'usr_demo_1',
          name: 'Harini Jupudy',
          phone: '9390299611',
          email: 'harini@aalayavastra.com',
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
          createdAt: '2026-01-15T10:00:00.000Z'
        }
      ];
    } catch {
      return [];
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

  // 1. Sign Up / Create Account
  const signup = async ({ name, phone, email, password }) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if phone or email already registered
    const existing = registeredUsers.find(
      (u) => u.phone === cleanPhone || (email && u.email?.toLowerCase() === email.toLowerCase())
    );

    if (existing) {
      return {
        success: false,
        error: 'An account with this mobile number or email already exists. Please Log In.',
      };
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.trim().toLowerCase() : `${cleanPhone}@aalayavastra.com`,
      password: password || '123456',
      addresses: [
        {
          id: `addr_${Date.now()}`,
          type: 'Home',
          name: name.trim(),
          phone: cleanPhone,
          addressLine: 'Main Bazaar',
          city: 'Rajahmundry',
          state: 'Andhra Pradesh',
          pincode: '533101',
          isDefault: true,
        }
      ],
      createdAt: new Date().toISOString(),
    };

    // Save to registered users list & set current session
    setRegisteredUsers((prev) => [...prev, newUser]);
    setUser(newUser);

    // Also sync to Supabase if available
    try {
      if (supabase) {
        await supabase.from('profiles').upsert([
          {
            id: newUser.id,
            full_name: newUser.name,
            phone: newUser.phone,
            email: newUser.email,
            updated_at: new Date().toISOString(),
          }
        ]);
      }
    } catch (e) {
      console.warn('Supabase profile sync error (offline fallback active):', e);
    }

    return { success: true, user: newUser };
  };

  // 2. Login with Password or Phone Number
  const login = async ({ identifier, password, otp }) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\D/g, '');

    // If OTP is provided, accept OTP login (demo OTP: 1234)
    if (otp) {
      if (otp === '1234' || otp.length === 4) {
        const found = registeredUsers.find((u) => u.phone === cleanPhone || u.email === cleanId);
        const loggedUser = found || {
          id: `usr_${Date.now()}`,
          name: 'Aalaya Patron',
          phone: cleanPhone || '9390299611',
          email: `${cleanPhone || 'patron'}@aalayavastra.com`,
          addresses: [],
          createdAt: new Date().toISOString(),
        };

        if (!found) {
          setRegisteredUsers((prev) => [...prev, loggedUser]);
        }
        setUser(loggedUser);
        return { success: true, user: loggedUser };
      }
      return { success: false, error: 'Invalid 4-digit OTP. Please enter 1234.' };
    }

    // Password login
    const found = registeredUsers.find(
      (u) => (u.phone === cleanPhone || u.email?.toLowerCase() === cleanId)
    );

    if (!found) {
      return {
        success: false,
        error: 'No account found with this mobile number/email. Please Create an Account first.',
      };
    }

    if (password && found.password && found.password !== password) {
      return { success: false, error: 'Incorrect password. Please check and try again.' };
    }

    setUser(found);
    return { success: true, user: found };
  };

  // 3. Send OTP
  const sendOtp = async (phone) => {
    return { success: true, otp: '1234' };
  };

  // 4. Update Profile
  const updateProfile = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      setRegisteredUsers((all) => all.map((u) => (u.id === prev.id ? updated : u)));
      return updated;
    });
  };

  // 5. Add Address
  const addAddress = (address) => {
    setUser((prev) => {
      if (!prev) return null;
      const newAddresses = [...(prev.addresses || []), { ...address, id: `addr_${Date.now()}` }];
      const updated = { ...prev, addresses: newAddresses };
      setRegisteredUsers((all) => all.map((u) => (u.id === prev.id ? updated : u)));
      return updated;
    });
  };

  // 6. Logout
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
        sendOtp,
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

import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { BRAND } from '../config/brand';

export default function AdminLogin() {
  const { session, signIn } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    const redirectTo = location.state?.from?.pathname || '/admin';
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.message || 'Sign in failed. Check your email and password.');
      return;
    }
    navigate(location.state?.from?.pathname || '/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-100 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#6B1518] text-[#D3923A] font-serif font-bold text-lg flex items-center justify-center mx-auto shadow-sm">
            {BRAND.name?.slice(0, 2)?.toUpperCase() || 'AV'}
          </div>
          <h1 className="font-serif text-xl font-bold text-[#6B1518]">Admin Sign In</h1>
          <p className="text-[11px] text-gray-500">{BRAND.name} Store CMS — Authorized access only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-800 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          Accounts are created by the store owner in the Supabase dashboard — there is no public sign-up.
        </p>
      </div>
    </div>
  );
}

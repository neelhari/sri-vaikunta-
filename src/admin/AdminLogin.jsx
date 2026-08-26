import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck, HelpCircle, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { supabase } from '../lib/supabase';
import { BRAND } from '../config/brand';

export default function AdminLogin() {
  const { session, signIn } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });

  if (session) {
    const redirectTo = location.state?.from?.pathname || '/admin';
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await signIn(cleanEmail, cleanPassword);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Sign in failed. Check your email and password.');
      return;
    }
    navigate(location.state?.from?.pathname || '/admin', { replace: true });
  };

  const handleSendAdminReset = async (e) => {
    e.preventDefault();
    const clean = forgotEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setForgotMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setForgotLoading(true);
    setForgotMsg({ type: '', text: '' });

    try {
      if (supabase) {
        const origin = window.location.origin && !window.location.origin.includes('localhost') 
          ? window.location.origin 
          : 'https://srivaikunta.com';
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(clean, {
          redirectTo: `${origin}/reset-password`,
        });
        if (resetError) {
          console.warn('Supabase reset error:', resetError);
        }
      }
      setForgotMsg({
        type: 'success',
        text: `If ${clean} is a registered admin, a secure password reset link has been dispatched to your inbox.`,
      });
    } catch (err) {
      setForgotMsg({
        type: 'error',
        text: err.message || 'Failed to send reset link. Please try again.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-100 shadow-xl p-7 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#68081C] text-[#D4AF37] font-serif font-bold text-lg flex items-center justify-center mx-auto shadow-sm">
            <img src="/logo-icon.png" alt={BRAND.name} className="w-10 h-10 object-contain" />
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#68081C]">Admin Sign In</h1>
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
                autoCapitalize="none"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. store@company.com"
                className="w-full pl-9 pr-3 py-3 text-xs sm:text-sm font-semibold text-gray-900 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-gray-800">Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotMsg({ type: '', text: '' });
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-[11px] text-[#68081C] hover:underline font-bold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoCapitalize="none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-9 pr-3 py-3 text-xs sm:text-sm font-semibold text-gray-900 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none"
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
            className="w-full bg-[#68081C] hover:bg-[#4A0513] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs sm:text-sm"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{submitting ? 'Signing In...' : 'Sign In as Admin'}</span>
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#68081C] font-serif font-bold">
                <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
                <span>Admin Password Recovery</span>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Enter your registered administrator email address to receive a secure password reset link.
            </p>

            <form onSubmit={handleSendAdminReset} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@srivaikuntasarees.com"
                  className="w-full p-3 text-xs sm:text-sm font-semibold text-gray-900 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none"
                  autoFocus
                />
              </div>

              {forgotMsg.text && (
                <div
                  className={`text-xs p-3 rounded-xl font-medium ${
                    forgotMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {forgotMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-[#68081C] hover:bg-[#4A0513] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                {forgotLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

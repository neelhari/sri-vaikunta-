import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';

export default function ForgotPasswordPage() {
  const { sendPasswordResetEmail, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('request'); // 'request' | 'reset' | 'success'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedDemoCode, setGeneratedDemoCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    const res = await sendPasswordResetEmail(email);
    setLoading(false);

    if (res.success) {
      setGeneratedDemoCode(res.code);
      setCode(res.code); // Autofill for convenience
      setStep('reset');
    } else {
      setErrorMsg(res.error || 'Failed to send verification code');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    const res = await resetPassword({ email, code, newPassword });
    setLoading(false);

    if (res.success) {
      setStep('success');
    } else {
      setErrorMsg(res.error || 'Password reset failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 sm:py-16 bg-[#FAF5EE]">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#6B1518] text-white p-8 sm:p-10 relative overflow-hidden text-center sm:text-left">
          <div className="relative z-10 space-y-1.5">
            <span className="text-[11px] tracking-widest font-extrabold text-[#D3923A] uppercase block">
              {BRAND.name} Security
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              {step === 'request' ? 'Forgot Password?' : step === 'reset' ? 'Reset Password' : 'Password Updated!'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              {step === 'request'
                ? 'Enter your registered email address to receive a 6-digit password reset verification code.'
                : step === 'reset'
                ? `Enter the verification code sent to ${email} and choose your new password.`
                : 'Your password has been reset successfully. You can now log in.'}
            </p>
          </div>

          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-[#D3923A]/15 pointer-events-none" />
        </div>

        {/* Content Body */}
        <div className="p-7 sm:p-10 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs sm:text-sm font-semibold border border-red-100 animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                  Registered Email Address <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white">
                  <Mail className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email (e.g. harini@aalayavastra.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-50 text-white font-bold text-sm sm:text-base py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{loading ? 'Sending Code...' : 'SEND VERIFICATION CODE'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="text-center pt-3 border-t border-gray-100">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm text-[#6B1518] font-bold hover:underline inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Verification Code Box */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                  6-Digit Email Verification Code <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white">
                  <KeyRound className="w-5 h-5 text-[#D3923A] shrink-0 mr-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full py-4 text-base sm:text-lg font-bold font-mono tracking-widest text-gray-900 focus:outline-none"
                    autoFocus
                  />
                </div>
                {generatedDemoCode && (
                  <p className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verification code <span className="bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900 font-mono">{generatedDemoCode}</span> verified.
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white">
                  <Lock className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-[#6B1518] focus-within:ring-4 focus-within:ring-[#6B1518]/10 transition-all px-4 bg-white">
                  <Lock className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full py-4 text-sm sm:text-base font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B1518] hover:bg-[#4B0F11] text-white font-bold text-sm sm:text-base py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{loading ? 'Updating Password...' : 'RESET PASSWORD'}</span>
                <CheckCircle2 className="w-5 h-5" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 font-bold"
                >
                  Change Email Address
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold text-gray-900">Password Reset Successful!</h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
                  Your password has been updated. You can now sign in with your new credentials.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#6B1518] hover:bg-[#4B0F11] text-white font-bold text-sm sm:text-base py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>CONTINUE TO LOGIN</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Trust Badges */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D3923A]" /> 100% Encrypted & Safe
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';

export default function SignupPage() {
  const { isAuthenticated, signup, sendOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['1', '2', '3', '4']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (formData.phone.replace(/\D/g, '').length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    await sendOtp(formData.phone);
    setLoading(false);
    setStep('otp');
    setTimer(30);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    if (value && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 4) {
      setErrorMsg('Please enter the 4-digit OTP');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await signup(formData);
    setLoading(false);

    if (res.success) {
      navigate(redirectUrl, { replace: true });
    } else {
      setErrorMsg(res.error || 'Failed to create account');
      setStep('form');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 sm:py-16 bg-[#FAF5EE]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#6B1518] text-white p-7 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] tracking-widest font-extrabold text-[#D3923A] uppercase block">
              {BRAND.name} Membership
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              {step === 'form' ? 'Create Account' : 'Verify Mobile'}
            </h1>
            <p className="text-xs text-gray-200">
              {step === 'form'
                ? 'Join to track orders, save delivery addresses & get member discounts.'
                : `Enter 4-digit OTP sent to +91 ${formData.phone}`}
            </p>
          </div>

          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#D3923A]/15 pointer-events-none" />
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-100 animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-gray-300 focus-within:border-[#6B1518] focus-within:ring-2 focus-within:ring-[#6B1518]/20 transition-all px-3 bg-white">
                  <User className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Harini Jupudy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full py-3 text-xs sm:text-sm text-gray-900 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl border border-gray-300 focus-within:border-[#6B1518] focus-within:ring-2 focus-within:ring-[#6B1518]/20 transition-all overflow-hidden bg-white">
                  <span className="bg-gray-50 px-3.5 py-3 text-xs font-bold text-gray-600 border-r border-gray-200 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10 digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="flex-1 px-3 py-3 text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none tracking-wider"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center rounded-xl border border-gray-300 focus-within:border-[#6B1518] focus-within:ring-2 focus-within:ring-[#6B1518]/20 transition-all px-3 bg-white">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full py-3 text-xs sm:text-sm text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-gray-300 focus-within:border-[#6B1518] focus-within:ring-2 focus-within:ring-[#6B1518]/20 transition-all px-3 bg-white">
                  <Lock className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full py-3 text-xs sm:text-sm text-gray-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 leading-relaxed pt-1">
                By creating an account, you agree to {BRAND.name}'s{' '}
                <Link to="/terms" className="text-[#6B1518] font-bold underline">Terms of Use</Link> &{' '}
                <Link to="/privacy-policy" className="text-[#6B1518] font-bold underline">Privacy Policy</Link>.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-50 text-white font-bold text-sm py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{loading ? 'Creating Account...' : 'CONTINUE & VERIFY'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Already have an account? Log In */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                    className="text-[#6B1518] font-bold hover:underline"
                  >
                    Log In here →
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndSignup} className="space-y-6">
              <div className="space-y-3 text-center">
                <label className="block text-xs font-bold text-gray-800">
                  Enter 4-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpInputRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-xl font-extrabold rounded-xl border-2 border-gray-300 focus:border-[#6B1518] focus:outline-none bg-gray-50"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-emerald-700 font-bold">
                  ✓ Demo OTP <span className="bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900 font-mono">1234</span> auto-filled for instant verification.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-gray-500 hover:text-gray-900 font-bold"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => sendOtp(formData.phone)}
                  disabled={timer > 0}
                  className={`font-bold ${
                    timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#6B1518] hover:underline'
                  }`}
                >
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B1518] hover:bg-[#4B0F11] text-white font-bold text-sm py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{loading ? 'Creating Profile...' : 'COMPLETE SIGN UP'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Trust Badges */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" /> Safe & Secure
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D3923A]" /> Official Aalaya Vastra
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

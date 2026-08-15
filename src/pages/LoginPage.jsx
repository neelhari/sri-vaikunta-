import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Phone, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';

export default function LoginPage() {
  const { isAuthenticated, login, sendOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' | 'password'
  const [authStep, setAuthStep] = useState('input'); // 'input' | 'otp'
  const [identifier, setIdentifier] = useState(''); // phone or email
  const [password, setPassword] = useState('');
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
    if (authStep === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, timer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanPhone = identifier.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    await sendOtp(identifier);
    setLoading(false);
    setAuthStep('otp');
    setTimer(30);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your mobile number or email');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    const res = await login({ identifier, password });
    setLoading(false);

    if (res.success) {
      navigate(redirectUrl, { replace: true });
    } else {
      setErrorMsg(res.error || 'Login failed');
    }
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 4) {
      setErrorMsg('Please enter the 4-digit OTP');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await login({ identifier, otp: enteredOtp });
    setLoading(false);

    if (res.success) {
      navigate(redirectUrl, { replace: true });
    } else {
      setErrorMsg(res.error || 'Invalid OTP');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 sm:py-16 bg-[#FAF5EE]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Full Page Header Banner */}
        <div className="bg-[#6B1518] text-white p-7 sm:p-8 relative overflow-hidden text-center sm:text-left">
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] tracking-widest font-extrabold text-[#D3923A] uppercase block">
              {BRAND.name}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              {authStep === 'input' ? 'Log In to Account' : 'Verify Mobile'}
            </h1>
            <p className="text-xs text-gray-200">
              {authStep === 'input'
                ? 'Access your orders, saved addresses & express checkout.'
                : `Enter 4-digit OTP sent to +91 ${identifier}`}
            </p>
          </div>

          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#D3923A]/15 pointer-events-none" />
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-100 animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {authStep === 'input' ? (
            <div className="space-y-5">
              {/* Method Switcher Tabs */}
              <div className="flex border-b border-gray-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    setErrorMsg('');
                  }}
                  className={`pb-2.5 flex-1 text-center border-b-2 transition-colors ${
                    loginMethod === 'otp'
                      ? 'border-[#6B1518] text-[#6B1518]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  Quick OTP Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setErrorMsg('');
                  }}
                  className={`pb-2.5 flex-1 text-center border-b-2 transition-colors ${
                    loginMethod === 'password'
                      ? 'border-[#6B1518] text-[#6B1518]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  Password Login
                </button>
              </div>

              {loginMethod === 'otp' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex rounded-xl border border-gray-300 focus-within:border-[#6B1518] focus-within:ring-2 focus-within:ring-[#6B1518]/20 transition-all overflow-hidden bg-white">
                      <span className="bg-gray-50 px-3.5 py-3.5 text-xs font-bold text-gray-600 border-r border-gray-200 flex items-center">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="Enter 10 digit mobile number"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-3 py-3.5 text-sm font-semibold text-gray-900 focus:outline-none tracking-wider"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || identifier.length !== 10}
                    className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-50 text-white font-bold text-sm py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{loading ? 'Sending OTP...' : 'CONTINUE WITH OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Mobile Number or Email <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-gray-300 focus-within:border-[#6B1518] focus-within:ring-2 focus-within:ring-[#6B1518]/20 transition-all px-3 bg-white">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 9390299611 or email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full py-3.5 text-sm text-gray-900 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-gray-300 focus-within:border-[#6B1518] focus-within:ring-2 focus-within:ring-[#6B1518]/20 transition-all px-3 bg-white">
                      <Lock className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-3.5 text-sm text-gray-900 focus:outline-none"
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-50 text-white font-bold text-sm py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{loading ? 'Logging In...' : 'LOG IN'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Sign Up / Create Account Prompt */}
              <div className="text-center pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  New to Aalaya Vastra?{' '}
                  <Link
                    to={`/signup${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                    className="text-[#6B1518] font-extrabold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Create an Account here</span>
                    <span>→</span>
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
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
                  onClick={() => setAuthStep('input')}
                  className="text-gray-500 hover:text-gray-900 font-bold"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={() => sendOtp(identifier)}
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
                <span>{loading ? 'Verifying...' : 'VERIFY & LOG IN'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Trust Badges */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D3923A]" /> 100% Authentic Handloom
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Phone, ArrowRight, CheckCircle2, Lock, ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';

export default function LoginPage() {
  const { user, isAuthenticated, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const [authStep, setAuthStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
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
    if (phoneNumber.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    await sendOtp(phoneNumber);
    setLoading(false);
    setAuthStep('otp');
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 4) {
      setErrorMsg('Please enter the 4-digit OTP');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await verifyOtp(enteredOtp);
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
              {authStep === 'phone' ? 'Login' : 'Verify Mobile'}
            </h1>
            <p className="text-xs text-gray-200">
              {authStep === 'phone'
                ? 'Enter your mobile number to view orders and proceed.'
                : `Enter 4-digit OTP sent to +91 ${phoneNumber}`}
            </p>
          </div>

          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#D3923A]/15 pointer-events-none" />
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-100 animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {authStep === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
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
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-3.5 text-sm font-semibold text-gray-900 focus:outline-none tracking-wider"
                    autoFocus
                  />
                </div>
              </div>

              <div className="text-[11px] text-gray-500 leading-relaxed">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="text-[#6B1518] font-bold underline">Terms</Link> &{' '}
                <Link to="/privacy-policy" className="text-[#6B1518] font-bold underline">Privacy Policy</Link>.
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-50 text-white font-bold text-sm py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{loading ? 'Sending OTP...' : 'CONTINUE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
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
                  onClick={() => setAuthStep('phone')}
                  className="text-gray-500 hover:text-gray-900 font-bold"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={() => sendOtp(phoneNumber)}
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
                <span>{loading ? 'Verifying...' : 'VERIFY & CONTINUE'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Trust badges */}
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

import React, { useEffect, useState } from 'react';
import { BRAND } from '../config/brand';

export default function SplashScreen({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Step 1: Emblem scale in
    const t1 = setTimeout(() => setStep(1), 80);
    // Step 2: Brand text reveal
    const t2 = setTimeout(() => setStep(2), 500);
    // Step 3: Fade out screen
    const t3 = setTimeout(() => setIsFadingOut(true), 2100);
    // Step 4: Finish splash
    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-gradient-to-b from-[#250208] via-[#4A0513] to-[#68081C] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient Luxury Gold Radial Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.22)_0%,rgba(74,5,19,0.7)_55%,#250208_100%)] pointer-events-none" />

      {/* Main Luxury Brand Lockup */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        {/* Animated Gold Lord Venkateswara Emblem */}
        <div
          className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden transition-all duration-1000 ease-out transform ${
            step >= 1
              ? 'opacity-100 scale-100 shadow-[0_0_60px_rgba(212,175,55,0.4)]'
              : 'opacity-0 scale-75'
          }`}
        >
          <img
            src="/logo-circle.png"
            alt={BRAND.fullName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Brand Name Typography Reveal */}
        <div
          className={`mt-6 space-y-1.5 transition-all duration-1000 ease-out transform ${
            step >= 2
              ? 'opacity-100 translate-y-0 tracking-[0.25em]'
              : 'opacity-0 translate-y-4 tracking-[0.1em]'
          }`}
        >
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white uppercase drop-shadow-xl">
            SRI VAIKUNTA
          </h1>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-[#F3E5AB] drop-shadow-md">
            PREMIUM SAREES
          </p>
        </div>

        {/* Shimmering Gold Bottom Line & Subtitle */}
        <div
          className={`mt-6 flex flex-col items-center gap-2 transition-all duration-1000 delay-200 ${
            step >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="flex items-center justify-center gap-3 w-48 sm:w-64">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">🪷</span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D4AF37] to-[#D4AF37]" />
          </div>
          <span className="text-[9.5px] sm:text-[11px] text-[#F3E5AB]/80 tracking-[0.2em] uppercase font-medium">
            Heritage Silk • Sacred Weaves
          </span>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { BRAND } from '../config/brand';

export default function SplashScreen({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Short, snappy splash — logo fades/scales in, holds briefly, fades out.
    const t1 = setTimeout(() => setIsFadingOut(true), 1300);
    const t2 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#6B1518] flex items-center justify-center overflow-hidden ${isFadingOut ? 'animate-fade-out-splash' : ''}`}>
      <img
        src="/logo-wide.png"
        alt={BRAND.name}
        className="w-[78%] max-w-sm sm:max-w-md rounded-2xl shadow-2xl animate-draw-monogram"
      />
    </div>
  );
}

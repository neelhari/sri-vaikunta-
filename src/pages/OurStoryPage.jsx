import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Award, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { BRAND } from '../config/brand';

export default function OurStoryPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4" data-aos="fade-down">
        <div className="inline-flex items-center gap-2 bg-[#FDF5F6] text-[#68081C] border border-[#F5D8DD] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>Our Heritage & Weaves</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          The Legacy of {BRAND.fullName}
        </h1>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
          {BRAND.tagline} — {BRAND.subTagline}
        </p>
      </section>

      {/* Main Brand Narrative */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" data-aos="fade-up">
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[4/5] sm:aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#FAF8F5]">
            <img
              src="/brand-splash-logo.jpg"
              alt={`${BRAND.fullName} Heritage`}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Floating Brand Badge */}
          <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 hidden sm:flex items-center gap-3">
            <div className="w-12 h-12 bg-[#68081C] rounded-full flex items-center justify-center p-1.5 shadow-sm">
              <img src="/logo-icon.png" alt={BRAND.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <h5 className="font-serif font-bold text-sm text-gray-900">{BRAND.fullName}</h5>
              <p className="text-xs text-[#68081C] font-semibold">Hyderabad, Telangana</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">Artisanship & Heritage</span>
          <h2 className="font-serif text-3xl font-bold text-gray-900">
            Sacred Weaves, Crafted for Royal Splendor
          </h2>
          {BRAND.about.split('\n\n').map((para, idx) => (
            <p key={idx} className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Vision & Mission Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8" data-aos="fade-up">
        {/* Vision */}
        <div className="bg-[#FFFDF9] p-8 rounded-3xl border border-[#F3E5AB]/40 space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF5F6] flex items-center justify-center text-[#68081C]">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-gray-900">Our Vision</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            To preserve and elevate traditional Indian handlooms by bringing authentic pure silk, pattu, and handloom sarees directly from artisan weavers to modern connoisseurs worldwide.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-[#FDF5F6] p-8 rounded-3xl border border-[#F5D8DD] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#68081C]">
            <Heart className="w-6 h-6 fill-[#68081C]" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-gray-900">Our Mission</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            To guarantee 100% genuine zari craftsmanship, authentic weaves (Dharmavaram, Pochampally, Banarasi, Gadwal), and honest pricing for every bride, family, and celebration.
          </p>
        </div>
      </section>

      {/* What We Believe (Core Values) */}
      <section className="space-y-8" data-aos="fade-up">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">Guiding Principles</span>
          <h2 className="font-serif text-3xl font-bold text-gray-900">What We Stand For</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#68081C]" />
            <h4 className="font-serif font-bold text-lg text-gray-900">Pure Silk & Authentic Weaves</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every silk drape is sourced directly from certified artisan clusters across India.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#68081C]" />
            <h4 className="font-serif font-bold text-lg text-gray-900">Direct-From-Weaver Pricing</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Eliminating middlemen markups to deliver royal luxury at authentic, honest prices.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#68081C]" />
            <h4 className="font-serif font-bold text-lg text-gray-900">Personal Assistance</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Real-time WhatsApp video calls and consultations to help you choose the perfect drape.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#68081C]" />
            <h4 className="font-serif font-bold text-lg text-gray-900">Timeless Elegance</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Heirloom sarees designed to be cherished and passed down through generations.
            </p>
          </div>
        </div>
      </section>

      {/* Final Callout Banner */}
      <section className="bg-[#68081C] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl" data-aos="fade-up">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="font-serif text-3xl font-bold">Experience the {BRAND.name} Splendor</h3>
          <p className="text-gray-200 text-xs sm:text-sm">
            Looking for bridal pattu, festive silk, or pure cotton handlooms? Contact our store team in Hyderabad!
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="bg-[#D4AF37] hover:bg-[#B88E28] text-[#68081C] px-8 py-3 rounded-xl font-extrabold text-sm inline-flex items-center gap-2 transition-transform hover:scale-105 shadow-md cursor-pointer"
          >
            <span>Visit or Contact Us</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

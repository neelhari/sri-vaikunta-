import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MessageCircle, Heart, ArrowUp, MapPin } from 'lucide-react';
import { InstagramIcon, FacebookIcon } from './BrandIcons';
import { BRAND, waLink } from '../config/brand';
import { useStoreData } from '../context/StoreDataContext';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'All 14 Saree Categories', path: '/categories' },
  { label: 'Browse All Sarees', path: '/shop' },
  { label: 'Dharmavaram Pure Pattu', path: '/shop?category=dharmavaram-pure-pattu' },
  { label: 'Pochampally Silk Ikkat', path: '/shop?category=pochampally-pattu' },
  { label: 'Banarasi Brocade Sarees', path: '/shop?category=banarasi-sarees' },
  { label: 'Kalamkari & Cotton Sarees', path: '/shop?category=kalamkari-cotton' },
  { label: 'My Account & Orders', path: '/account' },
  { label: 'Our Heritage Story', path: '/our-story' },
  { label: 'Store Location & Contact', path: '/contact' },
];

const policyLinks = [
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Return & Refund Policy', path: '/return-policy' },
  { label: 'Shipping Policy', path: '/shipping-policy' },
  { label: 'Terms & Conditions', path: '/terms' },
];

export default function Footer() {
  const navigate = useNavigate();
  const { settings } = useStoreData();

  const phone = settings?.phone || BRAND.phone;
  const email = settings?.supportEmail || settings?.email || BRAND.email;
  const address = settings?.address || BRAND.address.full;
  const whatsappDigits = settings?.whatsapp ? String(settings.whatsapp).replace(/[^0-9]/g, '') : BRAND.whatsappNumber;
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hello ${BRAND.fullName}, I have an inquiry.`)}`
    : waLink(`Hello ${BRAND.fullName}, I have an inquiry.`);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (path) => {
    navigate(path);
    scrollToTop();
  };

  return (
    <footer className="bg-[#2D030A] text-gray-200 border-t-4 border-[#D4AF37] font-sans relative mb-14 xl:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div
              onClick={() => handleNav('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-12 w-12 rounded-full bg-[#FAF5EE] ring-2 ring-[#D4AF37]/60 shadow-md flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform p-1">
                <img src="/logo-icon.png" alt={BRAND.fullName} className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide group-hover:text-[#D4AF37] transition-colors">
                  {BRAND.fullName}
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#D4AF37] font-semibold">
                  {BRAND.tagline}
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              {BRAND.description || "Hyderabad's trusted destination for authentic handloom silk, Dharmavaram pure pattu, Pochampally ikkat, and artisan cotton sarees at honest, direct-from-weaver prices."}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#4A0513] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#68081C] transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#4A0513] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#68081C] transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#4A0513] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#25D366] transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wider mb-4 border-b border-[#68081C] pb-2 inline-block">
              SAREE COLLECTIONS
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {quickLinks.slice(0, 7).map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => handleNav(item.path)}
                    className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span className="text-[#D4AF37]">›</span> {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Policies */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wider mb-4 border-b border-[#68081C] pb-2 inline-block">
              HELP & POLICIES
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {policyLinks.map((policy) => (
                <li key={policy.path}>
                  <button
                    onClick={() => handleNav(policy.path)}
                    className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span className="text-[#D4AF37]">›</span> {policy.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNav('/our-story')}
                  className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <span className="text-[#D4AF37]">›</span> Our Heritage Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/contact')}
                  className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <span className="text-[#D4AF37]">›</span> Visit Hyderabad Store
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wider mb-4 border-b border-[#68081C] pb-2 inline-block">
              STORE LOCATION
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-gray-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{address}</span>
              </div>
              <p className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <a href={`tel:${phone}`} className="hover:text-white transition-colors">
                  {phone}
                </a>
              </p>
              <p className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  WhatsApp Support
                </a>
              </p>
              <p className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors break-all">
                  {email}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & scroll to top */}
        <div className="pt-6 border-t border-[#4A0513] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 {BRAND.fullName}. All Rights Reserved.</p>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
            <span>for authentic Indian handloom heritage.</span>
          </div>
          <button
            onClick={scrollToTop}
            className="w-8 h-8 bg-[#68081C] hover:bg-[#7E0C23] text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm cursor-pointer"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}

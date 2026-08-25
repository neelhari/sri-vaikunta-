import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, Phone, MapPin, ChevronRight, MessageCircle, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { BRAND, waLink } from '../config/brand';

const navLinks = [
  { path: '/', label: 'HOME' },
  { path: '/categories', label: 'CATEGORIES' },
  { path: '/shop', label: 'ALL SAREES' },
  { path: '/shop?category=dharmavaram-pure-pattu', label: 'PURE PATTU' },
  { path: '/shop?category=pochampally-pattu', label: 'POCHAMPALLY' },
  { path: '/shop?category=banarasi-sarees', label: 'BANARASI' },
  { path: '/shop?category=kalamkari-cotton', label: 'KALAMKARI' },
  { path: '/our-story', label: 'OUR STORY' },
  { path: '/contact', label: 'CONTACT' },
];

export default function Navbar() {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { setIsSearchOpen } = useUI();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUrl = location.pathname + location.search;
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Determine if header should be transparent (only on homepage at top on mobile/desktop)
  const isTransparent = isHomePage && !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 font-sans ${
        isTransparent
          ? 'bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white border-transparent'
          : 'bg-white shadow-sm border-b border-gray-100 text-gray-900'
      }`}
    >
      {/* Main Header / Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 xl:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Typography Lockup */}
          <div
            onClick={() => goTo('/')}
            className="cursor-pointer flex items-center gap-2.5 sm:gap-3 shrink-0 group"
          >
            <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden transition-transform group-hover:scale-105">
              <img
                src="/logo-circle.png"
                alt={BRAND.fullName}
                className="h-full w-full object-cover rounded-full"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
            <div className="flex flex-col justify-center">
              <span
                className={`font-serif font-extrabold text-base sm:text-xl lg:text-2xl tracking-wide leading-tight transition-colors ${
                  isTransparent ? 'text-white drop-shadow-md' : 'text-[#68081C]'
                }`}
              >
                SRI VAIKUNTA
              </span>
              <span
                className={`text-[8px] sm:text-[9px] uppercase tracking-[0.22em] font-bold block leading-none ${
                  isTransparent ? 'text-[#F3E5AB] drop-shadow' : 'text-[#D4AF37]'
                }`}
              >
                PREMIUM SAREES
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex flex-nowrap justify-center items-center gap-x-3 2xl:gap-x-4 text-[10px] 2xl:text-[11px] font-bold tracking-wider flex-1 min-w-0">
            {navLinks.map((link) => {
              const isActive = currentUrl === link.path || (link.path === '/' && currentUrl === '');
              return (
                <button
                  key={link.path}
                  onClick={() => goTo(link.path)}
                  className={`relative py-1.5 transition-colors duration-200 cursor-pointer ${
                    isTransparent
                      ? isActive
                        ? 'text-[#F3E5AB] font-bold'
                        : 'text-white/90 hover:text-[#F3E5AB]'
                      : isActive
                      ? 'text-[#68081C] font-bold'
                      : 'text-gray-700 hover:text-[#68081C]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full ${
                        isTransparent ? 'bg-[#F3E5AB]' : 'bg-[#68081C]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isTransparent
                  ? 'text-white hover:bg-white/20'
                  : 'text-gray-700 hover:text-[#68081C] hover:bg-gray-100'
              }`}
              title="Search sarees"
            >
              <Search className="w-5 h-5 drop-shadow" />
            </button>

            {/* Wishlist / Like Icon */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className={`p-2 rounded-full transition-colors relative cursor-pointer ${
                isTransparent
                  ? 'text-white hover:bg-white/20'
                  : 'text-gray-700 hover:text-[#68081C] hover:bg-gray-100'
              }`}
              title="My Wishlist"
            >
              <Heart className="w-5 h-5 drop-shadow" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-[#4A0513] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-slideRight">
            <div className="p-3 bg-[#68081C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full overflow-hidden shrink-0">
                  <img src="/logo-circle.png" alt={BRAND.fullName} className="h-full w-full object-cover" />
                </div>
                <div>
                  <span className="font-serif font-bold text-base text-white block leading-tight">SRI VAIKUNTA</span>
                  <span className="text-[8px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold block leading-none">PREMIUM SAREES</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-gray-200 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = currentUrl === link.path || (link.path === '/' && currentUrl === '');
                return (
                  <button
                    key={link.path}
                    onClick={() => goTo(link.path)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#FDF5F6] text-[#68081C]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#68081C]' : 'text-gray-400'}`} />
                  </button>
                );
              })}

              <div className="pt-2 border-t border-gray-100 mt-2 space-y-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsWishlistOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#68081C]" />
                    <span>My Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-[#68081C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount} items
                    </span>
                  )}
                </button>

                <button
                  onClick={() => goTo('/account')}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5 text-[#68081C]" />
                  <span>My Account</span>
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 px-4 space-y-3 text-xs text-gray-600">
                <p className="font-bold uppercase tracking-wider text-[#68081C]">Hyderabad Store Location</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#68081C] shrink-0 mt-0.5" />
                  <span>{BRAND.address.full}</span>
                </div>
                <a href={`tel:${BRAND.phone}`} className="flex items-center gap-2 hover:text-[#68081C]">
                  <Phone className="w-4 h-4 text-[#68081C]" />
                  <span>{BRAND.phone}</span>
                </a>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-[#FAF8F5] text-center">
              <a
                href={waLink(`Hello ${BRAND.fullName}, I have an inquiry.`)}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25D366] text-white py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

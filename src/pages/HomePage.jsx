import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Tag, Heart, Award, CheckCircle2, ShoppingBag, Star, TrendingUp, ChevronRight, Phone, MessageCircle, Flame } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import ProductCard from '../components/ProductCard';
import { BRAND, waLink } from '../config/brand';

// Exact 8-Cusped Royal Koskii Scalloped Arch Path (Normalized to 100x100 box)
const KOSKII_ARCH_PATH = "M 50,4 C 57,4 62,11 68,12 C 74,13 80,8 86,14 C 92,20 87,26 88,32 C 89,38 96,43 96,50 C 96,57 89,62 88,68 C 87,74 92,80 86,86 C 80,92 74,87 68,88 C 62,89 57,96 50,96 C 43,96 38,89 32,88 C 26,87 20,92 14,86 C 8,80 13,74 12,68 C 11,62 4,57 4,50 C 4,43 11,38 12,32 C 13,26 8,20 14,14 C 20,8 26,13 32,12 C 38,11 43,4 50,4 Z";

export default function HomePage() {
  const navigate = useNavigate();
  const { products, categories } = useStoreData();

  const heroSlides = [
    {
      image: '/slider/hero_slide_1.png',
      badge: 'The Grand Festive Heritage Sale',
      title: 'ROYAL DHARMAVARAM\nPURE PATTU SAREES',
      offer: 'FLAT 20% - 30% OFF WEAVER PRICES',
      subtitle: 'Heavy Gold Zari Bridal & Festive Heritage Weaves.',
      category: 'dharmavaram-pure-pattu',
    },
    {
      image: '/slider/hero_slide_2.png',
      badge: 'Festive Fashion Collection',
      title: 'POCHAMPALLY & BRIDAL\nSILK ENSEMBLES',
      offer: 'UP TO 30% OFF MASTER WEAVES',
      subtitle: 'Artisan Double Ikkat Silk & Handwoven Drapes.',
      category: 'pochampally-pattu',
    },
    {
      image: '/slider/hero_slide_3.png',
      badge: 'Royal Brocade Edition',
      title: 'BANARASI & GADWAL\nHANDLOOM SAREES',
      offer: 'DIRECT FROM MASTER WEAVERS',
      subtitle: 'Kashi Antique Zari & Traditional Temple Borders.',
      category: 'banarasi-sarees',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(slideInterval);
  }, [heroSlides.length]);

  // Curated collections for mobile sections
  const bridalPattu = products.filter(p => p.category === 'dharmavaram-pure-pattu' || p.category === 'banarasi-sarees' || p.category === 'pochampally-pattu').slice(0, 4);
  const everydayCotton = products.filter(p => p.category === 'kalamkari-cotton' || p.category === 'cotton-sarees' || p.category === 'mangalgiri-digital-print').slice(0, 4);
  const trendingSarees = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);

  // 4 Featured Offer Tiles for "The Savings Edit"
  const savingsEditTiles = [
    {
      title: "PURE PATTU SAREES",
      discount: "FLAT 25% OFF",
      category: "dharmavaram-pure-pattu",
      image: "/products/cat_pure_pattu.jpg",
    },
    {
      title: "POCHAMPALLY IKKAT",
      discount: "FLAT 20% - 30% OFF",
      category: "pochampally-pattu",
      image: "/products/cat_pochampally.jpg",
    },
    {
      title: "BANARASI SILK",
      discount: "FLAT 30% OFF",
      category: "banarasi-sarees",
      image: "/products/cat_banarasi.jpg",
    },
    {
      title: "HANDLOOM COTTONS",
      discount: "FLAT 25% OFF",
      category: "kalamkari-cotton",
      image: "/products/cat_kalamkari.jpg",
    },
  ];

  const activeSlide = heroSlides[currentSlide];

  return (
    <div className="pb-16 bg-[#FFFDF9] min-h-screen font-sans">
      {/* GLOBAL SVG DEFINITIONS FOR KOSKII SCALLOPED ARCH CLIP */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="koskii-scallop-clip" clipPathUnits="userSpaceOnUse">
            <path d={KOSKII_ARCH_PATH} />
          </clipPath>
        </defs>
      </svg>

      {/* 1. FULL-BLEED HERO BANNER WITH 3 DISTINCT CATEGORY SLIDES */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#1F0207] to-[#4A0513] text-white">
        <div
          onClick={() => navigate(`/shop?category=${activeSlide.category}`)}
          className="relative h-[82vh] sm:h-[580px] md:h-[640px] w-full cursor-pointer flex flex-col justify-end pb-8 sm:pb-12 px-6 text-center items-center group"
        >
          {heroSlides.map((slide, index) => (
            <img
              key={index}
              src={slide.image}
              alt={`Sri Vaikunta Festive Saree Slide ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ${
                index === currentSlide ? 'opacity-95 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            />
          ))}

          {/* Seamless Top & Bottom Shadow Gradients for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85 pointer-events-none" />

          {/* Hero Festive Text Lockup */}
          <div className="relative z-10 space-y-2.5 max-w-lg mx-auto flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-serif italic text-[#F3E5AB] tracking-[0.25em] uppercase font-bold drop-shadow-md">
              {activeSlide.badge}
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight drop-shadow-xl text-white whitespace-pre-line">
              {activeSlide.title}
            </h1>

            <div className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-[#4A0513] px-3.5 py-1 rounded-full text-[10.5px] sm:text-xs font-black uppercase tracking-wider shadow-lg">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{activeSlide.offer}</span>
            </div>

            <p className="text-[11px] sm:text-xs text-gray-200 max-w-xs sm:max-w-md line-clamp-2 drop-shadow">
              {activeSlide.subtitle}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/shop?category=${activeSlide.category}`);
              }}
              className="mt-2 bg-white hover:bg-[#FAF5EE] text-[#68081C] font-extrabold text-xs sm:text-sm tracking-widest uppercase px-9 py-3.5 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-[#D4AF37]/40"
            >
              SHOP NOW
            </button>

            {/* Pagination Indicators */}
            <div className="pt-2 flex items-center justify-center gap-2">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-7 bg-[#D4AF37]' : 'w-2 bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. KOSKII PEACH/CORAL BLUSH INFINITE SCROLLING TICKER */}
      <div className="bg-[#FFE4DF] text-[#7E0C23] py-2 px-2 text-[11px] sm:text-xs font-medium tracking-wide border-y border-[#FBC8BE] overflow-hidden shadow-2xs">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
          <div className="flex items-center gap-8 shrink-0">
            <span className="flex items-center gap-1.5">
              <strong className="font-extrabold text-[#E01E5A]">FIRST ORDER</strong> & Get extra 15% Off |
            </span>
            <span className="flex items-center gap-1.5">
              Get extra 10% off Use: <strong className="font-extrabold text-[#E01E5A] bg-[#FFD0D6] px-2 py-0.5 rounded-sm tracking-wider font-mono">SV10</strong> |
            </span>
            <span className="flex items-center gap-1.5">
              🚚 <strong>FREE EXPRESS SHIPPING</strong> on orders above ₹{BRAND.freeShippingThreshold.toLocaleString('en-IN')} |
            </span>
            <span className="flex items-center gap-1.5">
              ✨ <strong>100% PURE SILK</strong> Certified Dharmavaram & Pochampally Weaves |
            </span>
          </div>

          {/* Seamless loop duplication */}
          <div className="flex items-center gap-8 shrink-0" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <strong className="font-extrabold text-[#E01E5A]">FIRST ORDER</strong> & Get extra 15% Off |
            </span>
            <span className="flex items-center gap-1.5">
              Get extra 10% off Use: <strong className="font-extrabold text-[#E01E5A] bg-[#FFD0D6] px-2 py-0.5 rounded-sm tracking-wider font-mono">SV10</strong> |
            </span>
            <span className="flex items-center gap-1.5">
              🚚 <strong>FREE EXPRESS SHIPPING</strong> on orders above ₹{BRAND.freeShippingThreshold.toLocaleString('en-IN')} |
            </span>
            <span className="flex items-center gap-1.5">
              ✨ <strong>100% PURE SILK</strong> Certified Dharmavaram & Pochampally Weaves |
            </span>
          </div>
        </div>
      </div>

      {/* 3. EXACT KOSKII SCALLOPED JHAROKHA CATEGORY STORIES */}
      <section className="py-6 bg-white border-b border-gray-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#68081C] tracking-[0.18em] uppercase">
              CATEGORIES
            </h3>
            <button
              onClick={() => navigate('/categories')}
              className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal Smooth Scroll Bar */}
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-3 hide-scroll snap-x items-start">
            {/* 1. Koskii Exact Scalloped SALE Burst Badge */}
            <div
              onClick={() => navigate('/shop')}
              className="flex flex-col items-center shrink-0 w-[88px] sm:w-28 group cursor-pointer snap-start text-center"
            >
              <div className="w-[82px] h-[82px] sm:w-[96px] sm:h-[96px] relative group-hover:scale-108 transition-transform drop-shadow-md">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d={KOSKII_ARCH_PATH} fill="#C71261" />
                  <path d={KOSKII_ARCH_PATH} fill="none" stroke="#F6D55C" strokeWidth="2.8" />
                  <path d={KOSKII_ARCH_PATH} fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" />
                  {[...Array(12)].map((_, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={50 + 40 * Math.cos((i * Math.PI) / 6)}
                      y2={50 + 40 * Math.sin((i * Math.PI) / 6)}
                      stroke="#E82378"
                      strokeWidth="1.5"
                    />
                  ))}
                  <text
                    x="50"
                    y="56"
                    fontFamily="serif"
                    fontSize="20"
                    fontWeight="bold"
                    fill="#F6D55C"
                    textAnchor="middle"
                    letterSpacing="1"
                  >
                    SALE
                  </text>
                </svg>
              </div>
              <span className="mt-2 text-[11px] sm:text-xs font-black text-[#C71261] uppercase tracking-wide group-hover:text-[#A00E36] transition-colors">
                FESTIVE SALE
              </span>
            </div>

            {/* Saree Categories in Scalloped Jharokha Frames with Pure Fabric Crops */}
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/shop?category=${cat.id}`)}
                className="flex flex-col items-center shrink-0 w-[88px] sm:w-28 group cursor-pointer snap-start text-center"
              >
                <div className="w-[82px] h-[82px] sm:w-[96px] sm:h-[96px] relative group-hover:scale-108 transition-transform drop-shadow-md">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <image
                      href={cat.image}
                      clipPath="url(#koskii-scallop-clip)"
                      width="100"
                      height="100"
                      preserveAspectRatio="xMidYMid slice"
                    />
                    <path
                      d={KOSKII_ARCH_PATH}
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="2.8"
                    />
                    <path
                      d={KOSKII_ARCH_PATH}
                      fill="none"
                      stroke="#FFFDF9"
                      strokeWidth="1"
                      opacity="0.7"
                    />
                  </svg>
                </div>
                <span className="mt-2 text-[11px] sm:text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#68081C] transition-colors uppercase tracking-tight">
                  {cat.name.replace(' Sarees', '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE SAVINGS EDIT (EXACT KOSKII 2x2 CURATED PROMO GRID) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {/* Title Lockup */}
        <div className="text-center space-y-1">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-[#68081C] tracking-[0.15em] uppercase">
            THE SAVINGS EDIT
          </h2>
          <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto"></div>
        </div>

        {/* 2x2 Grid on Mobile & 4-Column on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pt-2">
          {savingsEditTiles.map((tile, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/shop?category=${tile.category}`)}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Saree Image */}
              <img
                src={tile.image}
                alt={tile.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />

              {/* Dark Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

              {/* Inlaid Gold Filigree Border (Koskii Signature) */}
              <div className="absolute inset-2.5 rounded-xl border border-[#D4AF37]/80 pointer-events-none group-hover:border-[#F6D55C] transition-colors" />

              {/* Tile Content (Bottom Left) */}
              <div className="absolute bottom-4 left-4 right-4 text-center z-10 space-y-0.5">
                <span className="font-serif text-xs sm:text-sm font-bold text-white tracking-wider block drop-shadow-md">
                  {tile.title}
                </span>
                <span className="font-sans text-xs sm:text-sm font-black text-[#F6D55C] tracking-wide block drop-shadow-lg">
                  {tile.discount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. THE ROYAL BRIDAL EDIT (PRODUCTS START IMMEDIATELY) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-4">
        <div className="flex items-end justify-between border-b border-[#F3E5AB]/60 pb-2.5">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] text-[#D4AF37] block">
              Pure Silk Heritage
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#68081C] tracking-wide">
              THE ROYAL BRIDAL EDIT
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop?category=dharmavaram-pure-pattu')}
            className="text-xs font-bold text-[#68081C] hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer"
          >
            See All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2-Column Mobile Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {bridalPattu.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>



      {/* 7. EVERYDAY HANDLOOMS & COTTON EDIT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-end justify-between border-b border-[#F3E5AB]/60 pb-2.5">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] text-[#D4AF37] block">
              Breathable Comfort
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#68081C] tracking-wide">
              HANDLOOM COTTON & KALAMKARI
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop?category=kalamkari-cotton')}
            className="text-xs font-bold text-[#68081C] hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer"
          >
            See All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {everydayCotton.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. TRENDING NOW (HORIZONTAL PRODUCT SCROLL) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-4">
        <div className="flex items-end justify-between border-b border-[#F3E5AB]/60 pb-2.5">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] text-[#D4AF37] block">
              Customer Favorites
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#68081C] tracking-wide">
              TRENDING NOW
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-bold text-[#68081C] hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Smooth Scroll for Trending Products */}
        <div className="flex gap-3.5 sm:gap-5 overflow-x-auto pb-4 hide-scroll snap-x items-stretch">
          {trendingSarees.map((product) => (
            <div key={product.id} className="w-[185px] sm:w-[225px] shrink-0 snap-start flex flex-col">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* 9. TRUST BADGES / USP CAPSULE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 bg-white border border-[#F3E5AB]/70 rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FDF5F6] text-[#68081C] flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">100% Pure Silk</h4>
              <p className="text-[10px] sm:text-xs text-gray-500">Certified Weaves</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FDF5F6] text-[#68081C] flex items-center justify-center shrink-0 shadow-2xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Free Express Shipping</h4>
              <p className="text-[10px] sm:text-xs text-gray-500">Orders above ₹{BRAND.freeShippingThreshold.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FDF5F6] text-[#68081C] flex items-center justify-center shrink-0 shadow-2xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Direct Weaver Prices</h4>
              <p className="text-[10px] sm:text-xs text-gray-500">Zero Middleman Markup</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FDF5F6] text-[#68081C] flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">WhatsApp Video Assist</h4>
              <p className="text-[10px] sm:text-xs text-gray-500">Live Saree Draping View</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

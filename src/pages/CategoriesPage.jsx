import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronRight, ShoppingBag, Flame, Search, X } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import ProductCard from '../components/ProductCard';
import { BRAND } from '../config/brand';

const shortCategoryNames = {
  'dharmavaram-pure-pattu': 'Dharmavaram\nPure Pattu',
  'dharmavaram-semi-pattu': 'Dharmavaram\nSemi Pattu',
  'pochampally-pattu': 'Pochampally\nPattu',
  'banarasi-sarees': 'Banarasi Silk',
  'semi-gadwal-sarees': 'Semi Gadwal',
  'mangalgiri-digital-print': 'Mangalgiri',
  'kalamkari-cotton': 'Kalamkari',
  'cotton-sarees': 'Handloom Cotton',
  'kota-sarees': 'Kota Sarees',
  'mysore-sarees': 'Mysore Silk',
  'ikkat-sarees': 'Ikkat Sarees',
  'chinnon-sarees': 'Chinnon',
  'fancy-sarees': 'Fancy Sarees',
  'ho-sarees': 'HO Specials',
};

export default function CategoriesPage() {
  const { categories, products, promotions = {} } = useStoreData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCatId, setSelectedCatId] = useState(
    categoryParam || (categories.length > 0 ? categories[0].id : 'dharmavaram-pure-pattu')
  );
  const [searchQuery, setSearchQuery] = useState('');

  const allCatBanners = Array.isArray(promotions.categoryBanners) && promotions.categoryBanners.length > 0
    ? promotions.categoryBanners.filter((b) => b.active !== false)
    : [];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-advance banner every 3.5s across all active banners
  useEffect(() => {
    if (allCatBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % allCatBanners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [allCatBanners.length]);

  // If a specific category is clicked, lock to that category's banner if matched; otherwise rotate through all active banners!
  const matchedCategoryBanner = allCatBanners.find((b) => b.category === selectedCatId && b.category !== 'all');
  const matchedBanner =
    matchedCategoryBanner ||
    allCatBanners[currentSlideIndex % (allCatBanners.length || 1)] ||
    allCatBanners.find((b) => b.category === 'all') ||
    allCatBanners[0] ||
    promotions?.categoryHero || {
      image: '/slider/hero_saree_model.png',
      badge: 'THE HERITAGE EDIT',
      title: 'Royal Saree Collections',
      subtitle: '14 Handcrafted Master-Weaver Traditions • Pure Silk & Pattu',
    };

  // Sync state if URL changes (e.g. from homepage navigation)
  useEffect(() => {
    if (categoryParam && categoryParam !== selectedCatId) {
      setSelectedCatId(categoryParam);
    }
  }, [categoryParam]);

  const selectedCategory = categories.find((c) => c.id === selectedCatId) || categories[0] || {};
  
  // Filter products by selected category and live search query
  const categoryProducts = products.filter((p) => {
    const matchesCategory = searchQuery ? true : p.category === selectedCatId;
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.fabric?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const displayProducts = categoryProducts;

  const handleCategorySelect = (id) => {
    setSelectedCatId(id);
    setSearchQuery('');
    setSearchParams({ category: id });
  };

  return (
    <div className="bg-[#FFFDF9] min-h-screen font-sans pb-16">
      {/* 1. LUXURY MOBILE-FIRST BRIDAL HERO BANNER (AUTO-ADVANCING 3.5s SLIDESHOW) */}
      <div className="relative w-full h-44 sm:h-60 md:h-72 overflow-hidden bg-[#250208] text-white shadow-md group">
        <img
          key={matchedBanner.image || matchedBanner.id}
          src={matchedBanner.image || '/slider/hero_saree_model.png'}
          alt={matchedBanner.title || 'Sri Vaikunta Bridal Saree Collections'}
          className="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-all duration-1000 ease-in-out animate-fadeIn"
        />

        {/* Ambient Dark Gradient Vignette for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Delicate Inlaid Gold Border */}
        <div className="absolute inset-2 sm:inset-3 rounded-2xl border border-[#D4AF37]/50 pointer-events-none" />

        {/* Text Overlay Content */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-center items-start space-y-1 sm:space-y-2">
          {matchedBanner.badge && (
            <div className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-[#4A0513] text-[9px] sm:text-[11px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md">
              <Flame className="w-3 h-3 fill-current" />
              <span>{matchedBanner.badge}</span>
            </div>
          )}

          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-wide leading-tight drop-shadow-xl whitespace-pre-line">
            {matchedBanner.title || 'Royal Saree Collections'}
          </h1>

          <p className="text-[11px] sm:text-xs text-[#F3E5AB] max-w-xs sm:max-w-md line-clamp-1 font-medium drop-shadow">
            {matchedBanner.subtitle || '14 Handcrafted Master-Weaver Traditions • Pure Silk & Pattu'}
          </p>
        </div>

        {/* Left / Right Arrow Controls */}
        {allCatBanners.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlideIndex((prev) => (prev - 1 + allCatBanners.length) % allCatBanners.length);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all cursor-pointer font-bold text-lg"
              title="Previous Banner"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlideIndex((prev) => (prev + 1) % allCatBanners.length);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all cursor-pointer font-bold text-lg"
              title="Next Banner"
            >
              ›
            </button>
          </>
        )}

        {/* Multi-banner Navigation Dots */}
        {allCatBanners.length > 1 && (
          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            {allCatBanners.map((b, idx) => {
              const isCurrent = currentSlideIndex === idx;
              return (
                <button
                  key={b.id || idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    isCurrent ? 'w-5 bg-[#D4AF37]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  title={b.title}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 2. REAL-TIME SEARCH FIELD BELOW BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3.5 pb-1">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sarees by name, silk, or weave..."
            className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-9 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#68081C] focus:ring-1 focus:ring-[#68081C] shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. HORIZONTAL SQUARE-CURVE (SQUIRCLE) CATEGORY BAR */}
      <div className="sticky top-[58px] z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-1 px-1 hide-scroll snap-x items-start">
            {/* All Sarees Tab */}
            <button
              onClick={() => handleCategorySelect('all')}
              className={`group flex flex-col items-center gap-1.5 shrink-0 p-1.5 rounded-2xl transition-all cursor-pointer snap-start ${
                selectedCatId === 'all'
                  ? 'bg-[#FAF5EE] text-[#68081C] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 transition-all p-0.5 flex items-center justify-center bg-gradient-to-br from-[#FAF5EE] to-[#EADEDF] ${
                  selectedCatId === 'all'
                    ? 'border-[#68081C] ring-2 ring-[#68081C]/20 shadow-md'
                    : 'border-gray-200 group-hover:border-[#68081C]/50'
                }`}
              >
                <Sparkles className="w-6 h-6 text-[#68081C]" />
              </div>
              <span className={`text-[10px] sm:text-[11px] font-bold text-center leading-tight whitespace-pre-line ${
                selectedCatId === 'all' ? 'text-[#68081C] font-extrabold' : 'text-gray-700'
              }`}>
                All Sarees
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = !searchQuery && selectedCatId === cat.id;
              const shortName = shortCategoryNames[cat.id] || cat.name.replace(' Sarees', '');
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="flex flex-col items-center shrink-0 w-[82px] sm:w-[92px] group cursor-pointer snap-start text-center transition-all px-0.5"
                >
                  {/* Clean Rounded-Square (Squircle) Avatar */}
                  <div
                    className={`w-[66px] h-[66px] sm:w-[76px] sm:h-[76px] rounded-2xl overflow-hidden p-[2px] transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#68081C] ring-2 ring-[#D4AF37] scale-105 shadow-md'
                        : 'bg-[#FAF5EE] border border-gray-200 opacity-90 hover:opacity-100 hover:scale-103'
                    }`}
                  >
                    <div className="w-full h-full rounded-[14px] overflow-hidden bg-gray-100">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Clean Non-Overlapping Category Label (Formatted across 2 lines) */}
                  <span
                    className={`mt-1.5 text-[9.5px] sm:text-[10.5px] font-bold text-center leading-[1.15] uppercase tracking-tight whitespace-pre-line transition-colors ${
                      isSelected ? 'text-[#68081C] font-extrabold' : 'text-gray-700'
                    }`}
                  >
                    {shortName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. CLEAN PRODUCTS GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-4">
        {/* Simple & Clean Single-Line Header */}
        <div className="flex items-center justify-between gap-2 border-b border-[#F3E5AB]/70 pb-2.5">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <h2 className="font-serif text-sm sm:text-lg md:text-xl font-bold text-[#68081C] uppercase tracking-wider truncate">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory.name
                ? selectedCategory.name.replace(' Sarees', '')
                : 'Saree Collection'}
            </h2>
            <span className="text-[10px] sm:text-xs text-[#D4AF37] font-bold shrink-0">
              ({displayProducts.length})
            </span>
          </div>

          {displayProducts.length > 0 && (
            <button
              onClick={() => navigate(`/shop?category=${selectedCategory.id}`)}
              className="text-[11px] sm:text-xs font-bold text-[#68081C] hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap bg-[#FDF5F6] px-3 py-1 rounded-full border border-[#F5D8DD]"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Dynamic 2-Column Mobile Product Grid or Honest Empty State */}
        {displayProducts.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-3xl border border-[#F3E5AB]/60 shadow-2xs space-y-3.5 my-4">
            <div className="w-14 h-14 rounded-full bg-[#FDF5F6] text-[#68081C] flex items-center justify-center mx-auto shadow-2xs border border-[#F5D8DD]">
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#68081C]">
                {searchQuery ? 'No Sarees Match Your Search' : 'New Weaves Arriving Soon'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {searchQuery
                  ? `We couldn't find any sarees matching "${searchQuery}". Try searching for silk, pattu, or color.`
                  : `Master weavers are crafting fresh ${selectedCategory.name || 'saree'} pieces. In the meantime, explore our other pure silk collections!`}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="bg-[#FAF5EE] text-[#68081C] hover:bg-[#F3EAE0] px-4 py-2 rounded-full text-xs font-bold transition-all border border-[#D4AF37]/40 cursor-pointer"
                >
                  Clear Search
                </button>
              )}
              <button
                onClick={() => handleCategorySelect('dharmavaram-pure-pattu')}
                className="bg-[#68081C] text-white hover:bg-[#4A0513] px-5 py-2 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                View Pure Pattu Sarees
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

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
  const navigate = useNavigate();
  const { categories, products } = useStoreData();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCatId, setSelectedCatId] = useState(categoryParam || (categories[0]?.id || 'dharmavaram-pure-pattu'));
  const [searchQuery, setSearchQuery] = useState('');

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

  const displayProducts = categoryProducts.length > 0 ? categoryProducts : products.slice(0, 6);

  const handleCategorySelect = (id) => {
    setSelectedCatId(id);
    setSearchQuery('');
    setSearchParams({ category: id });
  };

  return (
    <div className="bg-[#FFFDF9] min-h-screen font-sans pb-16">
      {/* 1. LUXURY MOBILE-FIRST BRIDAL HERO BANNER */}
      <div className="relative w-full h-44 sm:h-60 md:h-72 overflow-hidden bg-[#250208] text-white shadow-md">
        <img
          src="/slider/hero_saree_model.png"
          alt="Sri Vaikunta Bridal Saree Collections"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
        />

        {/* Ambient Dark Gradient Vignette for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Delicate Inlaid Gold Border */}
        <div className="absolute inset-2 sm:inset-3 rounded-2xl border border-[#D4AF37]/50 pointer-events-none" />

        {/* Text Overlay Content */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-center items-start space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-[#4A0513] text-[9px] sm:text-[11px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md">
            <Flame className="w-3 h-3 fill-current" />
            <span>THE HERITAGE EDIT</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-wide leading-tight drop-shadow-xl">
            Royal Saree Collections
          </h1>

          <p className="text-[11px] sm:text-xs text-[#F3E5AB] max-w-xs sm:max-w-md line-clamp-1 font-medium drop-shadow">
            14 Handcrafted Master-Weaver Traditions • Pure Silk & Pattu
          </p>
        </div>
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
              ({categoryProducts.length})
            </span>
          </div>

          <button
            onClick={() => navigate(`/shop?category=${selectedCategory.id}`)}
            className="text-[11px] sm:text-xs font-bold text-[#68081C] hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap bg-[#FDF5F6] px-3 py-1 rounded-full border border-[#F5D8DD]"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Dynamic 2-Column Mobile Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronRight, ShoppingBag, Flame } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import ProductCard from '../components/ProductCard';
import { BRAND } from '../config/brand';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { categories, products } = useStoreData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || (categories[0]?.id || 'dharmavaram-pure-pattu');
  const [selectedCatId, setSelectedCatId] = useState(initialCategory);

  const selectedCategory = categories.find((c) => c.id === selectedCatId) || categories[0] || {};
  
  // Filter products for the active selected category
  const categoryProducts = products.filter((p) => p.category === selectedCatId);
  const displayProducts = categoryProducts.length > 0 ? categoryProducts : products.slice(0, 6);

  const handleCategorySelect = (id) => {
    setSelectedCatId(id);
    setSearchParams({ category: id });
  };

  return (
    <div className="bg-[#FFFDF9] min-h-screen font-sans pb-16">
      {/* 1. TOP SLEEK PROMO BANNER */}
      <div className="bg-gradient-to-r from-[#4A0513] via-[#68081C] to-[#4A0513] text-white py-4 px-4 sm:px-8 text-center shadow-xs">
        <div className="max-w-4xl mx-auto space-y-0.5">
          <span className="inline-flex items-center gap-1 text-[#F3E5AB] text-[9.5px] sm:text-[10px] font-bold uppercase tracking-widest">
            <Flame className="w-3 h-3 text-[#D4AF37] fill-current" /> 14 HERITAGE SAREE WEAVES
          </span>
          <h1 className="font-serif text-xl sm:text-3xl font-bold tracking-wide text-white">
            Explore Saree Collections
          </h1>
        </div>
      </div>

      {/* 2. HORIZONTAL SQUARE-CURVE (SQUIRCLE) CATEGORY BAR */}
      <div className="sticky top-[58px] z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs py-3.5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-3.5 sm:gap-5 overflow-x-auto pb-1 hide-scroll snap-x items-start">
            {categories.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="flex flex-col items-center shrink-0 w-[74px] sm:w-22 group cursor-pointer snap-start text-center transition-all"
                >
                  {/* Clean Rounded-Square (Squircle) Avatar */}
                  <div
                    className={`w-[66px] h-[66px] sm:w-[78px] sm:h-[78px] rounded-2xl overflow-hidden p-[2px] transition-all duration-300 ${
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

                  {/* Clean Category Label */}
                  <span
                    className={`mt-1.5 text-[10px] sm:text-[11px] font-bold line-clamp-2 leading-tight uppercase transition-colors ${
                      isSelected ? 'text-[#68081C] font-extrabold' : 'text-gray-700'
                    }`}
                  >
                    {cat.name.replace(' Sarees', '')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. CLEAN PRODUCTS GRID (ZERO CLUTTER, DIRECT TO SAREES) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-4">
        {/* Simple & Clean Single-Line Header */}
        <div className="flex items-center justify-between gap-2 border-b border-[#F3E5AB]/70 pb-2.5">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <h2 className="font-serif text-sm sm:text-lg md:text-xl font-bold text-[#68081C] uppercase tracking-wider truncate">
              {selectedCategory.name ? selectedCategory.name.replace(' Sarees', '') : 'Saree Collection'}
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

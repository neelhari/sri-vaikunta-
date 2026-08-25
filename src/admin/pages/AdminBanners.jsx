import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, CheckCircle2, Upload, X, Flame, Megaphone, Sparkles, LayoutGrid, Layers, Edit2, ExternalLink } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { uploadToCloudinary } from '../../lib/cloudinary';

export default function AdminBanners() {
  const { banners = [], addBanner, updateBanner, deleteBanner, categories = [], promotions = {}, updatePromotions } = useStoreData();
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'marquee' | 'savings' | 'category'

  // Hero banner modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('Festive Heritage Sale');
  const [offer, setOffer] = useState('FLAT 25% OFF WEAVER PRICES');
  const [subtitle, setSubtitle] = useState('Pure Handwoven Silk & Zari Weaves');
  const [link, setLink] = useState('/categories?category=dharmavaram-pure-pattu');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  // Marquee announcement state & presets
  const [marqueeText, setMarqueeText] = useState(promotions.marqueeText || '✨ FESTIVE WEAVER PRICES: Flat 20% - 30% Off on Pure Dharmavaram & Pochampally Pattu | Use Code: SV10 | Free Shipping Across India');
  const [marqueeActive, setMarqueeActive] = useState(promotions.marqueeActive !== false);
  const [marqueeSaved, setMarqueeSaved] = useState(false);

  const MARQUEE_PRESETS = [
    { label: '✨ Festive Weaver Prices', text: '✨ FESTIVE WEAVER PRICES: Flat 20% - 30% Off on Pure Dharmavaram & Pochampally Pattu | Use Code: SV10 | Free Shipping Across India' },
    { label: '🚚 Free All-India Shipping', text: '🚚 FREE ALL-INDIA EXPRESS DELIVERY on All Handloom Sarees Above ₹1,999 • 100% Weaver Guarantee' },
    { label: '👑 Bridal Heritage Collection', text: '👑 NEW BRIDAL ARRIVALS: Pure Kanchi & Dharmavaram Heavy Gold Zari Silk Sarees | Direct from Master Weavers' },
    { label: '⚡ Flash Sale 10% Off', text: '⚡ LIMITED TIME: Extra 10% Instant Off on Pochampally Ikkat & Kalamkari Cottons | Use Code: SPECIAL10' },
  ];

  // Savings cards state
  const [savingsCards, setSavingsCards] = useState(promotions.savingsCards || []);
  const [savingsSaved, setSavingsSaved] = useState(false);

  // Category hero state
  const [catHero, setCatHero] = useState(promotions.categoryHero || {
    image: '/slider/hero_saree_model.png',
    badge: 'THE HERITAGE EDIT',
    title: 'Royal Saree Collections',
    subtitle: '14 Handcrafted Master-Weaver Traditions • Pure Silk & Pattu',
  });
  const [catHeroSaved, setCatHeroSaved] = useState(false);

  const safeBanners = Array.isArray(banners) ? banners : [];

  const readImageAsDataUrl = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const processBannerFile = async (file, setter) => {
    if (!file) return;
    setUploading(true);
    let url = null;
    try {
      const res = await uploadToCloudinary(file);
      if (res.success && res.url) url = res.url;
    } catch (err) {}
    if (!url) url = await readImageAsDataUrl(file);
    if (url) setter(url);
    setUploading(false);
  };

  const handleOpenAddHero = () => {
    setEditingBanner(null);
    setTitle('');
    setBadge('Festive Heritage Sale');
    setOffer('FLAT 25% OFF WEAVER PRICES');
    setSubtitle('Pure Handwoven Silk & Zari Weaves');
    setImage('/slider/hero_slide_1.png');
    setLink('/categories?category=dharmavaram-pure-pattu');
    setIsModalOpen(true);
  };

  const handleOpenEditHero = (b) => {
    setEditingBanner(b);
    setTitle(b.title || '');
    setBadge(b.badge || '');
    setOffer(b.offer || '');
    setSubtitle(b.subtitle || '');
    setImage(b.image || '');
    setLink(b.link || '/categories');
    setIsModalOpen(true);
  };

  const handleSaveHero = async (e) => {
    e.preventDefault();
    if (!title || !image || saving) return;

    setSaving(true);
    const result = editingBanner
      ? await updateBanner(editingBanner.id, {
          title,
          badge,
          offer,
          subtitle,
          link: link || '/categories',
          image,
        })
      : await addBanner({
          id: `sv-ban-${Date.now()}`,
          title,
          badge,
          offer,
          subtitle,
          link: link || '/categories',
          image,
          active: true,
        });
    setSaving(false);

    if (!result.success) {
      window.alert(`Could not save banner: ${result.message || 'Unknown error'}`);
      return;
    }
    setIsModalOpen(false);
  };

  const handleDeleteHero = async (id) => {
    if (!window.confirm('Delete this banner from the hero slider?')) return;
    const result = await deleteBanner(id);
    if (!result.success) {
      window.alert(`Could not delete banner: ${result.message || 'Unknown error'}`);
    }
  };

  const handleSaveMarquee = (e) => {
    e.preventDefault();
    updatePromotions({ marqueeText });
    setMarqueeSaved(true);
    setTimeout(() => setMarqueeSaved(false), 3000);
  };

  const handleUpdateSavingsCard = (idx, field, value) => {
    setSavingsCards((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSaveSavingsCards = (e) => {
    e.preventDefault();
    updatePromotions({ savingsCards });
    setSavingsSaved(true);
    setTimeout(() => setSavingsSaved(false), 3000);
  };

  const handleSaveCatHero = (e) => {
    e.preventDefault();
    updatePromotions({ categoryHero: catHero });
    setCatHeroSaved(true);
    setTimeout(() => setCatHeroSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
            Storefront Banners & Announcements CMS
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage live homepage hero slides, scrolling announcement tickers, offer tiles, and category banners
          </p>
        </div>

        {activeTab === 'hero' && (
          <button
            onClick={handleOpenAddHero}
            className="bg-[#68081C] hover:bg-[#4A0513] text-white text-xs font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Hero Slide</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs for All 4 Banner Locations */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'hero'
              ? 'bg-[#68081C] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Hero Slider ({safeBanners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('marquee')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'marquee'
              ? 'bg-[#68081C] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>2. Peach Announcement Ticker</span>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'savings'
              ? 'bg-[#68081C] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>3. "The Savings Edit" (4 Promo Tiles)</span>
        </button>

        <button
          onClick={() => setActiveTab('category')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'category'
              ? 'bg-[#68081C] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>4. Categories Page Bridal Banner</span>
        </button>
      </div>

      {/* TAB 1: HERO SLIDER (PROMINENT LARGE PREVIEW IMAGE + COMPACT METADATA) */}
      {activeTab === 'hero' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
                <tr>
                  <th className="p-4 sm:p-5 w-36 sm:w-44">Hero Photo Preview</th>
                  <th className="p-4 sm:p-5">Headline & Subtitle</th>
                  <th className="p-4 sm:p-5">Offer & Badge</th>
                  <th className="p-4 sm:p-5">Target Destination</th>
                  <th className="p-4 sm:p-5">Storefront Status</th>
                  <th className="p-4 sm:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {safeBanners.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      No hero banner slides found. Click "+ Add New Hero Slide" to create one.
                    </td>
                  </tr>
                ) : (
                  safeBanners.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FFFDF9] transition-colors">
                      {/* Prominent Large Photo Preview (Clearly visible silk & drape texture) */}
                      <td className="p-4 sm:p-5">
                        <div className="w-28 sm:w-36 h-36 sm:h-44 rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 shrink-0 shadow-md relative group">
                          <img
                            src={b.image}
                            alt={b.title}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                          <span className="absolute bottom-2 left-2 right-2 text-[9px] text-[#F3E5AB] font-serif font-bold text-center truncate drop-shadow">
                            {b.badge || 'Hero Slide'}
                          </span>
                        </div>
                      </td>

                      {/* Main Title & Subtitle */}
                      <td className="p-4 sm:p-5 max-w-xs">
                        <span className="font-serif font-bold text-gray-900 block text-sm sm:text-base whitespace-pre-line leading-snug">
                          {b.title}
                        </span>
                        {b.subtitle && (
                          <span className="text-xs text-gray-500 block mt-1.5 leading-relaxed">
                            {b.subtitle}
                          </span>
                        )}
                      </td>

                      {/* Badge & Offer Pill */}
                      <td className="p-4 sm:p-5 space-y-2">
                        {b.badge && (
                          <span className="text-[10px] font-serif italic text-amber-800 font-bold block uppercase tracking-wider">
                            {b.badge}
                          </span>
                        )}
                        {b.offer && (
                          <span className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-[#4A0513] text-[10.5px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            <span>{b.offer}</span>
                          </span>
                        )}
                      </td>

                      {/* Target Link */}
                      <td className="p-4 sm:p-5">
                        <a
                          href={b.link || '/categories'}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-[#68081C] hover:underline flex items-center gap-1 truncate max-w-[200px]"
                        >
                          <span className="truncate">{b.link || '/categories'}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        </a>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4 sm:p-5">
                        <button
                          onClick={async () => {
                            const result = await updateBanner(b.id, { active: !b.active });
                            if (!result.success) window.alert(`Could not update banner: ${result.message || 'Unknown error'}`);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                            b.active
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                              : 'text-gray-600 bg-gray-100 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${b.active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                          <span>{b.active ? 'Live on Storefront' : 'Hidden Draft'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 sm:p-5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditHero(b)}
                          className="p-2.5 rounded-xl text-gray-600 hover:text-[#68081C] hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                          title="Edit Slide Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHero(b.id)}
                          className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 border border-red-100 transition-colors cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PEACH ANNOUNCEMENT TICKER (SUPER USER-FRIENDLY WITH PRESETS & ANIMATED PREVIEW) */}
      {activeTab === 'marquee' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-7 max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#FFE4DF] text-[#68081C] rounded-lg">
                  <Megaphone className="w-4 h-4" />
                </span>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  Homepage Announcement Ticker (Marquee)
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                The continuous ribbon that runs across the homepage below the hero slider.
              </p>
            </div>

            {/* Enable / Disable Storefront Toggle */}
            <button
              type="button"
              onClick={() => {
                const newActive = !marqueeActive;
                setMarqueeActive(newActive);
                updatePromotions({ marqueeActive: newActive });
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                marqueeActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${marqueeActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              <span>{marqueeActive ? '● Active on Homepage' : '○ Ticker Hidden'}</span>
            </button>
          </div>

          {/* Quick 1-Click Preset Templates */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-700 text-xs">
              ⚡ 1-Click Ready Templates (Click to fill instantly):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MARQUEE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMarqueeText(preset.text)}
                  className={`text-left p-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                    marqueeText === preset.text
                      ? 'bg-[#FAF5EE] border-[#D4AF37] text-[#68081C] font-bold shadow-2xs'
                      : 'bg-gray-50/70 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-bold block text-[#68081C] text-[11.5px]">{preset.label}</span>
                  <span className="text-[10.5px] text-gray-500 line-clamp-1 mt-0.5">{preset.text}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveMarquee} className="space-y-5 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-gray-800">
                  Custom Announcement Text *
                </label>
                <span className="text-[11px] text-gray-400 font-mono">
                  {marqueeText.length} characters
                </span>
              </div>
              <textarea
                rows={3}
                required
                value={marqueeText}
                onChange={(e) => setMarqueeText(e.target.value)}
                placeholder="Type announcements, coupon codes (e.g. SV10), or festive shipping notices..."
                className="w-full p-3.5 rounded-2xl border border-gray-200 focus:border-[#68081C] text-xs font-semibold leading-relaxed shadow-2xs"
              />
            </div>

            {/* Real Smooth Animated Infinite Scrolling Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-gray-800 flex items-center gap-1.5">
                  <span>Live Storefront Animated Preview:</span>
                  <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Animation
                  </span>
                </label>
                <span className="text-[10px] text-gray-400">Hover to pause</span>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-[#FFE4DF] text-[#68081C] border border-[#F5C7C0] py-3 shadow-xs group">
                <div className="flex w-max animate-[marquee_18s_linear_infinite] group-hover:[animation-play-state:paused] whitespace-nowrap text-xs font-extrabold uppercase tracking-wider">
                  <span className="mx-6">{marqueeText}</span>
                  <span className="mx-6 text-rose-400">✦</span>
                  <span className="mx-6">{marqueeText}</span>
                  <span className="mx-6 text-rose-400">✦</span>
                  <span className="mx-6">{marqueeText}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="bg-[#68081C] hover:bg-[#4A0513] text-white font-bold px-7 py-3 rounded-2xl shadow-md transition-all cursor-pointer text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Publish Ticker</span>
              </button>
              {marqueeSaved && (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" /> Published Live to Homepage!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: THE SAVINGS EDIT (4 PROMO TILES) */}
      {activeTab === 'savings' && (
        <form onSubmit={handleSaveSavingsCards} className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900">"The Savings Edit" 4-Card Promo Grid</h3>
              <p className="text-xs text-gray-500 mt-0.5">Edit the 4 featured curated offer cards on the homepage</p>
            </div>
            <button
              type="submit"
              className="bg-[#68081C] hover:bg-[#4A0513] text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer text-xs shrink-0 self-start sm:self-auto"
            >
              Save All 4 Promo Cards
            </button>
          </div>

          {savingsSaved && (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> All 4 Promo Tiles updated live on Homepage!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs">
            {savingsCards.map((card, idx) => (
              <div key={card.id || idx} className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-bold text-[#68081C] uppercase text-xs">Promo Tile #{idx + 1}</span>
                  <span className="text-[10px] font-mono text-gray-400">ID: {card.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Title</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => handleUpdateSavingsCard(idx, 'title', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Discount Text</label>
                    <input
                      type="text"
                      value={card.discount}
                      onChange={(e) => handleUpdateSavingsCard(idx, 'discount', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C] font-bold text-[#68081C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={card.subtitle}
                      onChange={(e) => handleUpdateSavingsCard(idx, 'subtitle', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Target Link</label>
                    <input
                      type="text"
                      value={card.link}
                      onChange={(e) => handleUpdateSavingsCard(idx, 'link', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C] font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Promo Photo (Drag/Select or URL)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-20 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shrink-0 shadow-xs relative group">
                      <img
                        src={card.image || '/products/cat_pure_pattu.jpg'}
                        alt=""
                        onError={(e) => { e.target.src = '/products/cat_pure_pattu.jpg'; }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={card.image}
                        onChange={(e) => handleUpdateSavingsCard(idx, 'image', e.target.value)}
                        placeholder="/products/cat_pure_pattu.jpg"
                        className="w-full p-2 rounded-xl border border-gray-200 focus:border-[#68081C] font-mono text-[11px]"
                      />
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          id={`savings-file-${idx}`}
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const url = await readImageAsDataUrl(file);
                              if (url) handleUpdateSavingsCard(idx, 'image', url);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor={`savings-file-${idx}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#68081C] bg-[#FAF5EE] hover:bg-[#F3EAE0] px-3 py-1 rounded-lg border border-[#D4AF37]/50 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Choose Photo from Device</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </form>
      )}

      {/* TAB 4: CATEGORIES HERO BANNER */}
      {activeTab === 'category' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-6 max-w-2xl text-xs">
          <div>
            <h3 className="font-serif text-lg font-bold text-gray-900">Categories Page Bridal Hero Banner</h3>
            <p className="text-xs text-gray-500 mt-1">
              Controls the top wide banner image and gold typography on the Categories Hub (`/categories`).
            </p>
          </div>

          <form onSubmit={handleSaveCatHero} className="space-y-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Badge Text</label>
              <input
                type="text"
                value={catHero.badge}
                onChange={(e) => setCatHero({ ...catHero, badge: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Main Headline</label>
              <input
                type="text"
                value={catHero.title}
                onChange={(e) => setCatHero({ ...catHero, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C] font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Subtitle</label>
              <input
                type="text"
                value={catHero.subtitle}
                onChange={(e) => setCatHero({ ...catHero, subtitle: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Banner Photo (Bridal / Saree Model Photo) *
              </label>
              <div className="border-2 border-dashed border-gray-300 hover:border-[#68081C] rounded-2xl p-4 bg-gray-50 text-center transition-all">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="w-24 h-28 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shrink-0 shadow-sm relative">
                    <img src={catHero.image || '/slider/hero_saree_model.png'} alt="Bridal Banner" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center sm:text-left space-y-1.5">
                    <p className="font-bold text-gray-800 text-xs">
                      {uploading ? '⏳ Uploading to Cloudinary...' : 'Upload Saree Photo from Device'}
                    </p>
                    <p className="text-gray-400 text-[10.5px]">JPG, PNG or WEBP (Cloudinary Cloud Storage Active)</p>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            processBannerFile(e.target.files[0], (newUrl) => setCatHero((prev) => ({ ...prev, image: newUrl })));
                          }
                        }}
                        className="hidden"
                        id="cat-hero-file-input"
                      />
                      <label
                        htmlFor="cat-hero-file-input"
                        className="inline-flex items-center gap-1.5 bg-[#68081C] hover:bg-[#4A0513] text-white font-bold text-[11px] px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploading ? 'Uploading...' : 'Choose Photo from Device'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Manual URL */}
              <div className="mt-2">
                <input
                  type="text"
                  value={catHero.image}
                  onChange={(e) => setCatHero({ ...catHero, image: e.target.value })}
                  placeholder="Or paste image URL (e.g. /slider/hero_saree_model.png)..."
                  className="w-full p-2 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="bg-[#68081C] hover:bg-[#4A0513] text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save Category Hero Banner
              </button>
              {catHeroSaved && (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Updated Live on Categories Page!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Hero Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-7 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#68081C]">
                  {editingBanner ? 'Edit Hero Banner Slide' : 'Add Hero Banner Slide'}
                </h3>
                <p className="text-[10.5px] text-gray-400">
                  {editingBanner ? 'Update slide photography, offers, and linked category' : 'Create a vertical mobile hero slide for the homepage'}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHero} className="space-y-3.5">
              {/* Photo Upload Zone */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Banner Photo (Vertical 9:16 or Saree Drape Photo) *
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f) processBannerFile(f, setImage);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                    isDragging ? 'border-[#68081C] bg-[#FDF5F6]' : 'border-gray-300 hover:border-[#68081C] bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="w-20 h-28 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shrink-0 shadow-sm relative group">
                      <img src={image || '/slider/hero_slide_1.png'} alt="Hero Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center sm:text-left space-y-1.5">
                      <p className="font-bold text-gray-800 text-xs">
                        {uploading ? '⏳ Compressing & Uploading to Cloudinary...' : 'Upload Saree Photo from Device'}
                      </p>
                      <p className="text-gray-400 text-[10.5px]">JPG, PNG or WEBP (Cloudinary Cloud Storage Active)</p>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) processBannerFile(e.target.files[0], setImage);
                          }}
                          className="hidden"
                          id="hero-banner-file-input"
                        />
                        <label
                          htmlFor="hero-banner-file-input"
                          className="inline-flex items-center gap-1.5 bg-[#68081C] hover:bg-[#4A0513] text-white font-bold text-[11px] px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploading ? 'Uploading...' : 'Choose Photo from Device'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Manual URL */}
                <div className="mt-2">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Or paste image URL (e.g. /slider/hero_slide_1.png)..."
                    className="w-full p-2 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Main Heading (Uppercase) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. ROYAL DHARMAVARAM&#10;PURE PATTU SAREES"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C] font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Top Badge Text</label>
                  <input
                    type="text"
                    placeholder="The Grand Festive Sale"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Offer Pill Text</label>
                  <input
                    type="text"
                    placeholder="FLAT 25% OFF WEAVER PRICES"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="Heavy Gold Zari Bridal & Festive Heritage Weaves."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Target Category / Link</label>
                <select
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C] bg-white font-semibold"
                >
                  <option value="/categories">All Categories Hub (/categories)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={`/categories?category=${cat.id}`}>
                      {cat.name} (/categories?category={cat.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !image || !title}
                  className="px-6 py-2 text-xs font-bold text-white bg-[#68081C] hover:bg-[#4A0513] rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingBanner ? 'Update Slide' : 'Publish to Homepage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

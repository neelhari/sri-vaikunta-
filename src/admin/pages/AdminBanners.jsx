import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Image as ImageIcon, Plus, Trash2, CheckCircle2, Upload, X, Flame, Megaphone, Sparkles, LayoutGrid, Layers, Edit2, ExternalLink } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { uploadToCloudinary } from '../../lib/cloudinary';

export default function AdminBanners() {
  const { banners = [], addBanner, updateBanner, deleteBanner, categories = [], promotions = {}, updatePromotions } = useStoreData();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'hero'; // 'hero' | 'marquee' | 'savings' | 'category'

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

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

  // Category Banners Array state
  const initialCatBanners = Array.isArray(promotions.categoryBanners) && promotions.categoryBanners.length > 0
    ? promotions.categoryBanners
    : [
        {
          id: 'cat-ban-1',
          badge: promotions.categoryHero?.badge || 'THE HERITAGE EDIT',
          title: promotions.categoryHero?.title || 'Royal Saree Collections',
          subtitle: promotions.categoryHero?.subtitle || '14 Handcrafted Master-Weaver Traditions • Pure Silk & Pattu',
          image: promotions.categoryHero?.image || '/slider/hero_saree_model.png',
          category: 'all',
          active: true,
        },
      ];

  const [categoryBanners, setCategoryBanners] = useState(initialCatBanners);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatBanner, setEditingCatBanner] = useState(null);
  const [catBannerForm, setCatBannerForm] = useState({
    badge: 'THE HERITAGE EDIT',
    title: '',
    subtitle: '',
    image: '/slider/hero_saree_model.png',
    category: 'all',
    active: true,
  });

  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

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
      if (res.success && res.url) {
        url = res.url;
        showToast('✓ Photo uploaded to Cloudinary successfully!');
      }
    } catch (err) {}
    if (!url) {
      url = await readImageAsDataUrl(file);
      if (url) showToast('✓ Photo attached from device!');
    }
    if (url) setter(url);
    setUploading(false);
  };

  // --- Hero Slider Handlers ---
  const handleOpenAddHero = () => {
    setEditingBanner(null);
    setTitle('');
    setBadge('Festive Heritage Sale');
    setOffer('FLAT 25% OFF WEAVER PRICES');
    setSubtitle('Pure Handwoven Silk & Zari Weaves');
    setImage('');
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
    showToast('✓ Hero slide saved & synced to live homepage!');
    setIsModalOpen(false);
  };

  const handleDeleteHero = async (id) => {
    if (!window.confirm('Delete this banner from the hero slider?')) return;
    const result = await deleteBanner(id);
    if (!result.success) {
      window.alert(`Could not delete banner: ${result.message || 'Unknown error'}`);
    } else {
      showToast('✓ Hero slide removed from homepage!');
    }
  };

  // --- Marquee Handlers ---
  const handleSaveMarquee = (e) => {
    e.preventDefault();
    updatePromotions({ marqueeText, marqueeActive });
    showToast('✓ Announcement ticker saved & synced!');
    setMarqueeSaved(true);
    setTimeout(() => setMarqueeSaved(false), 3000);
  };

  // --- Savings Cards Handlers ---
  const handleSaveSavingsCards = (e) => {
    e.preventDefault();
    updatePromotions({ savingsCards });
    showToast('✓ All 4 Promo Tiles saved & synced to cloud!');
    setSavingsSaved(true);
    setTimeout(() => setSavingsSaved(false), 3000);
  };

  // --- Category Banners Handlers ---
  const handleOpenAddCatBanner = () => {
    setEditingCatBanner(null);
    setCatBannerForm({
      badge: 'THE HERITAGE EDIT',
      title: '',
      subtitle: 'Pure Handwoven Silk & Zari Weaves direct from Master Weavers.',
      image: '/slider/hero_saree_model.png',
      category: 'all',
      active: true,
    });
    setIsCatModalOpen(true);
  };

  const handleOpenEditCatBanner = (ban) => {
    setEditingCatBanner(ban);
    setCatBannerForm({ ...ban });
    setIsCatModalOpen(true);
  };

  const handleSaveCatBanner = async (e) => {
    e.preventDefault();
    if (!catBannerForm.title || !catBannerForm.image) return;

    let updatedList;
    if (editingCatBanner) {
      updatedList = categoryBanners.map((b) => (b.id === editingCatBanner.id ? { ...catBannerForm, id: editingCatBanner.id } : b));
    } else {
      const newBanner = { ...catBannerForm, id: `cat-ban-${Date.now()}` };
      updatedList = [...categoryBanners, newBanner];
    }

    setCategoryBanners(updatedList);
    await updatePromotions({
      categoryBanners: updatedList,
      categoryHero: updatedList[0] || null,
    });
    showToast('✓ Category banner saved & synced to live storefront!');
    setIsCatModalOpen(false);
  };

  const handleToggleCatBannerActive = async (ban) => {
    const updatedList = categoryBanners.map((b) => (b.id === ban.id ? { ...b, active: !b.active } : b));
    setCategoryBanners(updatedList);
    await updatePromotions({
      categoryBanners: updatedList,
      categoryHero: updatedList[0] || null,
    });
    showToast(`✓ Banner ${!ban.active ? 'Activated' : 'Disabled'}!`);
  };

  const handleDeleteCatBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Category Banner?')) return;
    const updatedList = categoryBanners.filter((b) => b.id !== id);
    setCategoryBanners(updatedList);
    await updatePromotions({
      categoryBanners: updatedList,
      categoryHero: updatedList[0] || null,
    });
    showToast('✓ Category banner deleted!');
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Success Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/40 text-xs font-bold transition-all">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

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

        {activeTab === 'category' && (
          <button
            onClick={handleOpenAddCatBanner}
            className="bg-[#68081C] hover:bg-[#4A0513] text-white text-xs font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Category Banner</span>
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
          <span>4. Category Banners ({categoryBanners.length})</span>
        </button>
      </div>

      {/* TAB 1: HERO SLIDER */}
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
              <tbody className="divide-y divide-gray-100">
                {safeBanners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-3 border-[#68081C] border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold text-gray-500">Syncing hero slides with cloud database...</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  safeBanners.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 sm:p-5">
                        <div className="relative w-32 sm:w-36 h-40 sm:h-44 rounded-2xl overflow-hidden bg-gray-900 border-2 border-[#D4AF37]/30 shadow-md group">
                          <img
                            src={b.image}
                            alt={b.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <span className="absolute bottom-2 left-2 bg-[#D4AF37] text-[#4A0513] text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                          ★ Live Hero Slide
                        </span>
                      </div>
                    </td>

                    <td className="p-4 sm:p-5 align-top">
                      <div className="font-serif font-bold text-gray-900 text-sm sm:text-base leading-snug whitespace-pre-line">
                        {b.title}
                      </div>
                      <div className="text-gray-500 text-xs mt-1.5 font-medium line-clamp-2">
                        {b.subtitle}
                      </div>
                    </td>

                    <td className="p-4 sm:p-5 align-top">
                      <div className="space-y-1.5">
                        <span className="inline-block bg-[#FAF5EE] text-[#68081C] border border-[#D4AF37]/40 text-[10.5px] font-extrabold px-2.5 py-1 rounded-lg">
                          {b.badge || 'Featured Offer'}
                        </span>
                        <div className="text-xs font-black text-emerald-800">
                          {b.offer}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 sm:p-5 align-top font-mono text-[11px] text-gray-500">
                      <span className="bg-gray-100 px-2.5 py-1 rounded-lg block max-w-xs truncate">
                        {b.link}
                      </span>
                    </td>

                    <td className="p-4 sm:p-5 align-top">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await updateBanner(b.id, { active: !b.active });
                            if (!res.success) window.alert(res.message);
                          }}
                          className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer p-0.5 shadow-2xs ${
                            b.active ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                          title={b.active ? 'Click to Hide Slide' : 'Click to Show Slide'}
                        >
                          <span
                            className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 shadow-sm flex items-center justify-center text-[9px] font-black ${
                              b.active ? 'translate-x-6 text-emerald-600' : 'translate-x-0 text-gray-400'
                            }`}
                          >
                            {b.active ? '✓' : ''}
                          </span>
                        </button>
                        <span className={`text-xs font-bold ${b.active ? 'text-emerald-700 font-extrabold' : 'text-gray-400'}`}>
                          {b.active ? 'Active' : 'Off'}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 sm:p-5 align-top text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEditHero(b)}
                        className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteHero(b.id)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PEACH ANNOUNCEMENT TICKER */}
      {activeTab === 'marquee' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-6 max-w-3xl text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900">Announcement Marquee Ticker</h3>
              <p className="text-xs text-gray-500 mt-1">
                Top horizontal peach scrolling ribbon on the storefront.
              </p>
            </div>

            {/* Dynamic iOS Toggle Switch */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  const nextActive = !marqueeActive;
                  setMarqueeActive(nextActive);
                  await updatePromotions({ marqueeText, marqueeActive: nextActive });
                  showToast(nextActive ? '✓ Announcement Ticker Activated on Storefront!' : '✓ Announcement Ticker Hidden from Storefront!');
                }}
                className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer p-0.5 shadow-2xs ${
                  marqueeActive ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
                title="Click to toggle Marquee on/off"
              >
                <span
                  className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 shadow-sm flex items-center justify-center text-[9px] font-black ${
                    marqueeActive ? 'translate-x-6 text-emerald-600' : 'translate-x-0 text-gray-400'
                  }`}
                >
                  {marqueeActive ? '✓' : ''}
                </span>
              </button>
              <span className={`text-xs font-bold ${marqueeActive ? 'text-emerald-700 font-extrabold' : 'text-gray-400'}`}>
                {marqueeActive ? 'Active on Storefront' : 'Ribbon Hidden'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveMarquee} className="space-y-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Scrolling Announcement Text</label>
              <textarea
                rows={3}
                required
                value={marqueeText}
                onChange={(e) => setMarqueeText(e.target.value)}
                placeholder="Type your announcement (e.g. 299, 399 festive discounts)..."
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] text-xs leading-relaxed font-semibold"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="bg-[#68081C] hover:bg-[#4A0513] text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Announcement</span>
              </button>
              {marqueeSaved && (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Saved & Synced to Cloud!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: THE SAVINGS EDIT (4 PROMO TILES WITH INDIVIDUAL SAVE BUTTONS) */}
      {activeTab === 'savings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-6 text-xs">
          <div>
            <h3 className="font-serif text-lg font-bold text-gray-900">"The Savings Edit" (4 Featured Promo Tiles)</h3>
            <p className="text-xs text-gray-500 mt-1">
              Controls the 4 featured deal cards below the category carousel on the homepage. Save any card individually.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savingsCards.map((card, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/80 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-gray-800">
                  <span className="text-sm font-bold text-gray-900">Promo Tile #{idx + 1}</span>
                  <span className="text-[10px] text-[#68081C] bg-[#FAF5EE] font-extrabold px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                    Card #{idx + 1}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Discount Tag (e.g. UP TO 25% OFF) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UP TO 25% OFF or FLAT 30% OFF"
                    value={card.discount || ''}
                    onChange={(e) => {
                      const next = [...savingsCards];
                      next[idx] = { ...next[idx], discount: e.target.value };
                      setSavingsCards(next);
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-extrabold text-emerald-800 text-xs focus:border-[#68081C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Collection Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dharmavaram Pure Pattu"
                    value={card.title || ''}
                    onChange={(e) => {
                      const next = [...savingsCards];
                      next[idx] = { ...next[idx], title: e.target.value };
                      setSavingsCards(next);
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-xs focus:border-[#68081C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Redirects When Clicked *</label>
                  <select
                    value={card.category || (card.link?.includes('category=') ? card.link.split('category=')[1] : card.link) || 'dharmavaram-pure-pattu'}
                    onChange={(e) => {
                      const val = e.target.value;
                      const next = [...savingsCards];
                      next[idx] = {
                        ...next[idx],
                        category: val,
                        link: val.startsWith('/') ? val : `/categories?category=${val}`,
                      };
                      setSavingsCards(next);
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-semibold text-xs focus:border-[#68081C]"
                  >
                    <option value="/shop">🌟 All Sarees Catalog (/shop)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Photo Upload</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shrink-0 shadow-2xs">
                      <img src={card.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            processBannerFile(e.target.files[0], (newUrl) => {
                              const next = [...savingsCards];
                              next[idx] = { ...next[idx], image: newUrl };
                              setSavingsCards(next);
                            });
                          }
                        }}
                        className="hidden"
                        id={`savings-file-${idx}`}
                      />
                      <label
                        htmlFor={`savings-file-${idx}`}
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-gray-800 font-bold text-[11px] px-3.5 py-2 rounded-xl border border-gray-300 cursor-pointer shadow-2xs transition-all"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#68081C]" />
                        <span>Choose Photo from Device</span>
                      </label>
                      <p className="text-[10px] text-gray-400">Cloudinary direct compression</p>
                    </div>
                  </div>
                </div>

                {/* Individual Save Button for each card */}
                <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between">
                  <span className="text-[10.5px] text-gray-400 font-medium">Live on Homepage Carousel</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await updatePromotions({ savingsCards });
                      showToast(`✓ Card #${idx + 1} (${card.title || 'Promo Tile'}) saved & synced!`);
                    }}
                    className="bg-[#68081C] hover:bg-[#4A0513] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Card #{idx + 1}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORY BANNERS MANAGER (FULL TABLE + ADD/EDIT/DELETE) */}
      {activeTab === 'category' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
                <tr>
                  <th className="p-4 sm:p-5 w-36 sm:w-44">Banner Photo</th>
                  <th className="p-4 sm:p-5">Headline & Subtitle</th>
                  <th className="p-4 sm:p-5">Badge</th>
                  <th className="p-4 sm:p-5">Assigned Category</th>
                  <th className="p-4 sm:p-5 text-center">Status</th>
                  <th className="p-4 sm:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categoryBanners.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Photo */}
                    <td className="p-4 sm:p-5">
                      <div className="relative w-32 sm:w-36 h-24 sm:h-28 rounded-2xl overflow-hidden bg-gray-900 border-2 border-[#D4AF37]/30 shadow-md group">
                        <img
                          src={b.image}
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      </div>
                    </td>

                    {/* Headline */}
                    <td className="p-4 sm:p-5 align-top">
                      <div className="font-serif font-bold text-gray-900 text-sm sm:text-base leading-snug">
                        {b.title}
                      </div>
                      <div className="text-gray-500 text-xs mt-1 font-medium line-clamp-2">
                        {b.subtitle}
                      </div>
                    </td>

                    {/* Badge */}
                    <td className="p-4 sm:p-5 align-top">
                      <span className="inline-block bg-[#FAF5EE] text-[#68081C] border border-[#D4AF37]/40 text-[10.5px] font-extrabold px-2.5 py-1 rounded-lg">
                        {b.badge || 'THE HERITAGE EDIT'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="p-4 sm:p-5 align-top">
                      <span className="bg-gray-100 text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                        {b.category === 'all'
                          ? '🌟 All Collections (Global)'
                          : categories.find((c) => c.id === b.category)?.name || b.category}
                      </span>
                    </td>

                    {/* Dynamic iOS Toggle */}
                    <td className="p-4 sm:p-5 align-top text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleCatBannerActive(b)}
                          className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer p-0.5 shadow-2xs ${
                            b.active !== false ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 shadow-sm flex items-center justify-center text-[9px] font-black ${
                              b.active !== false ? 'translate-x-6 text-emerald-600' : 'translate-x-0 text-gray-400'
                            }`}
                          >
                            {b.active !== false ? '✓' : ''}
                          </span>
                        </button>
                        <span className={`text-xs font-bold ${b.active !== false ? 'text-emerald-700' : 'text-gray-400'}`}>
                          {b.active !== false ? 'Active' : 'Off'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 sm:p-5 align-top text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEditCatBanner(b)}
                        className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCatBanner(b.id)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hero Banner Add/Edit Modal */}
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
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
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
                    <div className="w-20 h-28 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shrink-0 shadow-sm relative group flex items-center justify-center">
                      {image ? (
                        <img src={image} alt="Hero Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                    <div className="text-center sm:text-left space-y-1.5">
                      <p className="font-bold text-gray-800 text-xs">
                        {uploading ? '⏳ Compressing & Uploading to Cloud Storage...' : 'Upload Saree Photo from Device'}
                      </p>
                      <p className="text-gray-400 text-[10.5px]">JPG, PNG or WEBP (Direct Cloud Storage Active)</p>
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

                <div className="mt-2">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Or paste image URL (https://...)..."
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
                  <label className="block font-bold text-gray-800 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Festive Heritage Sale"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Offer Tagline</label>
                  <input
                    type="text"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    placeholder="e.g. FLAT 25% OFF"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Subtitle / Weave Details</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Pure Handwoven Silk & Zari Weaves"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Linked Destination</label>
                <select
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-semibold"
                >
                  <option value="/shop">🌟 All Sarees Catalog</option>
                  {categories.map((c) => (
                    <option key={c.id} value={`/categories?category=${c.id}`}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#68081C] hover:bg-[#4A0513] rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingBanner ? 'Update Slide' : 'Add Hero Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Banner Add/Edit Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-7 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#68081C]">
                  {editingCatBanner ? 'Edit Category Banner' : 'Add New Category Banner'}
                </h3>
                <p className="text-[10.5px] text-gray-400">
                  Controls the wide top header banner on `/categories`
                </p>
              </div>
              <button onClick={() => setIsCatModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCatBanner} className="space-y-3.5">
              {/* Photo Upload Zone */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Banner Photo (Bridal / Saree Model Landscape Photo) *
                </label>
                <div className="border-2 border-dashed border-gray-300 hover:border-[#68081C] rounded-2xl p-4 bg-gray-50 text-center transition-all">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="w-28 h-20 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shrink-0 shadow-sm relative group">
                      <img src={catBannerForm.image || '/slider/hero_saree_model.png'} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center sm:text-left space-y-1.5">
                      <p className="font-bold text-gray-800 text-xs">
                        {uploading ? '⏳ Compressing & Uploading...' : 'Upload Saree Photo from Device'}
                      </p>
                      <p className="text-gray-400 text-[10.5px]">JPG, PNG or WEBP (Cloudinary Cloud Storage Active)</p>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              processBannerFile(e.target.files[0], (newUrl) =>
                                setCatBannerForm((prev) => ({ ...prev, image: newUrl }))
                              );
                            }
                          }}
                          className="hidden"
                          id="cat-banner-modal-input"
                        />
                        <label
                          htmlFor="cat-banner-modal-input"
                          className="inline-flex items-center gap-1.5 bg-[#68081C] hover:bg-[#4A0513] text-white font-bold text-[11px] px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploading ? 'Uploading...' : 'Choose Photo from Device'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <input
                    type="text"
                    value={catBannerForm.image}
                    onChange={(e) => setCatBannerForm({ ...catBannerForm, image: e.target.value })}
                    placeholder="Or paste image URL (e.g. /slider/hero_saree_model.png)..."
                    className="w-full p-2 rounded-xl border border-gray-200 focus:border-[#68081C] font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Main Headline */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">Main Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Dharmavaram Pure Pattu"
                  value={catBannerForm.title}
                  onChange={(e) => setCatBannerForm({ ...catBannerForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C] font-bold text-sm"
                />
              </div>

              {/* Badge & Subtitle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Badge Text</label>
                  <input
                    type="text"
                    placeholder="e.g. THE HERITAGE EDIT"
                    value={catBannerForm.badge}
                    onChange={(e) => setCatBannerForm({ ...catBannerForm, badge: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Assign to Category</label>
                  <select
                    value={catBannerForm.category}
                    onChange={(e) => setCatBannerForm({ ...catBannerForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-semibold"
                  >
                    <option value="all">🌟 All Collections (Global)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Subtitle</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 14 Handcrafted Master-Weaver Traditions • Pure Silk & Pattu"
                  value={catBannerForm.subtitle}
                  onChange={(e) => setCatBannerForm({ ...catBannerForm, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#68081C] hover:bg-[#4A0513] rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {editingCatBanner ? 'Update Category Banner' : 'Add Category Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

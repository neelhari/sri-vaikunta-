import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Check, Video, AlertCircle, Film, Sparkles, ChevronDown, ChevronUp, Image as ImageIcon, Flame, Crown, Feather } from 'lucide-react';
import { uploadToCloudinary, compressImageToDataUrl, uploadDataUrlToStorage } from '../../lib/cloudinary';
import { BRAND } from '../../config/brand';

export default function ClothingProductModal({ isOpen, onClose, onSave, initialProduct, categories = [], saving = false }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'dharmavaram-pure-pattu',
    subcategory: '',
    price: '',
    oldPrice: '',
    stock: 1,
    fabric: 'Pure Handloom Silk & Pattu',
    material: 'Rich Gold / Antique Zari',
    blouse: 'Included (Unstitched 80cm Running Blouse)',
    length: 'Standard 6.3 Meters (with Blouse Piece)',
    occasion: 'Bridal, Wedding Guest, Festive Pooja',
    careInstructions: 'Dry Clean Only / Wrap in Muslin Cloth',
    description: '',
    video: '',
    videoUrl: '',
    images: [],
    isRoyalBridal: false,
    isCottonKalamkari: false,
    isTrending: false,
    isFeatured: true,
  });

  const [uploadError, setUploadError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [showAdvancedSpecs, setShowAdvancedSpecs] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        sku: initialProduct.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: initialProduct.category || categories[0]?.id || 'dharmavaram-pure-pattu',
        subcategory: initialProduct.subcategory || '',
        price: initialProduct.price || '',
        oldPrice: initialProduct.oldPrice || '',
        stock: initialProduct.stock !== undefined ? initialProduct.stock : 1,
        fabric: initialProduct.fabric || 'Pure Handloom Silk & Pattu',
        material: initialProduct.material || 'Rich Gold / Antique Zari',
        blouse: initialProduct.blouse || 'Included (Unstitched 80cm Running Blouse)',
        length: initialProduct.length || 'Standard 6.3 Meters (with Blouse Piece)',
        occasion: initialProduct.occasion || 'Bridal, Wedding Guest, Festive Pooja',
        careInstructions: initialProduct.careInstructions || 'Dry Clean Only / Wrap in Muslin Cloth',
        description: initialProduct.description || '',
        video: initialProduct.video || '',
        videoUrl: initialProduct.videoUrl || '',
        images: initialProduct.images || (initialProduct.image ? [initialProduct.image] : []),
        isRoyalBridal: initialProduct.isRoyalBridal ?? (initialProduct.category === 'dharmavaram-pure-pattu' || initialProduct.category === 'banarasi-sarees' || initialProduct.category === 'pochampally-pattu'),
        isCottonKalamkari: initialProduct.isCottonKalamkari ?? (initialProduct.category === 'kalamkari-cotton' || initialProduct.category === 'cotton-sarees' || initialProduct.category === 'mangalgiri-digital-print'),
        isTrending: initialProduct.isTrending ?? false,
        isFeatured: initialProduct.isFeatured ?? true,
      });
    } else {
      setFormData({
        name: '',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: categories[0]?.id || 'dharmavaram-pure-pattu',
        subcategory: '',
        price: '',
        oldPrice: '',
        stock: 1,
        fabric: 'Pure Handloom Silk & Pattu',
        material: 'Rich Gold / Antique Zari',
        blouse: 'Included (Unstitched 80cm Running Blouse)',
        length: 'Standard 6.3 Meters (with Blouse Piece)',
        occasion: 'Bridal, Wedding Guest, Festive Pooja',
        careInstructions: 'Dry Clean Only / Wrap in Muslin Cloth',
        description: '',
        video: '',
        videoUrl: '',
        images: [],
        isRoyalBridal: false,
        isCottonKalamkari: false,
        isTrending: false,
        isFeatured: true,
      });
    }
    setUploadError('');
    setShowAdvancedSpecs(false);
  }, [initialProduct, isOpen, categories]);

  if (!isOpen) return null;

  const readImageAsDataUrl = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    setUploadError('');

    const newImages = [];
    for (const file of files) {
      let url = null;
      try {
        const res = await uploadToCloudinary(file, 'products');
        if (res.success && res.url) {
          url = res.url;
        } else if (res.message) {
          console.warn('Cloud storage upload warning:', res.message);
        }
      } catch (err) {
        console.warn('Upload error:', err);
      }

      // Ultra-compact client-side compression fallback (< 70KB per photo)
      if (!url) {
        const compressedB64 = await compressImageToDataUrl(file, 1200, 0.75);
        if (compressedB64) {
          url = await uploadDataUrlToStorage(compressedB64, 'products');
        }
      }

      if (url) {
        newImages.push(url);
      }
    }

    if (newImages.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images.filter((img) => img !== '/products/saree-placeholder.png'), ...newImages],
      }));
    }
    setUploadingImage(false);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
    await processFiles(files);
  };

  const handleAddManualUrl = (e) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images.filter((img) => img !== '/products/saree-placeholder.png'), manualUrl.trim()],
    }));
    setManualUrl('');
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingVideo(true);
    setUploadError('');

    try {
      const res = await uploadToCloudinary(file, 'banners');
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, video: res.url, videoUrl: res.url }));
      } else {
        setUploadError(res.message || 'Could not upload video to cloud storage.');
      }
    } catch (err) {
      setUploadError('Video upload failed. Please ensure file is under 20MB.');
    }
    setUploadingVideo(false);
    e.target.value = '';
  };

  const handleRemoveImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleRemoveVideo = () => {
    setFormData((prev) => ({ ...prev, video: '' }));
  };

  const calculateDiscount = () => {
    if (formData.oldPrice && Number(formData.oldPrice) > Number(formData.price) && Number(formData.price) > 0) {
      const pct = Math.round(((Number(formData.oldPrice) - Number(formData.price)) / Number(formData.oldPrice)) * 100);
      return `${pct}% OFF`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setUploadError('Please provide a Saree Title');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setUploadError('Please provide a valid Selling Price');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
      discount: calculateDiscount(),
      stock: Number(formData.stock) || 0,
      image: formData.images[0] || '/products/cat_pure_pattu.jpg',
      images: formData.images.length > 0 ? formData.images : ['/products/cat_pure_pattu.jpg'],
      video: formData.video || null,
      videoUrl: formData.videoUrl || null,
    };

    const ok = await onSave(payload);
    if (ok !== false) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#68081C] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-serif text-lg font-bold">
              {initialProduct ? 'Edit Saree Product' : 'Add New Saree to Catalog'}
            </h3>
            <p className="text-[11px] text-gray-300">
              {BRAND.fullName} • Direct Cloudinary & Supabase Database Sync
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Single-Screen Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 text-xs">
          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-2xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* 1. MULTIPLE SAREE PHOTOS UPLOADER WITH AUTO-COMPRESSION */}
          <div className="space-y-3 bg-[#FFFDF9] p-4 sm:p-5 rounded-3xl border border-amber-900/10">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#68081C]" />
                <span>Saree Photos (Upload Single or Multiple Photos) *</span>
              </label>
              <span className="text-[11px] text-gray-500 font-medium">
                {formData.images.length} photo(s) selected
              </span>
            </div>

            {/* Drag & Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                isDragging ? 'border-[#68081C] bg-[#FDF5F6] scale-[1.01]' : 'border-gray-300 hover:border-[#68081C] bg-white'
              }`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${isDragging ? 'text-[#68081C]' : 'text-gray-400'}`} />
              <p className="font-bold text-gray-800 text-xs sm:text-sm">
                {isDragging ? 'Drop Photos to Upload' : 'Drag & Drop Saree Photos Here (Auto-Compressed)'}
              </p>
              <p className="text-gray-400 text-[10.5px] mt-0.5">
                Select 1 to 10+ high-res photos. Automatic client-side compression enables instant high-speed uploads.
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="saree-multi-photo-upload"
              />
              <div className="mt-3">
                <label
                  htmlFor="saree-multi-photo-upload"
                  className="inline-flex items-center gap-1.5 bg-[#68081C] hover:bg-[#4A0513] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? '⏳ Compressing & Uploading to Cloudinary...' : 'Choose Photos from Device'}</span>
                </label>
              </div>
            </div>

            {/* Uploaded Photos Grid */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden aspect-[3/4] border border-gray-200 bg-gray-900 shadow-xs">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <span className={`absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded shadow ${
                      idx === 0 ? 'bg-[#D4AF37] text-[#4A0513] font-black' : 'bg-black/70 text-white'
                    }`}>
                      {idx === 0 ? '★ Main' : `Photo ${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-90 hover:opacity-100 shadow-md cursor-pointer transition-transform hover:scale-110"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Optional Manual URL fallback */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Or paste image URL (e.g. /products/cat_pure_pattu.jpg)..."
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#68081C] font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={handleAddManualUrl}
                disabled={!manualUrl.trim()}
                className="text-xs font-bold px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* 2. OPTIONAL VIDEO UPLOAD */}
          <div className="space-y-2 bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>3-4 Seconds Saree Drape Video (Optional)</span>
              </label>
              <span className="text-[10.5px] text-gray-400">Shows fabric flow on Product Page</span>
            </div>

            {formData.video ? (
              <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-3">
                <div className="w-24 h-16 rounded-lg overflow-hidden bg-black relative shrink-0">
                  <video src={formData.video} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-xs">Video Attached ✓</p>
                  <p className="text-[10.5px] text-emerald-700">Plays automatically on Product Page</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                  title="Remove Video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="saree-video-upload-input"
                />
                <label
                  htmlFor="saree-video-upload-input"
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl border border-gray-300 cursor-pointer shadow-2xs"
                >
                  <Video className="w-3.5 h-3.5 text-[#68081C]" />
                  <span>{uploadingVideo ? '⏳ Uploading Video...' : 'Upload Saree Video (MP4/WEBM)'}</span>
                </label>
                <span className="text-[10.5px] text-gray-400">Max 50MB</span>
              </div>
            )}
          </div>

          {/* 3. CORE PRODUCT ESSENTIALS */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Saree Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crimson Gold Dharmavaram Pure Pattu Saree"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Saree Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] bg-white font-semibold text-xs"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2-Column Pricing with Live Discount Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF5EE] p-4 rounded-2xl border border-[#D4AF37]/30">
              <div>
                <label className="block font-bold text-[#68081C] mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 9999"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#68081C] font-extrabold text-sm bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Original MRP (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 14999"
                  value={formData.oldPrice}
                  onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#68081C] font-bold text-sm bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Available Stock Qty</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#68081C] font-bold text-sm bg-white"
                />
              </div>

              {calculateDiscount() && (
                <div className="sm:col-span-3 pt-1 flex items-center gap-1.5 text-[#68081C] font-extrabold text-xs">
                  <Flame className="w-3.5 h-3.5 fill-current text-[#D4AF37]" />
                  <span>Auto-computed Customer Discount: <strong>{calculateDiscount()}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* 4. OPTIONAL LUXURY SPECIFICATIONS (ACCORDION WITH PRE-FILLED DEFAULTS) */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvancedSpecs(!showAdvancedSpecs)}
              className="w-full p-3.5 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left font-bold text-gray-800 text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Authentic Saree Specifications (Pre-Filled with Luxury Defaults)</span>
              </div>
              {showAdvancedSpecs ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </button>

            {showAdvancedSpecs && (
              <div className="p-4 space-y-3.5 bg-white border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Fabric & Silk Type</label>
                    <input
                      type="text"
                      value={formData.fabric}
                      onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Zari & Border Work</label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Blouse Piece Details</label>
                    <input
                      type="text"
                      value={formData.blouse}
                      onChange={(e) => setFormData({ ...formData, blouse: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Saree Drape Length</label>
                    <input
                      type="text"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Occasion / Styling</label>
                    <input
                      type="text"
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Care & Preservation</label>
                    <input
                      type="text"
                      value={formData.careInstructions}
                      onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. HOMEPAGE SHOWCASE & DISPLAY SECTIONS */}
          <div className="bg-[#FAF5EE]/70 p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/35 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#68081C] text-xs sm:text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Homepage Showcase & Display Sections</span>
              </label>
              <span className="text-[10px] text-gray-500 font-medium">Select where to showcase on website homepage</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* 1. Royal Bridal Edit */}
              <label className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none ${
                formData.isRoyalBridal ? 'bg-[#68081C] text-white border-[#68081C] shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  checked={!!formData.isRoyalBridal}
                  onChange={(e) => setFormData({ ...formData, isRoyalBridal: e.target.checked })}
                  className="hidden"
                />
                <Crown className={`w-4 h-4 ${formData.isRoyalBridal ? 'text-[#F3E5AB]' : 'text-[#D4AF37]'}`} />
                <span className="text-xs font-bold">Royal Bridal Edit</span>
              </label>

              {/* 2. Cotton & Kalamkari */}
              <label className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none ${
                formData.isCottonKalamkari ? 'bg-[#68081C] text-white border-[#68081C] shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  checked={!!formData.isCottonKalamkari}
                  onChange={(e) => setFormData({ ...formData, isCottonKalamkari: e.target.checked })}
                  className="hidden"
                />
                <Feather className={`w-4 h-4 ${formData.isCottonKalamkari ? 'text-[#F3E5AB]' : 'text-emerald-600'}`} />
                <span className="text-xs font-bold">Cotton & Kalamkari</span>
              </label>

              {/* 3. Trending Now */}
              <label className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none ${
                formData.isTrending ? 'bg-[#68081C] text-white border-[#68081C] shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  checked={!!formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="hidden"
                />
                <Flame className={`w-4 h-4 ${formData.isTrending ? 'text-[#F3E5AB]' : 'text-amber-600'}`} />
                <span className="text-xs font-bold">Trending Now</span>
              </label>

              {/* 4. Featured Home */}
              <label className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none ${
                formData.isFeatured ? 'bg-[#68081C] text-white border-[#68081C] shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  checked={!!formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="hidden"
                />
                <Sparkles className={`w-4 h-4 ${formData.isFeatured ? 'text-[#F3E5AB]' : 'text-[#D4AF37]'}`} />
                <span className="text-xs font-bold">Featured Home</span>
              </label>
            </div>
          </div>

          {/* 6. SHORT DESCRIPTION */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">Saree Description / Story (Optional)</label>
            <textarea
              rows={3}
              placeholder="Handcrafted by master weavers with intricate temple borders and rich bridal pallu."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] text-xs leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage || uploadingVideo}
              className="bg-[#68081C] hover:bg-[#4A0513] text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Publishing to Cloud...' : initialProduct ? 'Update Saree' : 'Publish Saree to Website'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

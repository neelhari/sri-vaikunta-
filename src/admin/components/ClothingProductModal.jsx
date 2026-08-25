import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Check, Video, Play, AlertCircle, Film } from 'lucide-react';
import { uploadToCloudinary } from '../../lib/cloudinary';

export default function ClothingProductModal({ isOpen, onClose, onSave, initialProduct, categories = [], saving = false }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'sarees',
    subcategory: '',
    price: '',
    oldPrice: '',
    costPrice: '',
    stock: 10,
    fabric: 'Pure Cotton',
    material: 'Zari Weave',
    occasion: 'Festive Wear',
    careInstructions: 'Dry Clean Only',
    sizes: ['S', 'M', 'L', 'XL'],
    description: '',
    video: '',
    videoUrl: '',
    images: [],
  });
  const [uploadError, setUploadError] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        sku: initialProduct.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: initialProduct.category || 'sarees',
        subcategory: initialProduct.subcategory || '',
        price: initialProduct.price || '',
        oldPrice: initialProduct.oldPrice || '',
        costPrice: initialProduct.costPrice || '',
        stock: initialProduct.stock || 10,
        fabric: initialProduct.fabric || 'Pure Cotton',
        material: initialProduct.material || 'Handloom',
        occasion: initialProduct.occasion || 'Festive Wear',
        careInstructions: initialProduct.careInstructions || 'Dry Clean Only',
        sizes: initialProduct.sizes || ['S', 'M', 'L', 'XL'],
        description: initialProduct.description || '',
        video: initialProduct.video || '',
        videoUrl: initialProduct.videoUrl || '',
        images: initialProduct.images || (initialProduct.image ? [initialProduct.image] : []),
      });
    } else {
      setFormData({
        name: '',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: categories[0]?.id || 'sarees',
        subcategory: '',
        price: '',
        oldPrice: '',
        costPrice: '',
        stock: 10,
        fabric: 'Mulchanderi / Pure Cotton',
        material: 'Handloom Zari Work',
        occasion: 'Festive & Wedding Wear',
        careInstructions: 'Dry Clean Only',
        sizes: ['S', 'M', 'L', 'XL'],
        description: '',
        video: '',
        videoUrl: '',
        images: ['/products/saree-placeholder.png'],
      });
    }
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const [isDragging, setIsDragging] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

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
      // 1. Try Cloudinary first if configured
      let url = null;
      try {
        const res = await uploadToCloudinary(file);
        if (res.success && res.url) {
          url = res.url;
        }
      } catch (err) {
        // Fallback to local DataURL
      }

      // 2. Fallback to high-quality DataURL so it works instantly without any cloud setup
      if (!url) {
        url = await readImageAsDataUrl(file);
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
      const res = await uploadToCloudinary(file);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, video: res.url }));
      } else {
        const localUrl = await readImageAsDataUrl(file);
        if (localUrl) setFormData((prev) => ({ ...prev, video: localUrl }));
      }
    } catch (err) {
      const localUrl = await readImageAsDataUrl(file);
      if (localUrl) setFormData((prev) => ({ ...prev, video: localUrl }));
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

  const toggleSize = (size) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      const newSizes = exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      return { ...prev, sizes: newSizes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const discountStr =
      formData.oldPrice && Number(formData.oldPrice) > Number(formData.price)
        ? `${Math.round(((Number(formData.oldPrice) - Number(formData.price)) / Number(formData.oldPrice)) * 100)}% OFF`
        : null;

    const payload = {
      ...formData,
      price: Number(formData.price),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
      discount: discountStr,
      image: formData.images[0] || '/products/saree-placeholder.png',
      video: formData.video || null,
      videoUrl: formData.videoUrl || null,
    };

    const ok = await onSave(payload);
    if (ok !== false) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#6B1518] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold">
              {initialProduct ? 'Edit Clothing Product' : 'Add New Clothing Product'}
            </h3>
            <p className="text-[11px] text-gray-300">
              {BRAND.fullName} CMS • Live Storefront & Saree Catalog Synchronization
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'basic' ? 'border-[#6B1518] text-[#6B1518]' : 'border-transparent text-gray-500'
            }`}
          >
            1. Basic & Pricing
          </button>
          <button
            onClick={() => setActiveTab('attributes')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'attributes' ? 'border-[#6B1518] text-[#6B1518]' : 'border-transparent text-gray-500'
            }`}
          >
            2. Clothing Specs & Sizes
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'media' ? 'border-[#6B1518] text-[#6B1518]' : 'border-transparent text-gray-500'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>3. Images & Video Upload</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* PRIMARY SAREE PHOTO UPLOADER (DIRECTLY ON TAB 1) */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Primary Saree Photo (Upload from Device or Drag & Drop) *
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                    isDragging ? 'border-[#68081C] bg-[#FDF5F6]' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shrink-0 shadow-sm relative group">
                      <img
                        src={formData.images[0] || '/products/saree-placeholder.png'}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center sm:text-left space-y-1.5">
                      <p className="font-bold text-gray-800 text-xs">
                        {uploadingImage ? '⏳ Uploading Photo to Cloudinary...' : 'Drag & Drop Saree Photo or Browse'}
                      </p>
                      <p className="text-gray-400 text-[10.5px]">JPG, PNG or WEBP (Cloudinary Cloud Storage Active)</p>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="primary-saree-photo-upload"
                        />
                        <label
                          htmlFor="primary-saree-photo-upload"
                          className="inline-flex items-center gap-1.5 bg-[#68081C] text-white font-bold text-[11px] px-4 py-2 rounded-xl cursor-pointer hover:bg-[#4A0513] shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingImage ? 'Uploading...' : 'Choose Photo from Device'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Dharmavaram Pure Pattu Saree"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none bg-white"
                  >
                    {categories.length === 0 && <option value={formData.category}>{formData.category}</option>}
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Subcategory</label>
                <input
                  type="text"
                  list="subcategory-suggestions"
                  placeholder="e.g. Banarasi Tissue, Mulchanderi Sets"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                />
                <datalist id="subcategory-suggestions">
                  {(categories.find((c) => c.id === formData.category)?.subcategories || []).map((sub) => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
                <p className="text-[10px] text-gray-400 mt-1">Used for search and category subfiltering on the storefront.</p>
              </div>

              {/* Clean Saree Pricing Grid (Selling Price & Original MRP) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FDFBF7] p-4 rounded-2xl border border-[#F3E5AB]/60">
                <div>
                  <label className="block font-bold text-gray-900 mb-1 text-xs">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 7999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none font-bold text-sm bg-white"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Live customer purchase price on storefront</p>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-xs">Original MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10999"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none bg-white text-sm"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    {formData.oldPrice && Number(formData.oldPrice) > Number(formData.price)
                      ? `Auto-generates ${Math.round(((Number(formData.oldPrice) - Number(formData.price)) / Number(formData.oldPrice)) * 100)}% OFF badge`
                      : 'Used to calculate discount badge'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Saree Description & Highlights</label>
                <textarea
                  rows={3}
                  placeholder="Enter silk purity details, border zari work, pallu design, and drape guidance..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none resize-none text-xs"
                />
              </div>
            </div>
          )}

          {activeTab === 'attributes' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Fabric & Silk Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Dharmavaram Pure Silk / Pochampally Ikkat"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Zari & Border Work</label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Gold Zari / Broad Temple Border"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Blouse Piece Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Included (Unstitched 80cm Running Blouse)"
                    value={formData.blouse || 'Included (Unstitched 80cm Running Blouse)'}
                    onChange={(e) => setFormData({ ...formData, blouse: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Saree Drape Length</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard 6.3 Meters (with Blouse Piece)"
                    value={formData.length || 'Standard 6.3 Meters (with Blouse Piece)'}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Occasion / Styling</label>
                  <input
                    type="text"
                    placeholder="e.g. Bridal, Wedding Guest, Festive Pooja"
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Care & Preservation</label>
                  <input
                    type="text"
                    placeholder="e.g. Dry Clean Only / Wrap in Muslin Cloth"
                    value={formData.careInstructions}
                    onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold p-3 rounded-xl whitespace-pre-line flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
              {/* 1. Photo Upload (Drag & Drop + File Picker) */}
              <div>
                <label className="block font-bold text-gray-900 mb-1">Product Images (Upload 3 or more photos)</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDragging
                      ? 'border-[#68081C] bg-[#FDF5F6] scale-[1.01]'
                      : 'border-gray-300 hover:border-[#68081C] bg-gray-50'
                  }`}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${isDragging ? 'text-[#68081C]' : 'text-gray-400'}`} />
                  <p className="font-bold text-gray-800 text-sm">
                    {isDragging ? 'Drop Photos Here to Upload' : 'Drag & Drop Saree Photos Here'}
                  </p>
                  <p className="text-gray-400 text-[11px] mt-0.5">JPG, PNG or WEBP from your phone or laptop</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="product-photo-upload-input"
                  />
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <label
                      htmlFor="product-photo-upload-input"
                      className="inline-block bg-[#68081C] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer hover:bg-[#4A0513] shadow-xs"
                    >
                      {uploadingImage ? 'Processing Photos...' : 'Choose Photos from Device'}
                    </label>
                  </div>
                </div>

                {/* Optional Manual URL input */}
                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Or paste image URL (e.g. /products/xyz.jpg)..."
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#68081C]"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    disabled={!manualUrl.trim()}
                    className="text-xs font-bold px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {/* Uploaded Images List */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 pt-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 bg-gray-50">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {idx === 0 ? 'Main' : `Photo ${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-90 hover:opacity-100 shadow-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Direct Video File Upload (3-4s motion video) */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-gray-900 flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-[#D3923A]" /> 3-4 Seconds Product Drape Video Upload
                    </label>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Upload a 3-4 second video showing the fabric movement & drape in real life.
                    </p>
                  </div>
                </div>

                {formData.video ? (
                  <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-black relative shrink-0">
                      <video
                        src={formData.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-[#D3923A] text-[#6B1518] text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                        ▶ 3-4s Video
                      </span>
                    </div>
                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <p className="font-bold text-gray-900">Product Video Active</p>
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        ✓ Will play seamlessly on the storefront Product Detail Page!
                      </p>
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="text-xs text-red-600 hover:text-red-800 font-bold inline-flex items-center gap-1 pt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Video
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-5 text-center hover:border-[#D3923A] transition-colors bg-[#FAF8F5]">
                    <Video className="w-7 h-7 text-[#D3923A] mx-auto mb-1.5" />
                    <p className="font-bold text-gray-800">Upload 3-4s Motion Video</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">MP4, WEBM or MOV up to 50MB</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="cloudinary-video-upload-input"
                    />
                    <label
                      htmlFor="cloudinary-video-upload-input"
                      className="mt-2.5 inline-block bg-[#D3923A] hover:bg-[#B37C31] text-[#6B1518] font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-colors"
                    >
                      {uploadingVideo ? 'Uploading Video...' : 'Select Video File'}
                    </label>
                  </div>
                )}
              </div>

              {/* 3. External Video Demonstration Link */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-[#6B1518]" /> External Video Link (Optional YouTube / Instagram URL)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or https://instagram.com/..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage || uploadingVideo}
              className="bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Publish Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

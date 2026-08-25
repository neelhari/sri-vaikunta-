import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Grid, Sparkles, Check, X, Search, ExternalLink, Upload } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { BRAND } from '../../config/brand';

export default function AdminCategories() {
  const { categories = [], products = [], addCategory, updateCategory, deleteCategory } = useStoreData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadToCloudinary(file);
      if (res.success && res.url) {
        setImage(res.url);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => setImage(ev.target.result);
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Category image upload error:', err);
    }
    setUploadingImage(false);
    e.target.value = '';
  };

  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setImage('/products/cat_pure_pattu.jpg');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.tagline || cat.description || '');
    setImage(cat.image || '/products/cat_pure_pattu.jpg');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || saving) return;

    setSaving(true);
    const result = editingCat
      ? await updateCategory(editingCat.id, { name, tagline: description, image })
      : await addCategory({
          id: name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          name,
          tagline: description,
          image: image || '/products/cat_pure_pattu.jpg',
          active: true,
        });
    setSaving(false);

    if (!result.success) {
      window.alert(`Could not save category: ${result.message || 'Unknown error'}`);
      return;
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Sarees assigned to it will retain their values.')) return;
    const result = await deleteCategory(id);
    if (!result.success) {
      window.alert(`Could not delete category: ${result.message || 'Unknown error'}`);
    }
  };

  // Filter categories by search
  const filteredCategories = safeCategories.filter((c) =>
    (c?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c?.id || '').toLowerCase().includes(search.toLowerCase()) ||
    (c?.tagline || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredCategories.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredCategories.map((c) => c.id));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header (Matching Products UI) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Saree Categories & Collections ({safeCategories.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage live storefront categories, navigation badges, and cover photos
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#68081C] hover:bg-[#4A0513] text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#68081C]"
          />
        </div>

        <div className="text-xs text-gray-500 font-semibold">
          Showing {filteredCategories.length} of {safeCategories.length} collections
        </div>
      </div>

      {/* Structured Category Table (Matching Products UI) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredCategories.length && filteredCategories.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded text-[#68081C]"
                  />
                </th>
                <th className="p-4">Category</th>
                <th className="p-4">Slug / Route</th>
                <th className="p-4">Tagline</th>
                <th className="p-4">Sarees Count</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    No categories found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const productCount = safeProducts.filter((p) => p.category === cat.id).length;
                  return (
                    <tr key={cat.id} className="hover:bg-[#FFFDF9] transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(cat.id)}
                          onChange={() => toggleSelectItem(cat.id)}
                          className="rounded text-[#68081C]"
                        />
                      </td>

                      {/* Image Thumbnail + Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <img
                              src={cat.image || '/products/cat_pure_pattu.jpg'}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block text-xs sm:text-sm">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ID: {cat.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Slug / Route Link */}
                      <td className="p-4">
                        <a
                          href={`/categories?category=${cat.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[11px] text-[#68081C] hover:underline flex items-center gap-1"
                        >
                          <span>/categories?category={cat.id}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </a>
                      </td>

                      {/* Tagline */}
                      <td className="p-4 text-gray-600 max-w-xs truncate">
                        {cat.tagline || cat.description || '—'}
                      </td>

                      {/* Sarees Count Badge */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 bg-[#FDF5F6] text-[#68081C] font-bold px-2.5 py-1 rounded-full text-[11px] border border-[#F5D8DD]">
                          {productCount} {productCount === 1 ? 'Saree' : 'Sarees'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live Storefront
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[#68081C] transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#68081C]">
                {editingCat ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dharmavaram Pure Pattu"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Tagline / Short Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Royal Pure Silk with Broad Golden Zari"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none"
                />
              </div>

              {/* Category Cover Photo Uploader */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">Category Cover Photo *</label>
                <div className="border-2 border-dashed border-gray-300 hover:border-[#68081C] rounded-2xl p-4 bg-gray-50 text-center transition-all">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shrink-0 shadow-sm relative">
                      <img
                        src={image || '/products/cat_pure_pattu.jpg'}
                        alt="Category Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center sm:text-left space-y-1.5">
                      <p className="font-bold text-gray-800 text-xs">
                        {uploadingImage ? '⏳ Compressing & Uploading...' : 'Upload Category Photo from Device'}
                      </p>
                      <p className="text-gray-400 text-[10.5px]">JPG, PNG or WEBP (Cloudinary Cloud Storage Active)</p>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="category-photo-file-upload"
                        />
                        <label
                          htmlFor="category-photo-file-upload"
                          className="inline-flex items-center gap-1.5 bg-[#68081C] hover:bg-[#4A0513] text-white font-bold text-[11px] px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingImage ? 'Uploading...' : 'Choose Photo from Device'}</span>
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
                    placeholder="Or paste image URL (e.g. /products/cat_pure_pattu.jpg)..."
                    className="w-full p-2 rounded-xl border border-gray-200 focus:border-[#68081C] focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 text-xs font-bold text-white bg-[#68081C] hover:bg-[#4A0513] rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCat ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

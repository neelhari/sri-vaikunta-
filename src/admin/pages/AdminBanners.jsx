import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, CheckCircle2, Upload } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { uploadToCloudinary } from '../../lib/cloudinary';

export default function AdminBanners() {
  const { banners, addBanner, updateBanner, deleteBanner } = useStoreData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('/shop');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const res = await uploadToCloudinary(file);
    if (res.success) {
      setImage(res.url);
    } else {
      setUploadError(res.message);
    }
    setUploading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !image || saving) return;

    setSaving(true);
    const result = await addBanner({ title, link, image, active: true });
    setSaving(false);

    if (!result.success) {
      window.alert(`Could not save banner: ${result.message || 'Unknown error'}`);
      return;
    }
    setTitle('');
    setImage('');
    setLink('/shop');
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    const result = await deleteBanner(id);
    if (!result.success) {
      window.alert(`Could not delete banner: ${result.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Homepage Hero Banners ({banners.length})</h2>
          <p className="text-xs text-gray-500 mt-0.5">Control live storefront slider graphics and promotional banners</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#6B1518] hover:bg-[#4B0F11] text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hero Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-[2.1/1] bg-gray-100">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              <button
                onClick={async () => {
                  const result = await updateBanner(b.id, { active: !b.active });
                  if (!result.success) window.alert(`Could not update banner: ${result.message || 'Unknown error'}`);
                }}
                className={`absolute top-3 right-3 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs ${
                  b.active ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
              >
                {b.active ? 'Published' : 'Hidden'}
              </button>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-gray-900">{b.title}</h3>
                <p className="text-[11px] text-gray-500 font-mono mt-0.5">Target: {b.link}</p>
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-100"
                title="Delete Banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#6B1518]">Add Hero Banner</h3>
              <button onClick={() => setIsModalOpen(false)} className="font-bold text-gray-400">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Banarasi Silk Festival"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Navigation Target Link</label>
                <input
                  type="text"
                  placeholder="/shop?category=sarees"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Banner Image (Cloudinary)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs text-gray-500"
                  />
                  {uploading && <span className="text-[10px] text-amber-600 font-bold">Uploading...</span>}
                </div>
                {uploadError && <p className="text-[11px] text-red-600 font-semibold mt-1">{uploadError}</p>}
                {image && (
                  <img src={image} alt="Banner preview" className="mt-2 w-full aspect-[2.1/1] object-cover rounded-xl border border-gray-200" />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={saving || uploading || !image} className="bg-[#6B1518] disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-bold">
                  {saving ? 'Saving...' : 'Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

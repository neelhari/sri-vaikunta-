import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, MapPin, Phone, Mail, DollarSign } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminSettings() {
  const { settings, updateSettings } = useStoreData();
  const [formData, setFormData] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <h2 className="font-serif text-2xl font-bold text-gray-900">Store Configuration & Tax Settings</h2>
        <p className="text-xs text-gray-500 mt-0.5">Centralized store details, phone, GSTIN, and shipping thresholds</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Store configuration saved successfully! All storefront pages reflect the updated settings.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xs space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#6B1518] border-b border-gray-100 pb-2">
            1. Brand & Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Store Name</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Founder / Owner Name</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Store Phone / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Support Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Physical Store Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-serif text-lg font-bold text-[#6B1518] border-b border-gray-100 pb-2">
            2. Financial, GST & Shipping Policy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] font-bold"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-8 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}

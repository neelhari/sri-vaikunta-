import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, MapPin, Phone, Mail, DollarSign } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminSettings() {
  const { settings, updateSettings } = useStoreData();
  const [formData, setFormData] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // `settings` loads asynchronously from Supabase after this component's
  // first render, so the form must resync once the real values arrive.
  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...formData,
      freeShippingThreshold: formData.freeShippingThreshold === '' ? 0 : Number(formData.freeShippingThreshold),
      deliveryCharge: formData.deliveryCharge === '' ? 0 : Number(formData.deliveryCharge),
    };
    const result = await updateSettings(payload);
    setSaving(false);

    if (!result.success) {
      setError(result.message || 'Could not save settings.');
      return;
    }
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold animate-fadeIn">
          {error}
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
                type="text"
                inputMode="numeric"
                value={formData.freeShippingThreshold !== undefined && formData.freeShippingThreshold !== null ? formData.freeShippingThreshold : ''}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: e.target.value.replace(/\D/g, '') })}
                placeholder="e.g. 3000"
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Standard Delivery Charge (₹)</label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.deliveryCharge !== undefined && formData.deliveryCharge !== null ? formData.deliveryCharge : ''}
                onChange={(e) => setFormData({ ...formData, deliveryCharge: e.target.value.replace(/\D/g, '') })}
                placeholder="e.g. 100"
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518] font-bold"
              />
            </div>
          </div>
        </div>

        {/* 3. Checkout Payment Methods (ON/OFF Switches) */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="font-serif text-lg font-bold text-[#6B1518]">
              3. Checkout Payment Options (Enable / Disable)
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Control which payment options are shown to customers on the checkout page. Turn off when not required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Toggle 1: Cash on Delivery (COD) */}
            <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-xs">Cash on Delivery (COD)</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${formData.codEnabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                    {formData.codEnabled !== false ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Allow patrons to pay in cash upon doorstep delivery.
                </p>
              </div>

              {/* iOS Style Switch */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, codEnabled: !(formData.codEnabled !== false) })}
                className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer shrink-0 ${
                  formData.codEnabled !== false ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                    formData.codEnabled !== false ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: WhatsApp Direct Order */}
            <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-xs">WhatsApp Direct Order</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${formData.enableWhatsappOrders !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                    {formData.enableWhatsappOrders !== false ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Allow customers to place custom orders via WhatsApp chat.
                </p>
              </div>

              {/* iOS Style Switch */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, enableWhatsappOrders: !(formData.enableWhatsappOrders !== false) })}
                className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer shrink-0 ${
                  formData.enableWhatsappOrders !== false ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                    formData.enableWhatsappOrders !== false ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Store Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

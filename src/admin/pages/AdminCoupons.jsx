import React, { useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, Sparkles, Percent, IndianRupee, Power, AlertCircle } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminCoupons() {
  const { coupons = [], addCoupon, updateCoupon, deleteCoupon } = useStoreData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState('flat'); // default to 'flat' (₹) as requested
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const safeCoupons = Array.isArray(coupons) ? coupons : [];

  const handleOpenAdd = () => {
    setCode('');
    setType('flat');
    setDiscountValue('');
    setMinOrder('0');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!code.trim() || !discountValue || saving) return;

    setSaving(true);
    setErrorMsg('');

    const result = await addCoupon({
      code: code.toUpperCase().trim(),
      discountType: type === 'flat' ? 'flat' : 'percentage',
      type: type === 'flat' ? 'flat' : 'percentage',
      discountValue: Number(discountValue),
      minOrder: Number(minOrder) || 0,
      active: true,
    });
    setSaving(false);

    if (!result.success) {
      setErrorMsg(result.message || 'Could not save coupon');
      return;
    }

    setIsModalOpen(false);
  };

  const handleToggleActive = async (c) => {
    const newStatus = !c.active;
    const result = await updateCoupon(c.id, { active: newStatus });
    if (!result.success) {
      window.alert(`Could not update coupon: ${result.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id, couponCode) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) return;
    const result = await deleteCoupon(id);
    if (!result.success) {
      window.alert(`Could not delete coupon: ${result.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Discount Coupons & Promo Codes ({safeCoupons.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage promotional discount codes applied by customers during checkout
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#68081C] hover:bg-[#4A0513] text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Coupon</span>
        </button>
      </div>

      {/* Structured Coupons Table (One After Another) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
              <tr>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount Benefit</th>
                <th className="p-4">Min. Order Value</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {safeCoupons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400 font-medium">
                    No coupons created yet. Click "+ Create New Coupon" to create your first discount code.
                  </td>
                </tr>
              ) : (
                safeCoupons.map((c) => (
                  <tr key={c.id || c.code} className="hover:bg-gray-50/80 transition-colors">
                    {/* Code */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#68081C]" />
                        <span className="font-mono font-extrabold text-sm bg-[#FAF5EE] text-[#68081C] border border-[#D4AF37]/30 px-3 py-1 rounded-xl tracking-wider">
                          {c.code}
                        </span>
                      </div>
                    </td>

                    {/* Discount Value */}
                    <td className="p-4 font-bold text-gray-900 text-sm">
                      {c.type === 'percentage' || c.discountType === 'percentage' ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-extrabold">
                          <Percent className="w-3.5 h-3.5" />
                          <span>{c.discountValue}% OFF</span>
                        </span>
                      ) : (
                        <span className="text-emerald-700 flex items-center gap-1 font-extrabold">
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>₹{c.discountValue} Flat OFF</span>
                        </span>
                      )}
                    </td>

                    {/* Min Order */}
                    <td className="p-4 text-gray-600 font-medium">
                      {c.minOrder > 0 ? (
                        <span>Orders above <strong>₹{Number(c.minOrder).toLocaleString('en-IN')}</strong></span>
                      ) : (
                        <span className="text-gray-400">No Minimum</span>
                      )}
                    </td>

                    {/* Active / Disabled Toggle Switch Button */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          c.active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-300 hover:bg-gray-200'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-2 h-2 rounded-full ${c.active ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`} />
                        <span>{c.active ? '● Active on Checkout' : '○ Disabled'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer font-bold inline-flex items-center gap-1"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#68081C]">Create New Coupon Code</h3>
                <p className="text-[11px] text-gray-500">Live discount code for customer checkout</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="font-bold text-gray-400 hover:text-gray-600 cursor-pointer p-1">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIKHIL200 or FESTIVE20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#68081C] uppercase font-mono font-extrabold text-sm tracking-wider"
                />
              </div>

              {/* Discount Type Picker (2 Big Buttons) */}
              <div>
                <label className="block font-bold text-gray-800 mb-1.5">Choose Discount Type *</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setType('flat')}
                    className={`p-3 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      type === 'flat'
                        ? 'border-[#68081C] bg-[#FAF5EE] text-[#68081C] shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <IndianRupee className="w-4 h-4" />
                    <span>Flat Amount (₹ OFF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('percentage')}
                    className={`p-3 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      type === 'percentage'
                        ? 'border-[#68081C] bg-[#FAF5EE] text-[#68081C] shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Percent className="w-4 h-4" />
                    <span>Percentage (% OFF)</span>
                  </button>
                </div>
              </div>

              {/* Value & Min Order Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {type === 'flat' ? 'Discount Amount (₹) *' : 'Discount Percentage (%) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={type === 'percentage' ? '90' : '99999'}
                    placeholder={type === 'flat' ? 'e.g. 200' : 'e.g. 20'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C] font-extrabold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Min. Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 600"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#68081C] font-semibold text-sm"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              {code && discountValue && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-0.5">
                  <p className="font-extrabold flex items-center gap-1">
                    <span>✓ Preview:</span>
                    <span>
                      Customer gets {type === 'flat' ? `₹${discountValue} Flat Discount` : `${discountValue}% OFF`}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Active on orders above ₹{minOrder || '0'} when typing <strong>{code}</strong> at checkout.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#68081C] hover:bg-[#4A0513] rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving Coupon...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

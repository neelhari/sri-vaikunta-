import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  Sparkles,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminInventory() {
  const { products = [], updateProduct } = useStoreData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  const [updatingId, setUpdatingId] = useState(null);

  const safeProducts = Array.isArray(products) ? products : [];

  // Metrics calculation
  const totalCount = safeProducts.length;
  const inStockCount = safeProducts.filter((p) => (p.stock ?? 10) > 3).length;
  const lowStockCount = safeProducts.filter((p) => (p.stock ?? 10) > 0 && (p.stock ?? 10) <= 3).length;
  const outOfStockCount = safeProducts.filter((p) => (p.stock ?? 10) === 0).length;

  const filteredProducts = safeProducts.filter((p) => {
    const nameMatch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

    if (!nameMatch) return false;

    const stock = p.stock ?? 10;
    if (statusFilter === 'IN_STOCK') return stock > 3;
    if (statusFilter === 'LOW_STOCK') return stock > 0 && stock <= 3;
    if (statusFilter === 'OUT_OF_STOCK') return stock === 0;

    return true;
  });

  const handleStockChange = async (p, delta) => {
    const currentStock = p.stock ?? 10;
    const newStock = Math.max(0, currentStock + delta);
    setUpdatingId(p.id);
    const result = await updateProduct(p.id, {
      stock: newStock,
      inStock: newStock > 0,
    });
    setUpdatingId(null);
    if (!result.success) {
      window.alert(`Could not update stock: ${result.message || 'Unknown error'}`);
    }
  };

  const handleSetStock = async (p, rawVal) => {
    const newStock = Math.max(0, parseInt(rawVal, 10) || 0);
    setUpdatingId(p.id);
    const result = await updateProduct(p.id, {
      stock: newStock,
      inStock: newStock > 0,
    });
    setUpdatingId(null);
    if (!result.success) {
      window.alert(`Could not update stock: ${result.message || 'Unknown error'}`);
    }
  };

  const handleToggleInStock = async (p) => {
    const isCurrentlyIn = (p.stock ?? 10) > 0;
    const newStock = isCurrentlyIn ? 0 : 5;
    setUpdatingId(p.id);
    const result = await updateProduct(p.id, {
      stock: newStock,
      inStock: !isCurrentlyIn,
    });
    setUpdatingId(null);
    if (!result.success) {
      window.alert(`Could not update stock: ${result.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D3923A] block">
            Catalogue Fulfillment
          </span>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mt-0.5">
            Stock & Inventory Controls
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage live available quantities, low stock alerts, and instant availability toggles
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saree name, weave, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#6B1518] bg-gray-50/50"
          />
        </div>
      </div>

      {/* 4 Quick Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-white border-[#6B1518] ring-2 ring-[#6B1518]/20 shadow-sm'
              : 'bg-white/80 border-gray-100 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Total Sarees</span>
            <Package className="w-4 h-4 text-gray-400" />
          </div>
          <p className="font-serif text-2xl font-extrabold text-gray-900 mt-1">{totalCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('IN_STOCK')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'IN_STOCK'
              ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm'
              : 'bg-white/80 border-gray-100 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">Healthy Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-extrabold text-emerald-700 mt-1">{inStockCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('LOW_STOCK')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'LOW_STOCK'
              ? 'bg-white border-amber-600 ring-2 ring-amber-600/20 shadow-sm'
              : 'bg-white/80 border-gray-100 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">Low Stock (≤3)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif text-2xl font-extrabold text-amber-700 mt-1">{lowStockCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('OUT_OF_STOCK')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'OUT_OF_STOCK'
              ? 'bg-white border-red-600 ring-2 ring-red-600/20 shadow-sm'
              : 'bg-white/80 border-gray-100 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700">Out of Stock</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="font-serif text-2xl font-extrabold text-red-700 mt-1">{outOfStockCount}</p>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
              <tr>
                <th className="p-4 pl-6">SAREE ITEM</th>
                <th className="p-4">CATEGORY</th>
                <th className="p-4">PRICE</th>
                <th className="p-4 text-center">QUANTITY (UNITS)</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 pr-6 text-center">FAST TOGGLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-gray-400 font-serif text-sm">
                    No matching saree inventory items found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = p.stock ?? 10;
                  const isOut = stock === 0;
                  const isLow = stock > 0 && stock <= 3;
                  const isUpdating = updatingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Saree & Image */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-14 object-cover rounded-xl border border-gray-200/80 shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 block truncate max-w-xs">{p.name}</span>
                            <span className="font-mono text-[10px] text-gray-400 block mt-0.5">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="font-bold text-gray-700 capitalize text-xs">
                          {p.category?.replace(/-/g, ' ') || 'General'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-bold text-gray-900 text-xs">
                        ₹{Number(p.price || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Stock Quantity Adjuster */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleStockChange(p, -1)}
                            disabled={stock <= 0 || isUpdating}
                            className="w-7 h-7 rounded-xl bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-700 font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="Decrease Stock"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={stock}
                            onChange={(e) => handleSetStock(p, e.target.value)}
                            disabled={isUpdating}
                            className="w-12 text-center text-xs font-mono font-extrabold text-gray-900 bg-transparent focus:outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => handleStockChange(p, 1)}
                            disabled={isUpdating}
                            className="w-7 h-7 rounded-xl bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-40 text-white font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="Increase Stock"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 whitespace-nowrap">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-red-100 text-red-800 px-3 py-1 rounded-2xl border border-red-200">
                            <XCircle className="w-3.5 h-3.5" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-amber-100 text-amber-800 px-3 py-1 rounded-2xl border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock ({stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-2xl border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({stock})
                          </span>
                        )}
                      </td>

                      {/* 1-Click Fast Toggle */}
                      <td className="p-4 pr-6 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleInStock(p)}
                          disabled={isUpdating}
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                            isOut
                              ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                              : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                          }`}
                        >
                          {isOut ? '+ Restock (5)' : 'Mark Out of Stock'}
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
    </div>
  );
}

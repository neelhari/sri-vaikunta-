import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Truck,
  Eye,
  Trash2,
  ExternalLink,
  ChevronDown,
  Phone,
  Clock,
  CheckCircle2,
  X,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { BRAND } from '../../config/brand';

const STATUS_CONFIG = {
  'Out for Delivery': { bg: 'bg-[#FAF5FF]', text: 'text-[#7E22CE]', border: 'border-[#E9D5FF]' },
  'Order Accepted': { bg: 'bg-[#FEFCE8]', text: 'text-[#854D0E]', border: 'border-[#FEF08A]' },
  'Order Placed': { bg: 'bg-[#FEFCE8]', text: 'text-[#854D0E]', border: 'border-[#FEF08A]' },
  'Processing': { bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', border: 'border-[#BFDBFE]' },
  'Delivered': { bg: 'bg-[#F0FDF4]', text: 'text-[#15803D]', border: 'border-[#BBF7D0]' },
  'Cancelled': { bg: 'bg-[#FEF2F2]', text: 'text-[#B91C1C]', border: 'border-[#FECACA]' },
  'Pending': { bg: 'bg-[#FEFCE8]', text: 'text-[#854D0E]', border: 'border-[#FEF08A]' },
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const { orders = [], updateOrderStatus, deleteOrder, refreshOrders } = useStoreData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingForm, setTrackingForm] = useState({
    status: 'Out for Delivery',
    courier: 'DTDC Express',
    trackingId: '',
  });
  const [savingTracking, setSavingTracking] = useState(false);

  const [viewOrder, setViewOrder] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (typeof refreshOrders === 'function') {
      try {
        const res = refreshOrders();
        if (res && typeof res.finally === 'function') {
          res.finally(() => setLoading(false));
        }
      } catch (e) {
        setLoading(false);
      }
    }
  }, [refreshOrders]);

  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = safeOrders.filter((o) => {
    const matchesSearch =
      (o?.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (o?.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (o?.customerPhone || '').includes(search) ||
      (o?.tracking?.trackingId || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenTrackingModal = (order) => {
    setTrackingModalOrder(order);
    setTrackingForm({
      status: order.status || 'Out for Delivery',
      courier: order.tracking?.courier || 'DTDC Express',
      trackingId: order.tracking?.trackingId || '',
    });
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    setSavingTracking(true);

    const trackingData = trackingForm.trackingId.trim()
      ? {
          courier: trackingForm.courier || 'DTDC Express',
          trackingId: trackingForm.trackingId.trim(),
          updatedAt: new Date().toISOString(),
        }
      : null;

    await updateOrderStatus(trackingModalOrder.id, trackingForm.status, trackingData);
    setSavingTracking(false);
    setTrackingModalOrder(null);
  };

  const handleDirectStatusChange = async (orderId, newStatus) => {
    const order = safeOrders.find((o) => o.id === orderId);
    await updateOrderStatus(orderId, newStatus, order?.tracking || null);
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}?`)) {
      await deleteOrder(orderId);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5 font-medium">
          <span>Admin</span>
          <span>&gt;</span>
          <span className="text-[#6B1518] font-bold">Orders</span>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-gray-700 hover:text-[#6B1518] bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-2xs font-bold transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Live Website</span>
        </a>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF0F0] text-[#6B1518] flex items-center justify-center shrink-0 border border-[#6B1518]/10 mt-0.5">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                Orders Management
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Track customer orders, process fulfillment, and monitor daily revenue
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order ID, customer or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#6B1518] bg-[#FDFDFD]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-56 text-xs p-2.5 rounded-2xl border border-gray-200 bg-white font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-[#6B1518]"
          >
            <option value="all">All Order Statuses</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Order Accepted">Order Accepted</option>
            <option value="Processing">Processing / Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-gray-500 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100">
              <tr>
                <th className="p-4 pl-6">ORDER ID</th>
                <th className="p-4">CUSTOMER DETAILS</th>
                <th className="p-4 text-center">ITEMS COUNT</th>
                <th className="p-4">TOTAL AMOUNT</th>
                <th className="p-4">DATE</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 pr-6 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#6B1518]" />
                    <p className="text-xs mt-2">Loading orders...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400 font-serif text-sm">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const currentStatus = ord.status || 'Order Placed';
                  const style = STATUS_CONFIG[currentStatus] || STATUS_CONFIG['Pending'];
                  const formattedOrderId = ord.id?.startsWith('#') ? ord.id : `#${ord.id}`;

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4 pl-6 font-mono font-extrabold text-gray-900">
                        {formattedOrderId}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{ord.customerName || 'Customer'}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{ord.customerPhone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-gray-700">
                        {ord.itemsCount || (ord.items ? ord.items.length : 1)} items
                      </td>
                      <td className="p-4 font-bold text-gray-900 text-sm">
                        ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-gray-500 whitespace-nowrap">
                        {ord.date || (ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent')}
                      </td>
                      {/* Status & DTDC Tracking Pill (Matching Image 1) */}
                      <td className="p-4 space-y-1.5 min-w-[210px]">
                        {/* Status Dropdown */}
                        <div className="relative">
                          <select
                            value={ord.status || 'Order Placed'}
                            onChange={(e) => handleDirectStatusChange(ord.id, e.target.value)}
                            className={`w-full text-xs font-bold px-3.5 py-2 rounded-2xl border appearance-none cursor-pointer focus:outline-none ${style.bg} ${style.text} ${style.border}`}
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Order Accepted">Order Accepted</option>
                            <option value="Processing">Processing / Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${style.text}`} />
                        </div>

                        {/* DTDC Tracking Button / Tag */}
                        {ord.tracking?.trackingId ? (
                          <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] rounded-2xl px-3 py-1.5 text-xs font-bold flex items-center justify-between gap-1 shadow-2xs">
                            <div className="flex items-center gap-1.5 truncate">
                              <Truck className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                              <span className="truncate font-bold">DTDC: {ord.tracking.trackingId}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenTrackingModal(ord)}
                              className="text-[#2563EB] hover:underline text-xs font-bold cursor-pointer shrink-0 ml-1"
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenTrackingModal(ord)}
                            className="w-full bg-[#EFF6FF]/40 hover:bg-[#EFF6FF] border border-[#BFDBFE]/60 text-[#2563EB] rounded-2xl px-3 py-1 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>+ Set DTDC Tracking</span>
                          </button>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setViewOrder(ord)}
                            title="View Order Details"
                            className="p-1.5 text-gray-500 hover:text-[#6B1518] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(ord.id)}
                            title="Delete Order"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* ================= DTDC TRACKING MODAL (MATCHES SCREENSHOT 2) ================= */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#D3923A]">
                  Dispatch & Logistics
                </span>
                <h3 className="font-serif text-lg font-bold text-gray-900 mt-0.5">
                  Order #{trackingModalOrder.id} · {trackingModalOrder.customerName}
                </h3>
              </div>
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Matching Screenshot 2 */}
            <form onSubmit={handleSaveTracking} className="space-y-4">
              {/* DELIVERY STATUS * */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  DELIVERY STATUS <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={trackingForm.status}
                    onChange={(e) => setTrackingForm({ ...trackingForm, status: e.target.value })}
                    className="w-full text-xs font-bold p-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-[#6B1518] appearance-none"
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Order Accepted">Order Accepted</option>
                    <option value="Processing">Processing / Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* COURIER PARTNER NAME */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  COURIER PARTNER NAME
                </label>
                <input
                  type="text"
                  value={trackingForm.courier}
                  onChange={(e) => setTrackingForm({ ...trackingForm, courier: e.target.value })}
                  placeholder="DTDC Express"
                  className="w-full text-xs font-medium p-3 rounded-2xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:border-[#6B1518]"
                />
              </div>

              {/* DTDC TRACKING ID / AWB NUMBER * */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  DTDC TRACKING ID / AWB NUMBER <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. asdfvg / 12345678"
                  value={trackingForm.trackingId}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingId: e.target.value })}
                  className="w-full text-xs font-mono font-bold p-3.5 rounded-2xl border border-blue-200 bg-blue-50/40 text-blue-900 focus:outline-none focus:border-blue-600 tracking-wider"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Customer can click to copy this tracking number in their account.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTracking}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#6B1518] hover:bg-[#4B0F11] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {savingTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Tracking Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW ORDER DETAILS MODAL ================= */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-[#6B1518]">Order Summary</span>
                <h3 className="font-serif text-lg font-bold text-gray-900 mt-0.5">#{viewOrder.id}</h3>
              </div>
              <button onClick={() => setViewOrder(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tracking Badge in Modal if Present */}
            {viewOrder.tracking?.trackingId && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Courier Tracking:</span>
                  <span className="font-mono font-extrabold text-blue-900">
                    {viewOrder.tracking.courier}: {viewOrder.tracking.trackingId}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(viewOrder.tracking.trackingId, 'modal_track')}
                  className="bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  {copiedId === 'modal_track' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'modal_track' ? 'Copied' : 'Copy AWB'}</span>
                </button>
              </div>
            )}

            {/* Customer Details */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Recipient:</span>
                <span className="font-bold text-gray-900">{viewOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="font-mono font-bold text-gray-900">{viewOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Address:</span>
                <span className="text-right text-gray-800 font-medium max-w-xs">
                  {viewOrder.address}, {viewOrder.city} - {viewOrder.pincode}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200/60 pt-2">
                <span className="text-gray-500">Payment:</span>
                <span className="font-bold text-emerald-700">{viewOrder.paymentMethod} ({viewOrder.paymentStatus})</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-gray-700">Ordered Sarees:</h4>
              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {(viewOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-lg border border-gray-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-gray-900 truncate">{item.name}</h5>
                      <span className="text-[11px] text-gray-500">Qty: {item.quantity} × ₹{Number(item.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-center border-t border-gray-100 pt-3 text-sm">
              <span className="font-bold text-gray-700">Total Paid / Payable:</span>
              <span className="font-serif text-lg font-extrabold text-[#6B1518]">
                ₹{Number(viewOrder.totalAmount || 0).toLocaleString('en-IN')}
              </span>
            </div>

            {/* WhatsApp Contact Action */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <a
                href={`https://wa.me/91${viewOrder.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hello ${viewOrder.customerName}, this is regarding your order #${viewOrder.id} at ${BRAND.fullName}. Your order status is: ${viewOrder.status}${viewOrder.tracking?.trackingId ? ` (DTDC Tracking: ${viewOrder.tracking.trackingId})` : ''}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-xs text-xs"
              >
                <span>💬 WhatsApp Customer</span>
              </a>

              <button
                onClick={() => setViewOrder(null)}
                className="bg-[#6B1518] text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

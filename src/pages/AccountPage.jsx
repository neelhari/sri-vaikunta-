import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  ChevronRight,
  Package,
  Plus,
  Trash2,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Ticket,
  Edit3,
  ArrowLeft,
  X,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useStoreData } from '../context/StoreDataContext';
import { fetchCustomerOrders } from '../lib/supabase';
import { BRAND, waLink } from '../config/brand';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, addAddress, updateProfile } = useAuth();
  const { wishlistItems } = useWishlist();
  const { cartItems } = useCart();
  const { coupons = [] } = useStoreData();

  const [activeModal, setActiveModal] = useState(null); // 'orders' | 'addresses' | 'coupons' | 'addAddress' | 'editProfile'
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [newAddr, setNewAddr] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    type: 'Home',
  });

  const [editProfileData, setEditProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (!user) {
      setUserOrders([]);
      setLoadingOrders(false);
      return;
    }
    let active = true;
    setLoadingOrders(true);
    fetchCustomerOrders({ userId: user.id, email: user.email, phone: user.phone }).then((res) => {
      if (active) {
        if (res.success) setUserOrders(res.data);
        setLoadingOrders(false);
      }
    });
    return () => { active = false; };
  }, [user?.id, user?.email, user?.phone]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.addressLine.trim() || !newAddr.pincode.trim()) return;
    await addAddress(newAddr);
    setActiveModal(null);
    setNewAddr({
      name: user?.name || '',
      phone: user?.phone || '',
      addressLine: '',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '',
      type: 'Home',
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editProfileData.name.trim()) return;
    await updateProfile(editProfileData);
    setActiveModal(null);
  };

  const userInitial = (user?.name?.charAt(0) || user?.email?.charAt(0) || 'C').toUpperCase();
  const userCity = user?.addresses?.[0]?.city || 'Hyderabad';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-3 px-3 sm:px-4 overflow-x-hidden">
      <div className="w-full max-w-md mx-auto space-y-4">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between py-1">
          <button
            onClick={() => navigate('/shop')}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-2xs inline-flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>← Store</span>
          </button>
          <h1 className="font-sans text-base font-bold text-gray-900 tracking-tight">
            My Account Portal
          </h1>
          {isAuthenticated ? (
            <button
              onClick={() => {
                setEditProfileData({ name: user?.name || '', phone: user?.phone || '' });
                setActiveModal('editProfile');
              }}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 shadow-2xs transition-all cursor-pointer"
              title="Edit Profile"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Customer Profile Card */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          {isAuthenticated && user ? (
            <>
              {/* User Identity Row */}
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xl font-bold font-serif shrink-0 shadow-sm">
                  {userInitial}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-gray-900 truncate">
                      {user.name || 'Valued Customer'}
                    </h2>
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                      <Sparkles className="w-2.5 h-2.5" /> VIP
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 truncate">
                    <Phone className="w-3 h-3 shrink-0 text-gray-400" />
                    <span>{user.phone ? `+91 ${user.phone}` : '+91 99899 99999'}</span>
                    <span>•</span>
                    <span className="truncate">{userCity}</span>
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 shrink-0 text-gray-300" />
                    <span className="truncate">{user.email}</span>
                  </p>
                </div>
              </div>

              {/* 3 Quick Stats Row */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <button
                  onClick={() => setActiveModal('orders')}
                  className="bg-[#F8FAFC] hover:bg-gray-100 border border-gray-100 rounded-2xl p-2.5 text-center transition-all cursor-pointer"
                >
                  <span className="block font-extrabold text-base text-gray-900 leading-tight">
                    {userOrders.length}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Total Orders</span>
                </button>

                <button
                  onClick={() => navigate('/wishlist')}
                  className="bg-[#F8FAFC] hover:bg-gray-100 border border-gray-100 rounded-2xl p-2.5 text-center transition-all cursor-pointer"
                >
                  <span className="block font-extrabold text-base text-gray-900 leading-tight">
                    {wishlistItems.length}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Saved Items</span>
                </button>

                <button
                  onClick={() => setActiveModal('addresses')}
                  className="bg-[#F8FAFC] hover:bg-gray-100 border border-gray-100 rounded-2xl p-2.5 text-center transition-all cursor-pointer"
                >
                  <span className="block font-extrabold text-base text-gray-900 leading-tight">
                    {user.addresses?.length || 0}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Addresses</span>
                </button>
              </div>
            </>
          ) : (
            /* Log In / Sign Up Prompt when guest */
            <div className="text-center py-3 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#6B1518]/10 text-[#6B1518] flex items-center justify-center mx-auto">
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif text-lg font-bold text-gray-900">
                  Welcome to {BRAND.name}
                </h2>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Log in or create an account to view your order history, delivery addresses, and exclusive VIP offers.
                </p>
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => navigate('/login?redirect=/account')}
                  className="flex-1 bg-[#6B1518] hover:bg-[#4B0F11] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  LOG IN
                </button>
                <button
                  onClick={() => navigate('/signup?redirect=/account')}
                  className="flex-1 bg-white hover:bg-gray-50 text-[#6B1518] border border-[#6B1518] font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  CREATE ACCOUNT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section Header */}
        <div className="pt-1">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 px-1">
            My Account & Shopping
          </h3>
        </div>

        {/* 2-Column Action Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Orders */}
          <button
            onClick={() => setActiveModal('orders')}
            className="bg-white hover:bg-gray-50/80 border border-gray-100 rounded-2xl p-3.5 flex items-center justify-between text-left shadow-2xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-[#6B1518]/10 group-hover:text-[#6B1518] transition-colors">
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block font-bold text-xs text-gray-900">Orders</span>
                <span className="text-[11px] text-gray-400 font-medium">{userOrders.length} orders</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
          </button>

          {/* Card 2: Wishlist */}
          <button
            onClick={() => navigate('/wishlist')}
            className="bg-white hover:bg-gray-50/80 border border-gray-100 rounded-2xl p-3.5 flex items-center justify-between text-left shadow-2xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-[#6B1518]/10 group-hover:text-[#6B1518] transition-colors">
                <Heart className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block font-bold text-xs text-gray-900">Wishlist</span>
                <span className="text-[11px] text-gray-400 font-medium">{wishlistItems.length} items</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
          </button>

          {/* Card 3: Addresses */}
          <button
            onClick={() => setActiveModal('addresses')}
            className="bg-white hover:bg-gray-50/80 border border-gray-100 rounded-2xl p-3.5 flex items-center justify-between text-left shadow-2xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-[#6B1518]/10 group-hover:text-[#6B1518] transition-colors">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block font-bold text-xs text-gray-900">Addresses</span>
                <span className="text-[11px] text-gray-400 font-medium">{user?.addresses?.length || 0} saved</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
          </button>

          {/* Card 4: Coupons */}
          <button
            onClick={() => setActiveModal('coupons')}
            className="bg-white hover:bg-gray-50/80 border border-gray-100 rounded-2xl p-3.5 flex items-center justify-between text-left shadow-2xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-[#6B1518]/10 group-hover:text-[#6B1518] transition-colors">
                <Ticket className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block font-bold text-xs text-gray-900">Coupons</span>
                <span className="text-[11px] text-gray-400 font-medium">VIP Offers</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
          </button>
        </div>

        {/* Card 5: 24/7 VIP Customer Support (Full Width) */}
        <a
          href={waLink(`Hello ${BRAND.name}, I am a patron and have an inquiry about my account / sarees.`)}
          target="_blank"
          rel="noreferrer"
          className="bg-white hover:bg-emerald-50/40 border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-2xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <MessageCircle className="w-5 h-5 fill-emerald-600/20" />
            </div>
            <div>
              <span className="block font-bold text-xs text-gray-900">
                24/7 VIP Customer Support
              </span>
              <p className="text-[11px] text-gray-400 leading-tight">
                Direct WhatsApp chat with Sri Vaikunta Sarees
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 transition-colors" />
        </a>

        {/* Card 6: Log Out Button (If Logged In) */}
        {isAuthenticated && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                logout();
              }
            }}
            className="w-full bg-white hover:bg-red-50/50 border border-gray-200 text-red-600 font-bold text-xs py-3.5 rounded-2xl shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>🚪</span>
            <span>Log Out of Account</span>
          </button>
        )}

      </div>

      {/* ================= MODAL 1: MY ORDERS ================= */}
      {activeModal === 'orders' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between bg-[#6B1518] text-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D3923A]" />
                <h3 className="font-serif font-bold text-base">My Orders ({userOrders.length})</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {!isAuthenticated ? (
                <div className="text-center py-10 space-y-3">
                  <p className="text-xs text-gray-500">Please log in to view your orders.</p>
                  <button
                    onClick={() => navigate('/login?redirect=/account')}
                    className="bg-[#6B1518] text-white text-xs font-bold px-6 py-2 rounded-xl"
                  >
                    Log In
                  </button>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="text-center py-12 space-y-3 text-gray-400">
                  <Package className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
                  <p className="text-xs text-gray-600 font-bold">No orders placed yet.</p>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      navigate('/shop');
                    }}
                    className="bg-[#6B1518] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs"
                  >
                    Explore Sarees
                  </button>
                </div>
              ) : (
                userOrders.map((ord) => (
                  <div key={ord.id} className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-200/80 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                      <div>
                        <span className="font-mono font-bold text-[#6B1518] text-xs">{ord.id}</span>
                        <span className="text-[10px] text-gray-400 block">{ord.date}</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-medium text-gray-800 line-clamp-1">{item.name} × {item.quantity}</span>
                          <span className="font-bold text-gray-900 shrink-0 ml-2">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* DTDC Courier Tracking Badge */}
                    {ord.tracking?.trackingId && (
                      <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-blue-700 font-extrabold uppercase block">
                              {ord.tracking.courier || 'DTDC Express'}
                            </span>
                            <span className="font-mono font-bold text-xs text-blue-900 truncate block">
                              AWB: {ord.tracking.trackingId}
                            </span>
                          </div>
                        </div>
                        <a
                          href="https://www.dtdc.in/tracking.asp"
                          target="_blank"
                          rel="noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 shadow-2xs"
                        >
                          <span>Track on DTDC ↗</span>
                        </a>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Total: <strong className="text-gray-900 font-extrabold">₹{ord.totalAmount.toLocaleString('en-IN')}</strong></span>
                      <a
                        href={waLink(`Hello ${BRAND.name}, I want to track my order ${ord.id}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#25D366] hover:underline font-bold flex items-center gap-1 text-[11px]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Track
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ADDRESSES ================= */}
      {activeModal === 'addresses' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between bg-[#6B1518] text-white">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D3923A]" />
                <h3 className="font-serif font-bold text-base">Saved Addresses</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <button
                onClick={() => setActiveModal('addAddress')}
                className="w-full bg-[#0F172A] hover:bg-black text-white text-xs font-bold py-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Another Address</span>
              </button>

              {(!user?.addresses || user.addresses.length === 0) ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No saved addresses found. Click above to add one.
                </div>
              ) : (
                user.addresses.map((addr, idx) => (
                  <div key={idx} className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-200 space-y-1.5 text-xs relative">
                    <div className="flex justify-between items-center">
                      <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {addr.type || 'Home'}
                      </span>
                      {idx === 0 && <span className="text-[10px] text-emerald-700 font-bold">Default</span>}
                    </div>
                    <p className="font-bold text-gray-900 text-sm">{addr.name}</p>
                    <p className="text-gray-600">{addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-gray-500 font-mono">Mobile: +91 {addr.phone}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: ADD ADDRESS ================= */}
      {activeModal === 'addAddress' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-serif text-base font-bold text-[#6B1518]">Add Delivery Address</h3>
              <button onClick={() => setActiveModal('addresses')} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Recipient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lakshmi Devi"
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">10-Digit Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Flat / Door No, Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 302, Sai Residency, 4th Main Road"
                  value={newAddr.addressLine}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Area / Locality *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">6-Digit Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 500081"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, '') })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('addresses')}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-5 py-2.5 rounded-xl font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: COUPONS ================= */}
      {activeModal === 'coupons' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between bg-[#6B1518] text-white">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#D3923A]" />
                <h3 className="font-serif font-bold text-base">VIP Coupon Offers</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {coupons.filter(c => c.active).length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No coupon codes active right now. Check back during festive sales!
                </div>
              ) : (
                coupons.filter(c => c.active).map((c) => (
                  <div key={c.id || c.code} className="bg-amber-50/60 border border-dashed border-amber-300 rounded-2xl p-4 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <span className="font-mono font-extrabold text-sm text-[#6B1518] bg-white px-2 py-0.5 rounded-md border border-amber-200">
                        {c.code}
                      </span>
                      <p className="text-gray-700 font-medium">{c.description || `Get discount on orders above ₹${c.minOrder || 999}`}</p>
                      <p className="text-[10px] text-gray-500 font-bold">Min Order: ₹{c.minOrder?.toLocaleString('en-IN') || 0}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: EDIT PROFILE ================= */}
      {activeModal === 'editProfile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-serif text-base font-bold text-[#6B1518]">Edit Profile Details</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editProfileData.name}
                  onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={editProfileData.phone}
                  onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#6B1518]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-5 py-2.5 rounded-xl font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

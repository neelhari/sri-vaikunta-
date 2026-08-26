import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, Lock, CreditCard, MessageCircle, MapPin, User, Phone, Mail, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND, waLink } from '../config/brand';
import { openRazorpayCheckout } from '../lib/razorpay';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addOrder } = useStoreData();
  const { cartItems, subtotal, isFreeShipping, clearCart, appliedCoupon, discountAmount, deliveryCharge = 99 } = useCart();

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: defaultAddr?.addressLine || '',
    city: defaultAddr?.city || 'Hyderabad',
    pincode: defaultAddr?.pincode || '',
    state: defaultAddr?.state || 'Telangana',
    paymentMethod: 'upi', // 'upi' | 'cod' | 'whatsapp'
  });

  const [errors, setErrors] = useState({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-[#F8F0F0] text-[#6B1518] rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-xs text-gray-500">Please add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-[#6B1518] text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const finalDeliveryCharge = isFreeShipping ? 0 : deliveryCharge;
  const totalAmount = subtotal - discountAmount + finalDeliveryCharge;

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Enter a valid phone number';
    }
    if (!formData.address.trim()) errs.address = 'Street address is required';
    if (!formData.pincode.trim()) errs.pincode = 'Pincode is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const sendWhatsAppCopy = (orderId) => {
    let text = `*New Order ${orderId} - ${BRAND.name}*\n`;
    text += `Customer: ${formData.fullName} (${formData.phone})\n`;
    text += `Address: ${formData.address}, ${formData.city} - ${formData.pincode}, ${formData.state}\n`;
    text += `-----------------------------------\n`;
    cartItems.forEach((item, index) => {
      text += `${index + 1}. *${item.name}* (x${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
    });
    text += `-----------------------------------\n`;
    text += `*Total Amount:* ₹${totalAmount.toLocaleString('en-IN')} (${formData.paymentMethod.toUpperCase()})\n`;
    window.open(waLink(text), '_blank');
  };

  const finalizeOrder = async (orderId, paymentStatus = 'Pending', paymentDetails = null) => {
    const orderData = {
      orderId,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      customer: { ...formData },
      items: [...cartItems],
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: formData.paymentMethod,
      paymentStatus,
      paymentDetails,
    };

    const result = await addOrder({
      id: orderId,
      userId: user?.id || null,
      customerName: formData.fullName,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        selectedSize: item.selectedSize || null,
      })),
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: formData.paymentMethod.toUpperCase(),
      paymentStatus,
      status: 'Pending',
      couponCode: appliedCoupon?.code || null,
      transactionId: paymentDetails?.razorpayPaymentId || null,
    });

    setPlacingOrder(false);

    if (!result.success) {
      setOrderError(
        `We couldn't record your order automatically (${result.message || 'connection issue'}). ` +
        `Please send it via WhatsApp instead so we don't lose your order.`
      );
      return;
    }

    if (formData.paymentMethod === 'whatsapp') {
      sendWhatsAppCopy(orderId);
    }

    clearCart();
    navigate('/order-success', { state: { orderData } });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate() || placingOrder) return;

    setOrderError('');
    setPlacingOrder(true);

    const orderId = `SV-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. ONLINE RAZORPAY PAYMENT (UPI, Cards, NetBanking)
    if (formData.paymentMethod === 'upi') {
      await openRazorpayCheckout({
        orderId,
        amount: totalAmount,
        customer: formData,
        onSuccess: async (paymentResponse) => {
          await finalizeOrder(orderId, 'Paid', paymentResponse);
        },
        onFailure: (errMsg) => {
          setPlacingOrder(false);
          setOrderError(`Payment could not be completed: ${errMsg}. You can retry or choose Cash on Delivery.`);
        },
      });
      return;
    }

    // 2. CASH ON DELIVERY / WHATSAPP ORDER
    await finalizeOrder(orderId, formData.paymentMethod === 'cod' ? 'COD (Pending)' : 'WhatsApp Order');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[#6B1518] transition-colors">Home</Link>
        <span>/</span>
        <Link to="/cart" className="hover:text-[#6B1518] transition-colors">Cart</Link>
        <span>/</span>
        <span className="text-[#6B1518] font-semibold">Checkout</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D3923A]">Step 2 of 3</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5">Secure Checkout</h1>
        </div>

        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-[#6B1518] bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cart</span>
        </button>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* STEP 2: Delivery Address & Speed (Matching Reference Screenshot) */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white text-xs font-extrabold flex items-center justify-center">
                  2
                </div>
                <h2 className="font-sans text-base font-bold text-gray-900">
                  Delivery Address & Speed
                </h2>
              </div>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    navigate('/account');
                  }}
                  className="bg-[#0F172A] hover:bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-xs transition-all cursor-pointer shrink-0"
                >
                  + Add Another Address
                </button>
              )}
            </div>

            {/* Saved Address Selector (if logged in and has addresses) */}
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold text-gray-700 uppercase">
                  Select Delivery Address:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {user.addresses.map((addr, idx) => {
                    const isSelected = formData.address === addr.addressLine && formData.pincode === addr.pincode;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            fullName: addr.name || formData.fullName,
                            phone: addr.phone || formData.phone,
                            address: addr.addressLine,
                            city: addr.city || formData.city,
                            state: addr.state || formData.state,
                            pincode: addr.pincode || formData.pincode,
                          });
                        }}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all space-y-1 ${
                          isSelected
                            ? 'border-[#6B1518] bg-[#F8F0F0]/50 ring-1 ring-[#6B1518]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">{addr.name}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">
                            {addr.type || 'Home'}
                          </span>
                        </div>
                        <p className="text-gray-600 line-clamp-1">{addr.addressLine}, {addr.city}</p>
                        <p className="text-gray-500 font-mono text-[10px]">{addr.pincode}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Reference Placeholder Box */
              <div className="bg-[#F8FAFC] border border-dashed border-gray-200 rounded-2xl p-3.5 text-xs text-gray-500">
                <span className="font-bold text-gray-700 block mb-0.5">Delivery Destination:</span>
                <p className="text-[11px] text-gray-400">
                  {isAuthenticated
                    ? 'No saved addresses found. Enter delivery details below.'
                    : 'Enter your delivery details below to receive tracking updates on WhatsApp.'}
                </p>
              </div>
            )}

            {/* Input Fields Matching Screenshot */}
            <div className="space-y-3.5 pt-1">
              {/* Full Recipient Name */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Full Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full text-xs p-3.5 rounded-2xl border focus:outline-none transition-all ${
                    errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'
                  }`}
                />
                {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              {/* 10-Digit Mobile / WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  10-Digit Mobile / WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210 (10 digits)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  className={`w-full text-xs p-3.5 rounded-2xl border focus:outline-none font-mono transition-all ${
                    errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Flat / Door No, Building & Street Address */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Flat / Door No, Building & Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Flat 302, Sai Residency, 4th Main Road"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full text-xs p-3.5 rounded-2xl border focus:outline-none resize-none transition-all ${
                    errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'
                  }`}
                />
                {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
              </div>

              {/* Area / Locality & 6-Digit Pincode Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Area / Locality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Visakhapatnam"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs p-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    6-Digit Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 530041 / 560001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                    className={`w-full text-xs p-3.5 rounded-2xl border focus:outline-none font-mono transition-all ${
                      errors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'
                    }`}
                  />
                  {errors.pincode && <p className="text-[11px] text-red-500 mt-1">{errors.pincode}</p>}
                </div>
              </div>

              {/* Optional Email & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full text-xs p-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#6B1518]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Payment Method Selection */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white text-xs font-extrabold flex items-center justify-center">
                3
              </div>
              <h2 className="font-sans text-base font-bold text-gray-900">Select Payment Method</h2>
            </div>

            <div className="space-y-2.5">
              {/* UPI / Razorpay */}
              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'upi'
                    ? 'border-[#6B1518] bg-[#F8F0F0]/50 ring-1 ring-[#6B1518]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={formData.paymentMethod === 'upi'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                  className="mt-1 text-[#6B1518] focus:ring-[#6B1518]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-gray-900">UPI / QR (GPay, PhonePe, Paytm)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Fast</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Zero extra fees. Instant online confirmation.</p>
                </div>
              </label>

              {/* COD Option */}
              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'cod'
                    ? 'border-[#6B1518] bg-[#F8F0F0]/50 ring-1 ring-[#6B1518]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  className="mt-1 text-[#6B1518] focus:ring-[#6B1518]"
                />
                <div className="flex-1">
                  <span className="font-bold text-xs sm:text-sm text-gray-900">Cash on Delivery (COD)</span>
                  <p className="text-[11px] text-gray-500 mt-0.5">Pay in cash upon doorstep parcel arrival.</p>
                </div>
              </label>

              {/* WhatsApp Option */}
              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'whatsapp' })}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'whatsapp'
                    ? 'border-[#25D366] bg-emerald-50/50 ring-1 ring-[#25D366]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={formData.paymentMethod === 'whatsapp'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'whatsapp' })}
                  className="mt-1 text-[#25D366] focus:ring-[#25D366]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span className="font-bold text-xs sm:text-sm text-gray-900">WhatsApp Instant Order</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Chat directly with store owner for payment assistance.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 sticky top-24">
            <h3 className="font-sans text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5">
              Order Summary ({cartItems.length} items)
            </h3>

            {/* Product items mini list */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.itemKey} className="flex items-center gap-2.5">
                  <img src={item.image} alt={item.name} className="w-11 h-13 object-cover rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-gray-900 truncate">{item.name}</h4>
                    <span className="text-[10px] text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({appliedCoupon.code}):</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span>{isFreeShipping ? <strong className="text-emerald-600 font-bold">FREE</strong> : `₹${finalDeliveryCharge}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2.5 border-t border-gray-200">
                <span>Total Pay:</span>
                <span className="text-[#6B1518] text-lg font-extrabold">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {orderError && (
              <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl space-y-1.5">
                <p className="font-semibold">{orderError}</p>
                <button
                  type="button"
                  onClick={() => {
                    const orderId = `SV-${Math.floor(100000 + Math.random() * 900000)}`;
                    sendWhatsAppCopy(orderId);
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#25D366] text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Order via WhatsApp
                </button>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={placingOrder}
              className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[#D3923A]" />
              <span>{placingOrder ? 'Placing Order...' : `Proceed to Pay (₹${totalAmount.toLocaleString('en-IN')})`}</span>
            </button>

            <div className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Secure & Verified Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

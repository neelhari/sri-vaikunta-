import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  MessageCircle,
  ShoppingBag,
  Tag,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { BRAND, waLink } from '../config/brand';
import { openRazorpayCheckout } from '../lib/razorpay';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addOrder, coupons = [], settings } = useStoreData();
  const isCodAllowed = settings?.codEnabled !== false && settings?.enableCod !== false;
  const isWhatsappAllowed = settings?.enableWhatsappOrders !== false;
  const {
    cartItems,
    subtotal,
    isFreeShipping,
    clearCart,
    appliedCoupon,
    discountAmount,
    deliveryCharge = 99,
    applyCoupon,
    removeCoupon,
  } = useCart();

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

  const [showAddressForm, setShowAddressForm] = useState(!defaultAddr);
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [showItemsDetails, setShowItemsDetails] = useState(true);
  const [errors, setErrors] = useState({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  React.useEffect(() => {
    if (formData.paymentMethod === 'cod' && !isCodAllowed) {
      setFormData((prev) => ({ ...prev, paymentMethod: 'upi' }));
    } else if (formData.paymentMethod === 'whatsapp' && !isWhatsappAllowed) {
      setFormData((prev) => ({ ...prev, paymentMethod: 'upi' }));
    }
  }, [isCodAllowed, isWhatsappAllowed, formData.paymentMethod]);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-[#F8F0F0] text-[#6B1518] rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-xs text-gray-500">Please add sarees to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          Explore Sarees
        </button>
      </div>
    );
  }

  const finalDeliveryCharge = isFreeShipping ? 0 : deliveryCharge;
  const totalAmount = Math.max(0, subtotal - discountAmount + finalDeliveryCharge);

  const handleApplyCoupon = (e) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponFeedback({ type: 'success', message: `Code ${couponInput.toUpperCase()} applied successfully!` });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', message: res.message || 'Invalid coupon code.' });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Enter a valid 10-digit phone number';
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
      deliveryCharge: finalDeliveryCharge,
      totalAmount,
      paymentMethod: formData.paymentMethod.toUpperCase(),
      paymentStatus,
      status: 'Pending',
      couponCode: appliedCoupon?.code || null,
      transactionId: paymentDetails?.razorpayPaymentId || null,
    });

    setPlacingOrder(false);

    if (!result.success) {
      setOrderError(result.message || 'Unable to place order. Please try again.');
      return;
    }

    if (formData.paymentMethod === 'whatsapp') {
      sendWhatsAppCopy(orderId);
    }

    clearCart();
    navigate(`/order-success?id=${orderId}`);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError('');

    if (!validate()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setPlacingOrder(true);
    const orderId = `SV-${Date.now().toString().slice(-6)}`;

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
          setOrderError(`Payment failed or cancelled: ${errMsg}. You can retry or choose Cash on Delivery.`);
        },
      });
      return;
    }

    await finalizeOrder(orderId, formData.paymentMethod === 'cod' ? 'COD (Pending)' : 'WhatsApp Order');
  };

  const activeCoupons = coupons.filter((c) => c.active);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-3 px-3 sm:px-4 overflow-x-hidden">
      <div className="w-full max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between py-1">
          <h1 className="font-sans text-base font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#D3923A]" />
            <span>Secure Checkout</span>
          </h1>

          <div className="text-xs font-bold text-[#6B1518] bg-[#6B1518]/10 px-2.5 py-1 rounded-full">
            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white text-xs font-extrabold flex items-center justify-center">
                  1
                </div>
                <h2 className="font-sans text-sm font-bold text-gray-900">
                  Order Review & Promo Code
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowItemsDetails(!showItemsDetails)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {showItemsDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showItemsDetails && (
              <div className="space-y-2.5 divide-y divide-gray-100/80">
                {cartItems.map((item) => (
                  <div key={item.itemKey} className="flex items-center gap-3 pt-2 first:pt-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded-xl shrink-0 border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="text-xs font-extrabold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 space-y-2">
              <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-gray-700 uppercase">
                <Tag className="w-3.5 h-3.5 text-[#6B1518]" />
                <span>Apply Promo / Coupon Code</span>
              </label>

              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-mono font-extrabold text-xs text-emerald-800 uppercase">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[11px] text-emerald-600 ml-2 font-bold">
                        -₹{discountAmount.toLocaleString('en-IN')} Discount Applied
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponFeedback(null);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 text-xs font-bold p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER COUPON CODE"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (couponFeedback) setCouponFeedback(null);
                    }}
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B1518] uppercase font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-[#6B1518] hover:bg-[#4B0F11] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs"
                  >
                    Apply
                  </button>
                </div>
              )}

              {couponFeedback && (
                <p className={`text-[11px] font-medium ${couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {couponFeedback.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white text-xs font-extrabold flex items-center justify-center">
                  2
                </div>
                <h2 className="font-sans text-sm font-bold text-gray-900">
                  Delivery Address & Speed
                </h2>
              </div>
              {isAuthenticated && user?.addresses && user.addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="bg-[#0F172A] hover:bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  {showAddressForm ? 'Select Saved Address' : '+ Add New Address'}
                </button>
              )}
            </div>

            {!showAddressForm && user?.addresses && user.addresses.length > 0 ? (
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold text-gray-700 uppercase">
                  Delivering to:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {user.addresses.map((addr, idx) => {
                    const isSelected = formData.address === addr.addressLine && formData.pincode === addr.pincode;
                    return (
                      <div
                        key={idx}
                        onClick={() => setFormData({ ...formData, address: addr.addressLine, pincode: addr.pincode, city: addr.city, state: addr.state })}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all space-y-1 ${
                          isSelected ? 'border-[#6B1518] bg-[#F8F0F0]/50 ring-1 ring-[#6B1518]' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">{addr.name}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">{addr.type || 'Home'}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{addr.addressLine}, {addr.city}</p>
                        <p className="text-gray-500 font-mono text-[11px]">Pin: {addr.pincode} • Phone: +91 {addr.phone}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Full Recipient Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. Customer Name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className={`w-full text-xs p-3 rounded-2xl border ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'}`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">10-Digit Mobile / WhatsApp Number <span className="text-red-500">*</span></label>
                  <input type="tel" placeholder="e.g. 9876543210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} className={`w-full text-xs p-3 rounded-2xl border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'}`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Flat / Door No, Building & Street Address <span className="text-red-500">*</span></label>
                  <textarea rows={2} placeholder="e.g. Flat 302, Sai Residency" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`w-full text-xs p-3 rounded-2xl border ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'}`} />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">Area / Locality <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="e.g. Visakhapatnam" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full text-xs p-3 rounded-2xl border border-gray-200 focus:border-[#6B1518]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">6-Digit Pincode <span className="text-red-500">*</span></label>
                    <input type="text" maxLength={6} placeholder="e.g. 530041" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })} className={`w-full text-xs p-3 rounded-2xl border ${errors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#6B1518]'}`} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white text-xs font-extrabold flex items-center justify-center">3</div>
              <h2 className="font-sans text-sm font-bold text-gray-900">Select Payment Method</h2>
            </div>
            <div className="space-y-2">
              {/* Option 1: Instant UPI / QR */}
              <label onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })} className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${formData.paymentMethod === 'upi' ? 'border-[#6B1518] bg-[#F8F0F0]/50 ring-1 ring-[#6B1518]' : 'border-gray-200'}`}>
                <input type="radio" name="paymentMethod" checked={formData.paymentMethod === 'upi'} onChange={() => setFormData({ ...formData, paymentMethod: 'upi' })} className="mt-1 text-[#6B1518]" />
                <div className="flex-1">
                  <div className="flex items-center justify-between"><span className="font-bold text-xs text-gray-900">Instant UPI / QR</span><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Fast</span></div>
                  <p className="text-[11px] text-gray-500">Zero extra fees. Instant confirmation.</p>
                </div>
              </label>

              {/* Option 2: Cash on Delivery (COD) */}
              {isCodAllowed ? (
                <label onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })} className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-[#6B1518] bg-[#F8F0F0]/50 ring-1 ring-[#6B1518]' : 'border-gray-200'}`}>
                  <input type="radio" name="paymentMethod" checked={formData.paymentMethod === 'cod'} onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })} className="mt-1 text-[#6B1518]" />
                  <div className="flex-1">
                    <span className="font-bold text-xs text-gray-900">Cash on Delivery (COD)</span>
                    <p className="text-[11px] text-gray-500">Pay in cash on delivery.</p>
                  </div>
                </label>
              ) : (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 bg-gray-50/70 opacity-60 cursor-not-allowed">
                  <input type="radio" name="paymentMethod" disabled checked={false} className="mt-1 text-gray-400 cursor-not-allowed" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-500">Cash on Delivery (COD)</span>
                      <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">Unavailable</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Temporarily disabled for new orders.</p>
                  </div>
                </div>
              )}

              {/* Option 3: WhatsApp Order */}
              {isWhatsappAllowed ? (
                <label onClick={() => setFormData({ ...formData, paymentMethod: 'whatsapp' })} className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${formData.paymentMethod === 'whatsapp' ? 'border-[#25D366] bg-emerald-50/50 ring-1 ring-[#25D366]' : 'border-gray-200'}`}>
                  <input type="radio" name="paymentMethod" checked={formData.paymentMethod === 'whatsapp'} onChange={() => setFormData({ ...formData, paymentMethod: 'whatsapp' })} className="mt-1 text-[#25D366]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span className="font-bold text-xs text-gray-900">WhatsApp Order</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Chat for custom requests.</p>
                  </div>
                </label>
              ) : (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 bg-gray-50/70 opacity-60 cursor-not-allowed">
                  <input type="radio" name="paymentMethod" disabled checked={false} className="mt-1 text-gray-400 cursor-not-allowed" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-bold text-xs text-gray-500">WhatsApp Order</span>
                      </div>
                      <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">Unavailable</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Direct WhatsApp ordering is currently offline.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
              <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span></div>
              {appliedCoupon && (<div className="flex justify-between text-emerald-600 font-semibold"><span>Discount:</span><span>-₹{discountAmount.toLocaleString('en-IN')}</span></div>)}
              <div className="flex justify-between"><span>Delivery:</span><span>{isFreeShipping ? <strong className="text-emerald-600 font-bold">FREE</strong> : `₹${finalDeliveryCharge}`}</span></div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2.5 border-t border-gray-200"><span>Grand Total:</span><span className="text-[#6B1518] text-lg font-extrabold">₹{totalAmount.toLocaleString('en-IN')}</span></div>
            </div>
            {orderError && (<div className="text-[11px] text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">{orderError}</div>)}
            <button type="submit" disabled={placingOrder} className="w-full bg-[#6B1518] hover:bg-[#4B0F11] disabled:opacity-60 text-white py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-2">
              <Lock className="w-4 h-4" /><span>{placingOrder ? 'Processing...' : `Confirm & Pay ₹${totalAmount.toLocaleString('en-IN')}`}</span>
            </button>
            <div className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1 pt-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /><span>100% Secure Checkout</span></div>
          </div>
        </form>
      </div>
    </div>
  );
}

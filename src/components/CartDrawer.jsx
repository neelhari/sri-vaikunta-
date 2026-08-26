import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, MessageCircle, Truck, Sparkles, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BRAND, waLink } from '../config/brand';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    isFreeShipping,
    amountNeededForFreeShipping,
    freeShippingThreshold = 2000,
    deliveryCharge = 99,
    clearCart,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const result = applyCoupon(couponInput);
    if (result.success) {
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError(result.message);
    }
  };

  const finalTotal = subtotal - discountAmount;

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    let text = `*New Inquiry / Order from ${BRAND.name}*\n`;
    text += `---------------------------------\n`;
    cartItems.forEach((item, i) => {
      text += `${i + 1}. *${item.name}*\n`;
      text += `   Qty: ${item.quantity} | Price: ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
    });
    text += `---------------------------------\n`;
    text += `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
    if (appliedCoupon) {
      text += `*Discount (${appliedCoupon.code}):* -₹${discountAmount.toLocaleString('en-IN')}\n`;
    }
    text += `*Delivery:* ${isFreeShipping ? 'FREE' : `₹${deliveryCharge}`}\n`;
    text += `*Estimated Total:* ₹${(finalTotal + deliveryCharge).toLocaleString('en-IN')}\n\n`;
    text += `Please confirm my order and share payment details. Thank you!`;

    window.open(waLink(text), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-[#6B1518] text-white p-4 px-6 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D3923A]" />
              <h3 className="font-serif text-lg font-bold">Your Shopping Cart</h3>
              <span className="bg-[#D3923A] text-[#6B1518] text-[11px] font-bold px-2 py-0.5 rounded-full ml-1">
                {cartItems.length} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#F8F0F0] p-3 px-5 border-b border-[#EADEDF] text-xs text-[#6B1518]">
            {isFreeShipping ? (
              <div className="flex items-center gap-2 font-bold text-emerald-700">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>🎉 You qualify for FREE Shipping!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span>Add <strong>₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more for FREE shipping</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}/₹{freeShippingThreshold.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#6B1518] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h4 className="font-serif text-xl font-bold text-gray-800">Your cart is empty</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Explore our collections to discover beautiful products.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="bg-[#6B1518] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#4B0F11] transition-all cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.itemKey} className="pt-3 first:pt-0 flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-20 object-cover rounded-lg border border-gray-100 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                          <span className="text-[10px] text-[#D3923A] font-semibold uppercase block">{item.fabric || item.category}</span>
                          <span className="text-[10px] text-gray-400 block font-medium">{item.selectedSize}</span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.itemKey)}
                          className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-extrabold text-[#6B1518]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer / Summary */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 bg-[#FAF5EE]/70 p-4 space-y-3">
              <div className="flex items-center justify-end">
                <button
                  onClick={clearCart}
                  className="text-[11px] text-gray-400 hover:text-red-600 underline"
                >
                  Clear Cart
                </button>
              </div>

              {/* Promo Code Input */}
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER PROMO CODE"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#6B1518] uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied!</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-gray-400 hover:text-red-600 text-[11px] underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && (
                <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded">
                  {couponError}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-semibold">{isFreeShipping ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Amount:</span>
                  <span className="text-[#6B1518] text-lg font-extrabold">
                    ₹{(finalTotal + (isFreeShipping ? 0 : deliveryCharge)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    if (!isAuthenticated) {
                      openLoginModal('/checkout');
                    } else {
                      navigate('/checkout');
                    }
                  }}
                  className="w-full bg-[#6B1518] hover:bg-[#4B0F11] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Proceed to Online Checkout</span>
                </button>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order via WhatsApp</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/cart');
                    }}
                    className="text-xs font-semibold text-gray-600 hover:text-[#6B1518] underline"
                  >
                    View Full Cart Page →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

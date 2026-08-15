import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, MessageCircle, Phone, Mail, MapPin, ShoppingBag, ChevronRight, Trash2, BookOpen } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { BRAND, waLink } from '../config/brand';

function MenuRow({ icon: Icon, label, sub, badge, onClick, external }) {
  const Wrapper = external ? 'a' : 'button';
  return (
    <Wrapper
      {...(external ? { href: onClick, target: '_blank', rel: 'noreferrer' } : { onClick })}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#FAF8F5] transition-colors"
    >
      <div className="w-9 h-9 rounded-full bg-[#F8F0F0] flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-[#6B1518]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {sub && <p className="text-xs text-gray-500 truncate">{sub}</p>}
      </div>
      {badge != null && badge > 0 && (
        <span className="bg-[#6B1518] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
          {badge}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
    </Wrapper>
  );
}

export default function AccountPage() {
  const navigate = useNavigate();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlistRef = useRef(null);

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 px-4 sm:px-6 lg:px-8 pt-4 pb-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[#6B1518] transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-[#6B1518] font-semibold">Account</span>
      </nav>

      {/* Profile header */}
      <section className="bg-[#6B1518] mx-4 sm:mx-6 lg:mx-8 rounded-2xl p-5 sm:p-6 text-white flex items-center gap-4 shadow-lg">
        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          <User className="w-7 h-7 text-[#D3923A]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-lg sm:text-xl font-bold">Hello, Guest</h1>
          <p className="text-gray-200 text-xs mt-0.5 leading-relaxed">
            Sign-in is coming soon. Your wishlist is saved on this device; orders are placed over WhatsApp.
          </p>
        </div>
      </section>

      {/* Menu row list */}
      <section className="mx-4 sm:mx-6 lg:mx-8 mt-4 bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
        <MenuRow
          icon={ShoppingBag}
          label="Shopping Cart"
          sub="Review items & checkout"
          onClick={() => navigate('/cart')}
        />
        <MenuRow
          icon={Heart}
          label="My Saved Wishlist"
          sub={wishlistItems.length === 0 ? 'Nothing saved yet' : `${wishlistItems.length} item${wishlistItems.length > 1 ? 's' : ''} saved`}
          badge={wishlistItems.length}
          onClick={() => navigate('/wishlist')}
        />
        <MenuRow
          icon={BookOpen}
          label="FAQs & Customer Support"
          sub="Common questions & answers"
          onClick={() => navigate('/faqs')}
        />
        <MenuRow
          icon={MessageCircle}
          label="Track an Order"
          sub="Check status on WhatsApp"
          onClick={waLink(`Hello ${BRAND.name}, I'd like to check the status of my order.`)}
          external
        />
        <MenuRow
          icon={Phone}
          label="Call Support"
          sub={`+91 ${BRAND.phone}`}
          onClick={`tel:${BRAND.phone}`}
          external
        />
        <MenuRow
          icon={MapPin}
          label="Visit Our Store"
          sub={BRAND.address.city}
          onClick={() => navigate('/contact')}
        />
        <MenuRow
          icon={BookOpen}
          label="Our Story"
          sub={`About ${BRAND.name}`}
          onClick={() => navigate('/our-story')}
        />
      </section>

      {/* Wishlist */}
      <section ref={wishlistRef} className="mx-4 sm:mx-6 lg:mx-8 mt-8 space-y-4 scroll-mt-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-[#6B1518]" />
          <h2 className="font-serif text-xl font-bold text-gray-900">My Wishlist</h2>
          <span className="bg-[#F8F0F0] text-[#6B1518] text-xs font-bold px-2 py-0.5 rounded-full">
            {wishlistItems.length}
          </span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12 bg-[#FAF8F5] rounded-2xl border border-gray-100 space-y-3">
            <Heart className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500">You haven't saved anything yet.</p>
            <button
              onClick={() => navigate('/shop')}
              className="text-xs font-bold text-[#6B1518] hover:underline"
            >
              Browse the catalog →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                <div
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="relative aspect-4/5 cursor-pointer"
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2.5 space-y-1">
                  <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                  <div className="text-xs font-bold text-[#6B1518]">₹{item.price.toLocaleString('en-IN')}</div>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full mt-1 bg-[#F8F0F0] hover:bg-[#6B1518] hover:text-white text-[#6B1518] text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    <ShoppingBag className="w-3 h-3" /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

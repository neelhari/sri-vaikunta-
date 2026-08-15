import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, MessageCircle, Check, ShieldCheck, Truck, ChevronRight, ChevronDown, MapPin, Plus, RotateCcw, Award } from 'lucide-react';
import { products } from '../data/products';
import { categories } from '../data/categories';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { BRAND, waLink } from '../config/brand';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const product = products.find((p) => p.id === id);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const galleryRef = useRef(null);

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Product not found</h1>
        <p className="text-gray-500 text-sm">This item may have been removed or the link is incorrect.</p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-[#6B1518] hover:bg-[#4B0F11] text-white px-6 py-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-2"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const categoryMeta = categories.find((c) => c.id === product.category);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity, null, selectedSize);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, null, selectedSize);
    navigate('/checkout');
  };

  const handleBuyWhatsApp = () => {
    const msg = `Hello ${BRAND.name}, I would like to order "${product.name}" (Qty: ${quantity}, Price: ₹${product.price * quantity}). Please guide me with payment and delivery.`;
    window.open(waLink(msg), '_blank');
  };

  const handleGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveImage(idx);
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.trim().length >= 6) {
      setDeliveryEstimate(`Standard Delivery by 3-5 Days to ${pincode}`);
    } else {
      setDeliveryEstimate('Please enter a valid 6-digit Pincode.');
    }
  };

  return (
    <div className="pb-28 xl:pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-3 pb-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[#6B1518] transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <Link to="/shop" className="hover:text-[#6B1518] transition-colors">Shop</Link>
        {categoryMeta && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <Link to={`/shop?category=${categoryMeta.id}`} className="hover:text-[#6B1518] transition-colors">
              {categoryMeta.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-[#6B1518] font-semibold line-clamp-1">{product.name}</span>
      </nav>

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 lg:gap-12">
          {/* 1. Image Gallery */}
          <div>
            <div className="relative">
              <div
                ref={galleryRef}
                onScroll={handleGalleryScroll}
                className="flex overflow-x-auto snap-x snap-mandatory hide-scroll aspect-[4/5] md:rounded-2xl md:overflow-hidden bg-[#FAF5EE]"
              >
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover shrink-0 snap-start"
                  />
                ))}
              </div>

              {/* Discount Badge */}
              {product.discount && (
                <span className="absolute top-3 left-3 bg-[#6B1518] text-white font-extrabold text-xs px-2.5 py-1 rounded shadow-xs">
                  {product.discount}
                </span>
              )}

              {/* Wishlist Heart Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
                  isLiked ? 'bg-white text-red-500' : 'bg-white/90 text-gray-600 hover:text-red-500'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-red-500' : ''}`} />
              </button>

              {images.length > 1 && (
                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                  {activeImage + 1} / {images.length}
                </span>
              )}
            </div>

            {/* Desktop Thumbnails */}
            {images.length > 1 && (
              <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 mt-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImage(idx);
                      galleryRef.current?.scrollTo({ left: idx * galleryRef.current.clientWidth, behavior: 'smooth' });
                    }}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === idx ? 'border-[#6B1518]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Product Information Details */}
          <div className="space-y-4 px-4 sm:px-0 pt-4 md:pt-0">
            <div>
              <span className="text-[10px] tracking-widest font-bold text-[#D3923A] uppercase">
                {product.brand || BRAND.name.toUpperCase()}
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 leading-snug mt-0.5">
                {product.name}
              </h1>
            </div>

            {/* Ratings & Stock Status */}
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                {product.rating || '4.8'} <Star className="w-3 h-3 fill-white" />
              </span>
              <span className="text-gray-500 font-medium">{product.reviewsCount || 12} Ratings</span>
              <span className="text-gray-300">|</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <Check className="w-3.5 h-3.5" /> In Stock
              </span>
            </div>

            {/* Price Row */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-gray-400 line-through font-medium">
                    ₹{product.oldPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discount && (
                  <span className="text-sm text-emerald-600 font-extrabold">{product.discount}</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Inclusive of all taxes</p>
            </div>

            {/* Sizes (if available) */}
            {product.sizes && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-extrabold text-gray-900 uppercase">Select Size</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 rounded-xl text-xs font-bold border transition-colors ${
                        selectedSize === size
                          ? 'bg-[#6B1518] text-white border-[#6B1518] shadow-sm'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-[#6B1518]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-1">
              <label className="text-xs font-extrabold text-gray-900 uppercase">Quantity</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-sm"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-bold text-sm text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Desktop Action Buttons (Myntra UI style) */}
            <div className="hidden xl:flex flex-col gap-2.5 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 border-2 border-[#6B1518] text-[#6B1518] hover:bg-[#6B1518] hover:text-white py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-2xs transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>BUY NOW</span>
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#6B1518] hover:bg-[#4B0F11] text-white py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD TO CART</span>
                </button>
              </div>
              <button
                onClick={handleBuyWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order Directly via WhatsApp (+91 {BRAND.phone})</span>
              </button>
            </div>

            {/* 3. Delivery & Services Card (Myntra UI Reference) */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#6B1518]" />
                  Delivery & Services
                </span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200">
                <input
                  type="text"
                  placeholder="Enter Pincode (e.g. 533101)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="text-xs px-2.5 py-1 w-full bg-transparent border-none focus:outline-none text-gray-800"
                />
                <button type="submit" className="text-xs font-bold text-[#6B1518] hover:underline px-3 py-1 shrink-0">
                  Check
                </button>
              </form>
              {deliveryEstimate && (
                <p className="text-[11px] font-semibold text-[#6B1518] px-1">{deliveryEstimate}</p>
              )}

              <div className="space-y-2 text-xs text-gray-600 pt-1">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fast Standard Delivery in 3-5 Days (Express Shipping)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pay on Delivery (Cash / UPI on Delivery Available)</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hassle-Free 7 Days Return & Exchange Policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Handpicked Quality Inspected</span>
                </div>
              </div>
            </div>

            {/* 4. Product Specifications Grid (Myntra UI Reference) */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-gray-100 space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-gray-900 tracking-wider">Product Specifications</h3>
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-gray-200/60 pt-2.5">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Fabric / Material</span>
                  <span className="font-bold text-gray-800">{product.fabric || "Banarasi Tissue / Pure Silk"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Weave / Work</span>
                  <span className="font-bold text-gray-800">Traditional Handloom Zari Work</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Occasion</span>
                  <span className="font-bold text-gray-800">Festive, Wedding & Occasion Wear</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Care Instructions</span>
                  <span className="font-bold text-gray-800">Dry Clean Only</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Authenticity</span>
                  <span className="font-bold text-gray-800">100% Quality Inspected</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Origin</span>
                  <span className="font-bold text-gray-800">Rajahmundry, Andhra Pradesh</span>
                </div>
              </div>
            </div>

            {/* Product Details Accordion */}
            <div className="border-t border-gray-100 pt-1">
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <span className="text-xs font-extrabold uppercase text-gray-900 tracking-wider">Detailed Description</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
              </button>
              {detailsOpen && (
                <div className="pb-4 space-y-2 text-xs text-gray-600 leading-relaxed">
                  <p>{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. You May Also Like Section */}
        {related.length > 0 && (
          <section className="pt-10 mt-8 border-t border-gray-100 space-y-6 px-4 sm:px-0" data-aos="fade-up">
            <div className="text-center space-y-1 max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-2">
                <span className="w-8 sm:w-16 h-px bg-gradient-to-r from-transparent to-[#D3923A]"></span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#D3923A]">Curated Picks</span>
                <span className="w-8 sm:w-16 h-px bg-gradient-to-l from-transparent to-[#D3923A]"></span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#6B1518]">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 6. High-Priority Mobile Bottom Sticky Action Bar (Buy Now + Add to Cart) */}
      <div className="xl:hidden fixed bottom-14 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-2.5 flex items-center gap-2 shadow-[0_-4px_15px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => toggleWishlist(product)}
          className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center transition-colors ${
            isLiked ? 'bg-red-50 text-red-500 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}
          title="Wishlist"
        >
          <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-red-500' : ''}`} />
        </button>

        <button
          onClick={handleBuyNow}
          className="flex-1 border-2 border-[#6B1518] text-[#6B1518] active:bg-[#6B1518] active:text-white h-10.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all"
        >
          <span>Buy Now</span>
        </button>

        <button
          onClick={handleAddToCart}
          className="flex-1 bg-[#6B1518] active:bg-[#4B0F11] text-white h-10.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow-md transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </button>

        <button
          onClick={handleBuyWhatsApp}
          className="w-10 h-10 shrink-0 bg-[#25D366] active:bg-[#128C7E] text-white rounded-xl flex items-center justify-center shadow-xs"
          title="Order via WhatsApp"
        >
          <MessageCircle className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}

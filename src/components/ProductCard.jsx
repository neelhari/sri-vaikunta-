import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { BRAND } from '../config/brand';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = isInWishlist(product.id);

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full cursor-pointer relative"
    >
      {/* Image Box */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
        />

        {/* NEW Badge */}
        {product.isNew && (
          <span className="absolute top-2 left-2 z-10 bg-[#6B1518] text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded shadow-xs">
            NEW
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2 right-2 w-7.5 h-7.5 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center z-10 shadow-sm transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500' : ''}`} />
        </button>

        {/* Discount Badge */}
        {product.discount && (
          <span className="absolute bottom-2 right-2 z-10 bg-[#6B1518] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
            {product.discount}
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="pt-2.5 flex flex-col gap-1 flex-1 justify-between">
        <div>
          <span className="text-[9px] tracking-widest font-bold text-[#D3923A] uppercase block">
            {product.subcategory || product.category || BRAND.name.toUpperCase()}
          </span>

          <h3 className="text-xs sm:text-sm font-serif font-bold text-gray-900 line-clamp-1 group-hover:text-[#6B1518] transition-colors mt-0.5">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-gray-500 text-[10px] font-semibold">({product.reviewsCount || 12})</span>
          </div>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-gray-50 mt-1">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5 min-w-0">
            <span className="text-xs sm:text-base font-extrabold text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.oldPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                ₹{product.oldPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="shrink-0 bg-[#6B1518] hover:bg-[#4B0F11] text-white text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

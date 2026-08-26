import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  ShoppingBag,
  Boxes,
  Grid,
  ShoppingCart,
  Tag,
  Truck,
  ExternalLink,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { BRAND } from '../config/brand';

export default function AdminSidebar({ onClose }) {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'Hero Banners & Sliders', icon: Layers, path: '/admin/banners' },
    { label: 'Products & Catalogue', icon: ShoppingBag, path: '/admin/products' },
    { label: 'Stock & Inventory', icon: Boxes, path: '/admin/inventory' },
    { label: 'Categories & Weaves', icon: Grid, path: '/admin/categories' },
    { label: 'Customer Orders', icon: ShoppingCart, path: '/admin/orders' },
    { label: 'Coupons & Discounts', icon: Tag, path: '/admin/coupons' },
    { label: 'Shipping & Store Settings', icon: Truck, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('sv_admin_auth');
    navigate('/admin/login');
  };

  return (
    <aside className="w-72 bg-[#530E14] text-white flex flex-col h-full shadow-2xl border-r border-[#6B1518]">
      {/* Brand Header Matching Screenshot 3 */}
      <div className="p-5 border-b border-[#6B1518]/60 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-full bg-[#FAF5EE] ring-2 ring-[#D3923A]/70 flex items-center justify-center overflow-hidden p-1 shadow-md shrink-0">
          <img src="/logo-icon.png" alt={BRAND.name} className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-base font-extrabold tracking-wider text-white uppercase leading-tight truncate">
            {BRAND.name}
          </h2>
          <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#D3923A] block mt-0.5">
            MANAGEMENT CENTER
          </span>
        </div>
      </div>

      {/* Single Navigation List Matching Screenshot 3 */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 hide-scroll">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E3A33E] text-[#4A0A0E] shadow-lg font-extrabold'
                    : 'text-gray-200 hover:bg-[#6B1518] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#4A0A0E]' : 'text-gray-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-[#4A0A0E] shrink-0" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Matching Screenshot 3 */}
      <div className="p-4 border-t border-[#6B1518]/60 space-y-3 bg-[#420B10]">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="w-full bg-[#530E14] hover:bg-[#6B1518] border border-[#6B1518] text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#D3923A]" />
          <span>Open Customer Store</span>
        </a>

        <div className="flex items-center justify-between pt-1">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[11px] font-bold text-gray-200 truncate">srivaikunta@gmail.com</p>
            <p className="text-[9px] text-[#D3923A] font-semibold">Super Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

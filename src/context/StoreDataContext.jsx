import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';
import { categories as initialCategories } from '../data/categories';
import { BRAND } from '../config/brand';
import { supabase } from '../lib/supabase';

const StoreDataContext = createContext();

const INITIAL_BANNERS = [
  { id: 'b1', title: 'Banarasi Silk Sarees', image: '/slider/image copy 2.png', active: true, link: '/shop?category=sarees' },
  { id: 'b2', title: 'Festive Dress Collection', image: '/slider/image copy 3.png', active: true, link: '/shop?category=dresses' },
];

const INITIAL_COUPONS = [
  { id: 'c1', code: 'AV10', type: 'percentage', discountValue: 10, minOrder: 1999, active: true, maxDiscount: 500 },
  { id: 'c2', code: 'WELCOME500', type: 'fixed', discountValue: 500, minOrder: 2999, active: true },
];

const INITIAL_SETTINGS = {
  storeName: BRAND.name,
  phone: BRAND.phone,
  email: BRAND.email,
  whatsapp: BRAND.phone,
  ownerName: BRAND.ownerFullName,
  address: BRAND.address.full,
  freeShippingThreshold: BRAND.freeShippingThreshold,
  gstin: '37AAAAA0000A1Z5',
  currency: '₹',
};

const INITIAL_ORDERS = [
  {
    id: 'AV-100241',
    customerName: 'Ananya Sharma',
    customerPhone: '9876543210',
    customerEmail: 'ananya@example.com',
    address: 'Flat 402, Lotus Apartments, Rajahmundry',
    date: '2026-08-14',
    totalAmount: 2499,
    itemsCount: 1,
    status: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    items: [{ id: 'p1', name: 'Mulchanderi 3 Piece Dress With Embroidery - A Line', price: 2499, quantity: 1 }],
  },
  {
    id: 'AV-100242',
    customerName: 'Priya Reddy',
    customerPhone: '9123456789',
    customerEmail: 'priya@example.com',
    address: 'Door 12-3-4, Main Road, Kakinada',
    date: '2026-08-15',
    totalAmount: 3499,
    itemsCount: 1,
    status: 'Confirmed',
    paymentStatus: 'Pending',
    paymentMethod: 'Cash on Delivery',
    items: [{ id: 'p5', name: 'Banarasi Tissue Saree', price: 3499, quantity: 1 }],
  },
];

export function StoreDataProvider({ children }) {
  // Load state from LocalStorage fallback or defaults
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('av_store_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('av_store_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [banners, setBanners] = useState(() => {
    const saved = localStorage.getItem('av_store_banners');
    return saved ? JSON.parse(saved) : INITIAL_BANNERS;
  });

  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('av_store_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('av_store_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('av_store_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('av_store_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('av_store_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('av_store_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('av_store_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('av_store_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('av_store_settings', JSON.stringify(settings));
  }, [settings]);

  // Product CRUD
  const addProduct = (newProduct) => {
    const p = {
      ...newProduct,
      id: newProduct.id || `p-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      inStock: newProduct.stock > 0,
    };
    setProducts((prev) => [p, ...prev]);
    return p;
  };

  const updateProduct = (id, updatedData) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData, inStock: (updatedData.stock ?? p.stock) > 0 } : p))
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Category CRUD
  const addCategory = (newCat) => {
    const c = { ...newCat, id: newCat.id || `cat-${Date.now()}`, active: true };
    setCategories((prev) => [...prev, c]);
  };

  const updateCategory = (id, updatedData) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c)));
  };

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Order Operations
  const addOrder = (orderData) => {
    const newOrd = {
      ...orderData,
      id: orderData.id || `AV-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    setOrders((prev) => [newOrd, ...prev]);
    return newOrd;
  };

  const updateOrderStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  // Banner Operations
  const addBanner = (banner) => {
    const b = { ...banner, id: `b-${Date.now()}`, active: true };
    setBanners((prev) => [...prev, b]);
  };

  const updateBanner = (id, updated) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBanner = (id) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  // Coupon Operations
  const addCoupon = (coupon) => {
    const c = { ...coupon, id: `c-${Date.now()}`, active: true };
    setCoupons((prev) => [...prev, c]);
  };

  const updateCoupon = (id, updated) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCoupon = (id) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  // Settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <StoreDataContext.Provider
      value={{
        products,
        categories,
        banners,
        coupons,
        orders,
        settings,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addOrder,
        updateOrderStatus,
        addBanner,
        updateBanner,
        deleteBanner,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        updateSettings,
      }}
    >
      {children}
    </StoreDataContext.Provider>
  );
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error('useStoreData must be used within a StoreDataProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchProducts, insertProduct, updateProductInDb, deleteProductFromDb,
  fetchCategories, insertCategory, updateCategoryInDb, deleteCategoryFromDb,
  fetchBanners, insertBanner, updateBannerInDb, deleteBannerFromDb,
  fetchCoupons, insertCoupon, updateCouponInDb, deleteCouponFromDb,
  fetchOrders, saveOrderToSupabase, updateOrderStatusInDb,
  fetchContactMessages, updateMessageStatusInDb,
  fetchSettings, updateSettingsInDb,
} from '../lib/supabase';
import { categories as defaultCategories } from '../data/categories';
import { products as defaultProducts } from '../data/products';
import { BRAND } from '../config/brand';

const StoreDataContext = createContext();

export function StoreDataProvider({ children }) {
  const [products, setProducts] = useState(defaultProducts);
  const [categories, setCategories] = useState(defaultCategories);
  const [banners, setBanners] = useState([
    { id: 'sv-ban-1', image: '/brand-splash-logo.jpg', active: true, title: BRAND.fullName }
  ]);
  const [coupons, setCoupons] = useState([
    { id: 'cpn-1', code: 'SV10', type: 'percentage', discountValue: 10, minOrder: 1500, active: true }
  ]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState({
    storeName: BRAND.fullName,
    phone: BRAND.phone,
    email: BRAND.email,
    whatsapp: BRAND.whatsappNumber,
    ownerName: 'Sri Vaikunta Sarees',
    address: BRAND.address.full,
    freeShippingThreshold: BRAND.freeShippingThreshold,
    gstin: '',
    currency: '₹',
  });
  const [loading, setLoading] = useState(false);

  // Initial load — public-readable data from cloud if available
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [p, c, b, cp, s] = await Promise.all([
          fetchProducts(), fetchCategories(), fetchBanners(), fetchCoupons(), fetchSettings(),
        ]);
        if (!active) return;
        if (p.success && p.data && p.data.length > 5) setProducts(p.data);
        if (c.success && c.data && c.data.length > 5) setCategories(c.data);
        if (b.success && b.data && b.data.length > 0) setBanners(b.data);
        if (cp.success && cp.data && cp.data.length > 0) setCoupons(cp.data);
        if (s.success && s.data && s.data.storeName) setSettings(s.data);
      } catch (err) {
        console.warn('Store data fetch fallback:', err);
      }
    })();
    return () => { active = false; };
  }, []);

  // Orders & contact messages are admin-only
  const refreshOrders = useCallback(async () => {
    const res = await fetchOrders();
    if (res.success) setOrders(res.data);
    return res;
  }, []);

  const refreshMessages = useCallback(async () => {
    const res = await fetchContactMessages();
    if (res.success) setMessages(res.data);
    return res;
  }, []);

  // ---------------- Products ----------------
  const addProduct = async (newProduct) => {
    const res = await insertProduct(newProduct);
    if (res.success) setProducts((prev) => [res.data, ...prev]);
    else setProducts((prev) => [{ ...newProduct, id: `sv_${Date.now()}` }, ...prev]);
    return res;
  };

  const updateProduct = async (id, updatedData) => {
    const res = await updateProductInDb(id, updatedData);
    if (res.success) setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    else setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p)));
    return res;
  };

  const deleteProduct = async (id) => {
    const res = await deleteProductFromDb(id);
    if (res.success) setProducts((prev) => prev.filter((p) => p.id !== id));
    else setProducts((prev) => prev.filter((p) => p.id !== id));
    return res;
  };

  // ---------------- Categories ----------------
  const addCategory = async (newCat) => {
    const res = await insertCategory(newCat);
    if (res.success) setCategories((prev) => [...prev, res.data]);
    else setCategories((prev) => [...prev, newCat]);
    return res;
  };

  const updateCategory = async (id, updatedData) => {
    const res = await updateCategoryInDb(id, updatedData);
    if (res.success) setCategories((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    else setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c)));
    return res;
  };

  const deleteCategory = async (id) => {
    const res = await deleteCategoryFromDb(id);
    if (res.success) setCategories((prev) => prev.filter((c) => c.id !== id));
    else setCategories((prev) => prev.filter((c) => c.id !== id));
    return res;
  };

  // ---------------- Banners ----------------
  const addBanner = async (newBanner) => {
    const res = await insertBanner(newBanner);
    if (res.success) setBanners((prev) => [...prev, res.data]);
    else setBanners((prev) => [...prev, { ...newBanner, id: `ban_${Date.now()}` }]);
    return res;
  };

  const updateBanner = async (id, updatedData) => {
    const res = await updateBannerInDb(id, updatedData);
    if (res.success) setBanners((prev) => prev.map((b) => (b.id === id ? res.data : b)));
    else setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updatedData } : b)));
    return res;
  };

  const deleteBanner = async (id) => {
    const res = await deleteBannerFromDb(id);
    if (res.success) setBanners((prev) => prev.filter((b) => b.id !== id));
    else setBanners((prev) => prev.filter((b) => b.id !== id));
    return res;
  };

  // ---------------- Coupons ----------------
  const addCoupon = async (newCoupon) => {
    const res = await insertCoupon(newCoupon);
    if (res.success) setCoupons((prev) => [...prev, res.data]);
    else setCoupons((prev) => [...prev, { ...newCoupon, id: `cpn_${Date.now()}` }]);
    return res;
  };

  const updateCoupon = async (id, updatedData) => {
    const res = await updateCouponInDb(id, updatedData);
    if (res.success) setCoupons((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    else setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c)));
    return res;
  };

  const deleteCoupon = async (id) => {
    const res = await deleteCouponFromDb(id);
    if (res.success) setCoupons((prev) => prev.filter((c) => c.id !== id));
    else setCoupons((prev) => prev.filter((c) => c.id !== id));
    return res;
  };

  // ---------------- Orders ----------------
  const addOrder = async (orderData) => {
    const res = await saveOrderToSupabase(orderData);
    if (res.success) setOrders((prev) => [res.data, ...prev]);
    return res;
  };

  const updateOrderStatus = async (id, newStatus) => {
    const res = await updateOrderStatusInDb(id, newStatus);
    if (res.success) setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    return res;
  };

  // ---------------- Settings ----------------
  const updateSettings = async (newSettings) => {
    const res = await updateSettingsInDb(newSettings);
    if (res.success && res.data) setSettings(res.data);
    else setSettings((prev) => ({ ...prev, ...newSettings }));
    return res;
  };

  return (
    <StoreDataContext.Provider
      value={{
        products,
        categories,
        banners,
        coupons,
        orders,
        messages,
        settings,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addBanner,
        updateBanner,
        deleteBanner,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        addOrder,
        updateOrderStatus,
        updateSettings,
        refreshOrders,
        refreshMessages,
      }}
    >
      {children}
    </StoreDataContext.Provider>
  );
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (!context) throw new Error('useStoreData must be used within a StoreDataProvider');
  return context;
}

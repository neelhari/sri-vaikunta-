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

const defaultHeroBanners = [
  {
    id: 'sv-ban-1',
    image: '/slider/hero_slide_1.png',
    badge: 'The Grand Festive Heritage Sale',
    title: 'ROYAL DHARMAVARAM\nPURE PATTU SAREES',
    offer: 'FLAT 20% - 30% OFF WEAVER PRICES',
    subtitle: 'Heavy Gold Zari Bridal & Festive Heritage Weaves.',
    link: '/categories?category=dharmavaram-pure-pattu',
    active: true,
  },
  {
    id: 'sv-ban-2',
    image: '/slider/hero_slide_2.png',
    badge: 'Festive Fashion Collection',
    title: 'POCHAMPALLY & BRIDAL\nSILK ENSEMBLES',
    offer: 'UP TO 30% OFF MASTER WEAVES',
    subtitle: 'Artisan Double Ikkat Silk & Handwoven Drapes.',
    link: '/categories?category=pochampally-pattu',
    active: true,
  },
  {
    id: 'sv-ban-3',
    image: '/slider/hero_slide_3.png',
    badge: 'Royal Brocade Edition',
    title: 'BANARASI & GADWAL\nHANDLOOM SAREES',
    offer: 'DIRECT FROM MASTER WEAVERS',
    subtitle: 'Kashi Antique Zari & Traditional Temple Borders.',
    link: '/categories?category=banarasi-sarees',
    active: true,
  },
];

const defaultPromotions = {
  marqueeText: '✨ FESTIVE WEAVER PRICES: Flat 20% - 30% Off on Pure Dharmavaram & Pochampally Pattu | Use Code: SV10 | Free Shipping Across India',
  marqueeActive: true,
  savingsCards: [
    {
      id: 'sc-1',
      title: 'Dharmavaram Pure Pattu',
      subtitle: 'Royal Silk Weaves',
      discount: 'UP TO 25% OFF',
      image: '/products/cat_pure_pattu.jpg',
      link: '/categories?category=dharmavaram-pure-pattu',
    },
    {
      id: 'sc-2',
      title: 'Pochampally Ikkat Silk',
      subtitle: 'Heritage Geometric Drapes',
      discount: '20% - 30% OFF',
      image: '/products/cat_pochampally.jpg',
      link: '/categories?category=pochampally-pattu',
    },
    {
      id: 'sc-3',
      title: 'Banarasi Brocade Silk',
      subtitle: 'Intricate Antique Zari',
      discount: 'FLAT 30% OFF',
      image: '/products/cat_banarasi.jpg',
      link: '/categories?category=banarasi-sarees',
    },
    {
      id: 'sc-4',
      title: 'Handloom Cotton & Silk',
      subtitle: 'All-Day Festive Comfort',
      discount: 'STARTING AT ₹1,299',
      image: '/products/cat_kalamkari.jpg',
      link: '/categories?category=cotton-sarees',
    },
  ],
  categoryHero: {
    image: '/slider/hero_saree_model.png',
    badge: 'THE HERITAGE EDIT',
    title: 'Royal Saree Collections',
    subtitle: '14 Handcrafted Master-Weaver Traditions • Pure Silk & Pattu',
  },
};

const StoreDataContext = createContext();

export function StoreDataProvider({ children }) {
  const [products, setProducts] = useState(defaultProducts);
  const [categories, setCategories] = useState(defaultCategories);
  const [banners, setBanners] = useState(defaultHeroBanners);
  const [promotions, setPromotions] = useState(() => {
    try {
      const saved = localStorage.getItem('sv_promotions_cms');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Auto-heal broken slider/image copy paths
        if (parsed?.savingsCards && Array.isArray(parsed.savingsCards)) {
          parsed.savingsCards = parsed.savingsCards.map((sc, i) => {
            if (sc.image && sc.image.includes('/slider/image copy')) {
              return { ...sc, image: defaultPromotions.savingsCards[i]?.image || '/products/cat_pure_pattu.jpg' };
            }
            return sc;
          });
        }
        return parsed;
      }
      return defaultPromotions;
    } catch (e) {
      return defaultPromotions;
    }
  });
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

  const updatePromotions = (newPromos) => {
    setPromotions((prev) => {
      const updated = { ...prev, ...newPromos };
      try {
        localStorage.setItem('sv_promotions_cms', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return { success: true };
  };

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
    if (res.success) {
      setOrders((prev) => [res.data, ...prev]);

      // Automatically deduct purchased quantities from Supabase products & state
      if (Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          if (item.id) {
            const current = products.find((p) => p.id === item.id);
            if (current) {
              const newQty = Math.max(0, (current.stock ?? 1) - (item.quantity || 1));
              updateProductInDb(item.id, { stock: newQty, inStock: newQty > 0 });
              setProducts((prev) =>
                prev.map((p) => (p.id === item.id ? { ...p, stock: newQty, inStock: newQty > 0 } : p))
              );
            }
          }
        }
      }
    }
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
        promotions,
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
        updatePromotions,
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

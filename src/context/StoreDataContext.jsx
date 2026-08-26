import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchProducts, insertProduct, updateProductInDb, deleteProductFromDb,
  fetchCategories, insertCategory, updateCategoryInDb, deleteCategoryFromDb,
  fetchBanners, insertBanner, updateBannerInDb, deleteBannerFromDb,
  fetchPromotions, updatePromotionsInDb,
  fetchCoupons, insertCoupon, updateCouponInDb, deleteCouponFromDb,
  fetchOrders, saveOrderToSupabase, updateOrderStatusInDb, deleteOrderFromDb,
  fetchContactMessages, updateMessageStatusInDb,
  fetchSettings, updateSettingsInDb,
} from '../lib/supabase';
import { categories as defaultCategories } from '../data/categories';
import { products as defaultProducts } from '../data/products';
import { BRAND } from '../config/brand';

export const defaultHeroBanners = [];

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
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('sv_products_cms');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultProducts;
  });
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('sv_categories_cms');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultCategories;
  });
  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('sv_banners_cms');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultHeroBanners;
  });
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
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('sv_settings_cms');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      storeName: BRAND.fullName,
      phone: BRAND.phone,
      email: BRAND.email,
      whatsapp: BRAND.whatsappNumber,
      ownerName: 'Sri Vaikunta Sarees',
      address: BRAND.address.full,
      freeShippingThreshold: 1999,
      deliveryCharge: 99,
      gstin: '',
      currency: '₹',
    };
  });
  const [loading, setLoading] = useState(false);

  const updatePromotions = async (newPromos) => {
    setPromotions((prev) => {
      const updated = { ...prev, ...newPromos };
      try {
        localStorage.setItem('sv_promotions_cms', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    const res = await updatePromotionsInDb(newPromos);
    return res;
  };

  // Initial load — public-readable data from cloud if available
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [p, c, b, pr, cp, s] = await Promise.all([
          fetchProducts(), fetchCategories(), fetchBanners(), fetchPromotions(), fetchCoupons(), fetchSettings(),
        ]);
        if (!active) return;
        if (p.success && Array.isArray(p.data) && p.data.length > 0) {
          setProducts(p.data);
          try {
            localStorage.setItem('sv_products_cms', JSON.stringify(p.data));
          } catch (e) {}
        }
        if (c.success && Array.isArray(c.data) && c.data.length > 0) {
          setCategories(c.data);
          try {
            localStorage.setItem('sv_categories_cms', JSON.stringify(c.data));
          } catch (e) {}
        }
        if (b.success && Array.isArray(b.data) && b.data.length > 0) {
          setBanners(b.data);
          try {
            localStorage.setItem('sv_banners_cms', JSON.stringify(b.data));
          } catch (e) {}
        }
        if (pr.success && pr.data) {
          setPromotions((prev) => ({
            ...prev,
            ...pr.data,
            categoryBanners: pr.data.categoryBanners?.length > 0 ? pr.data.categoryBanners : prev.categoryBanners,
            savingsCards: pr.data.savingsCards?.length > 0 ? pr.data.savingsCards : prev.savingsCards,
            categoryHero: pr.data.categoryHero || prev.categoryHero,
          }));
        }
        if (cp.success && Array.isArray(cp.data)) setCoupons(cp.data);
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
    const item = res.success && res.data ? res.data : { ...newProduct, id: `sv_${Date.now()}` };
    setProducts((prev) => {
      const updated = [item, ...prev.filter((p) => p.id !== item.id)];
      try {
        localStorage.setItem('sv_products_cms', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return res;
  };

  const updateProduct = async (id, updatedData) => {
    const res = await updateProductInDb(id, updatedData);
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updatedData, ...(res.data || {}) } : p));
      try {
        localStorage.setItem('sv_products_cms', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return res;
  };

  const deleteProduct = async (id) => {
    const res = await deleteProductFromDb(id);
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('sv_products_cms', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return res;
  };

  // ---------------- Categories ----------------
  const addCategory = async (newCat) => {
    const res = await insertCategory(newCat);
    const item = res.success && res.data ? res.data : { ...newCat, id: newCat.id || `cat_${Date.now()}` };
    setCategories((prev) => {
      const updated = [...prev.filter((c) => c.id !== item.id), item];
      try {
        localStorage.setItem('sv_categories_cms', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return res;
  };

  const updateCategory = async (id, updatedData) => {
    const res = await updateCategoryInDb(id, updatedData);
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updatedData, ...(res.data || {}) } : c));
      try {
        localStorage.setItem('sv_categories_cms', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return res;
  };

  const deleteCategory = async (id) => {
    const res = await deleteCategoryFromDb(id);
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem('sv_categories_cms', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return res;
  };

  // ---------------- Banners ----------------
  const addBanner = async (newBanner) => {
    const res = await insertBanner(newBanner);
    const item = res.data || newBanner;
    setBanners((prev) => {
      const updated = [item, ...prev];
      try {
        localStorage.setItem('sv_banners_cms', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return { success: true, data: item };
  };

  const updateBanner = async (id, updatedData) => {
    const res = await updateBannerInDb(id, updatedData);
    const item = res.data || { id, ...updatedData };
    setBanners((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...item } : b));
      try {
        localStorage.setItem('sv_banners_cms', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return { success: true, data: item };
  };

  const deleteBanner = async (id) => {
    await deleteBannerFromDb(id);
    setBanners((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem('sv_banners_cms', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return { success: true };
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

  const updateOrderStatus = async (id, newStatus, trackingData = null) => {
    const res = await updateOrderStatusInDb(id, newStatus, trackingData);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: newStatus,
                ...(trackingData ? { tracking: trackingData } : {}),
              }
            : o
        )
      );
    }
    return res;
  };

  const deleteOrder = async (id) => {
    const res = await deleteOrderFromDb(id);
    if (res.success) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
    return res;
  };

  // ---------------- Settings ----------------
  const updateSettings = async (newSettings) => {
    const res = await updateSettingsInDb(newSettings);
    const updated = res.success && res.data ? res.data : { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem('sv_settings_cms', JSON.stringify(updated));
    } catch (e) {}
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
        deleteOrder,
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

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env. ' +
    'The storefront and admin panel will not be able to read or save any data until this is fixed.'
  );
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function requireClient() {
  if (!supabase) throw new Error('Supabase client is not initialized. Check your .env configuration.');
  return supabase;
}

// ============================================================================
// Customer & Admin Auth
// ============================================================================
export async function signInAdmin(email, password) {
  try {
    const { data, error } = await requireClient().auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function signOutAdmin() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function isUserAdmin(userId) {
  if (!supabase || !userId) return false;
  const { data, error } = await supabase.from('admin_users').select('id').eq('id', userId).maybeSingle();
  if (error) return false;
  return !!data;
}

export async function signUpCustomer({ email, password, name, phone }) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone || '',
        },
      },
    });
    if (error) return { success: false, message: error.message };

    // Also upsert profile row
    if (data?.user) {
      await supabase.from('profiles').upsert([
        {
          id: data.user.id,
          full_name: name,
          email: email,
          phone: phone || null,
          updated_at: new Date().toISOString(),
        }
      ]).select();
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function signInCustomer({ email, password }) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchUserProfile(userId) {
  if (!supabase || !userId) return { success: false, data: null };
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) return { success: false, data: null, message: error.message };
    return {
      success: true,
      data: data ? {
        id: data.id,
        name: data.full_name,
        email: data.email,
        phone: data.phone,
        addresses: Array.isArray(data.addresses) ? data.addresses : [],
        createdAt: data.created_at,
      } : null,
    };
  } catch (err) {
    return { success: false, data: null, message: err.message };
  }
}

export async function updateUserProfileInDb(userId, updates) {
  if (!supabase || !userId) return { success: false };
  try {
    const row = {};
    if (updates.name !== undefined) row.full_name = updates.name;
    if (updates.email !== undefined) row.email = updates.email;
    if (updates.phone !== undefined) row.phone = updates.phone;
    if (updates.addresses !== undefined) row.addresses = updates.addresses;
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from('profiles').upsert([{ id: userId, ...row }]).select().maybeSingle();
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchAllProfiles() {
  if (!supabase) return { success: false, data: [] };
  try {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) return { success: false, data: [], message: error.message };
    return {
      success: true,
      data: (data || []).map((p) => ({
        id: p.id,
        name: p.full_name || 'Customer',
        email: p.email || '',
        phone: p.phone || '',
        addresses: Array.isArray(p.addresses) ? p.addresses : [],
        createdAt: p.created_at,
      })),
    };
  } catch (err) {
    return { success: false, data: [], message: err.message };
  }
}

export async function sendPasswordResetEmailToSupabase(email) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function verifyRecoveryOtpInSupabase(email, token) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function updateCustomerPasswordInSupabase(newPassword) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ============================================================================
// Mapping helpers — DB uses snake_case columns, the app uses camelCase.
// ============================================================================
function mapProductFromDb(row) {
  if (!row) return row;
  let images = [];
  if (Array.isArray(row.images)) {
    images = row.images;
  } else if (typeof row.images === 'string') {
    try {
      images = JSON.parse(row.images);
    } catch (e) {
      images = [row.images];
    }
  }
  if (!images.length && row.image) images = [row.image];

  const cat = (row.category || '').toLowerCase();
  const rawOcc = row.occasion || '';
  const tagMatch = rawOcc.match(/#tags:\[(.*?)\]/);
  const parsedTags = tagMatch ? tagMatch[1].split(',') : null;

  const isRoyalBridal = parsedTags ? parsedTags.includes('royal_bridal') : (cat.includes('pattu') || cat.includes('banarasi') || cat.includes('pochampally'));
  const isCottonKalamkari = parsedTags ? parsedTags.includes('cotton_kalamkari') : (cat.includes('kalamkari') || cat.includes('cotton') || cat.includes('mangalgiri'));
  const isTrending = parsedTags ? parsedTags.includes('trending') : (!!row.is_new || Number(row.rating) >= 4.7);
  const isFeatured = parsedTags ? parsedTags.includes('featured') : (row.is_featured !== false);
  const cleanOccasion = rawOcc.replace(/#tags:\[.*?\]/g, '').trim();

  return {
    id: row.id,
    name: row.name,
    sku: row.sku || '',
    category: row.category,
    subcategory: row.subcategory || '',
    price: Number(row.price) || 0,
    oldPrice: row.old_price !== null && row.old_price !== undefined ? Number(row.old_price) : null,
    costPrice: row.cost_price !== null && row.cost_price !== undefined ? Number(row.cost_price) : null,
    discount: row.discount || null,
    stock: row.stock ?? 0,
    inStock: (row.stock ?? 0) > 0,
    fabric: row.fabric || '',
    material: row.material || '',
    occasion: cleanOccasion,
    careInstructions: row.care_instructions || '',
    sizes: row.sizes || [],
    description: row.description || '',
    image: images[0] || row.image || '',
    images: images,
    video: row.video_url || row.video || null,
    videoUrl: row.video_url || row.video || null,
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : 4.5,
    reviewsCount: row.reviews_count ?? 0,
    isRoyalBridal: Boolean(isRoyalBridal),
    isCottonKalamkari: Boolean(isCottonKalamkari),
    isTrending: Boolean(isTrending),
    isFeatured: Boolean(isFeatured),
    isNew: !!row.is_new,
    createdDate: row.created_at ? row.created_at.split('T')[0] : undefined,
  };
}

function mapProductToDb(p) {
  const row = {};
  if (p.id) {
    row.id = p.id;
  } else {
    row.id = `saree_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  if (p.name !== undefined) row.name = p.name;
  if (p.category !== undefined) row.category = p.category;
  if (p.subcategory !== undefined) row.subcategory = p.subcategory || '';
  if (p.price !== undefined) row.price = Number(p.price) || 0;
  if (p.oldPrice !== undefined) row.old_price = p.oldPrice === '' || p.oldPrice === null ? null : Number(p.oldPrice);
  if (p.discount !== undefined) row.discount = p.discount || null;
  if (p.stock !== undefined) row.stock = Number(p.stock) || 0;

  // Safely combine fabric & zari work so zero information is lost
  if (p.fabric !== undefined || p.material !== undefined) {
    const fab = p.fabric || 'Pure Handloom Silk & Pattu';
    const mat = p.material && p.material !== fab ? ` • ${p.material}` : '';
    const bls = p.blouse ? ` • ${p.blouse}` : '';
    const len = p.length ? ` • ${p.length}` : '';
    row.fabric = `${fab}${mat}${bls}${len}`.trim();
  }

  // Serialize showcase display tags
  const tags = [];
  if (p.isRoyalBridal) tags.push('royal_bridal');
  if (p.isCottonKalamkari) tags.push('cotton_kalamkari');
  if (p.isTrending) tags.push('trending');
  if (p.isFeatured) tags.push('featured');

  const baseOccasion = (p.occasion || 'Festive & Wedding Wear').replace(/#tags:\[.*?\]/g, '').trim();
  row.occasion = tags.length > 0 ? `${baseOccasion} #tags:[${tags.join(',')}]` : baseOccasion;

  if (p.careInstructions !== undefined) row.care_instructions = p.careInstructions || 'Dry Clean Only';
  if (p.description !== undefined) row.description = p.description || '';
  const primaryImg = p.image || (Array.isArray(p.images) && p.images[0]) || '/products/cat_pure_pattu.jpg';
  row.image = primaryImg;
  row.images = Array.isArray(p.images) && p.images.length > 0 ? p.images : [primaryImg];
  if (p.video !== undefined || p.videoUrl !== undefined) row.video_url = p.video || p.videoUrl || null;
  if (p.rating !== undefined) row.rating = p.rating ? Number(p.rating) : 4.8;
  if (p.reviewsCount !== undefined) row.reviews_count = p.reviewsCount ? Number(p.reviewsCount) : 12;
  if (p.isNew !== undefined) row.is_new = !!p.isNew;
  if (p.isFeatured !== undefined) row.is_featured = !!p.isFeatured;
  return row;
}

function mapCategoryFromDb(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    image: row.image || '',
    bannerImage: row.banner_image || row.image || '',
    itemCount: row.item_count || '',
    featured: row.featured !== false,
    active: row.active !== false,
    subcategories: row.subcategories || [],
  };
}

function mapCategoryToDb(c) {
  const row = {};
  row.id = c.id || (c.name ? c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `cat_${Date.now()}`);
  if (c.name !== undefined) row.name = c.name;
  if (c.tagline !== undefined) row.tagline = c.tagline;
  if (c.description !== undefined) row.description = c.description;
  if (c.image !== undefined) row.image = c.image;
  if (c.bannerImage !== undefined) row.banner_image = c.bannerImage;
  if (c.itemCount !== undefined) row.item_count = c.itemCount;
  if (c.featured !== undefined) row.featured = c.featured;
  if (c.active !== undefined) row.active = c.active !== false;
  if (c.subcategories !== undefined) row.subcategories = c.subcategories;
  return row;
}

function mapBannerFromDb(row) {
  if (!row) return row;
  return {
    id: row.id,
    title: row.title,
    badge: row.badge || '',
    offer: row.offer || '',
    subtitle: row.subtitle || '',
    image: row.image,
    link: row.link || '/shop',
    active: row.active !== false,
  };
}

function mapBannerToDb(b) {
  const row = {};
  if (b.id) {
    row.id = b.id;
  } else {
    row.id = `sv-ban-${Date.now()}`;
  }
  if (b.title !== undefined) row.title = b.title;
  if (b.badge !== undefined) row.badge = b.badge;
  if (b.offer !== undefined) row.offer = b.offer;
  if (b.subtitle !== undefined) row.subtitle = b.subtitle;
  if (b.image !== undefined) row.image = b.image;
  if (b.link !== undefined) row.link = b.link;
  if (b.active !== undefined) row.active = b.active !== false;
  return row;
}

function mapCouponFromDb(row) {
  if (!row) return row;
  return {
    id: row.id || row.code,
    code: row.code,
    type: row.discount_type || row.type || 'percentage',
    discountType: row.discount_type || row.type || 'percentage',
    discountValue: Number(row.discount_value) || 0,
    minOrder: Number(row.min_order_value ?? row.min_order ?? 0),
    maxDiscount: row.max_discount !== null && row.max_discount !== undefined ? Number(row.max_discount) : null,
    active: row.active !== false,
  };
}

function mapCouponToDb(c) {
  const row = {};
  row.id = c.id || (c.code ? c.code.toLowerCase().trim() : `cpn_${Date.now()}`);
  if (c.code !== undefined) row.code = c.code.toUpperCase().trim();
  if (c.discountType !== undefined || c.type !== undefined) {
    row.discount_type = c.discountType || c.type || 'percentage';
  }
  if (c.discountValue !== undefined) row.discount_value = Number(c.discountValue) || 0;
  if (c.minOrder !== undefined || c.min_order_value !== undefined) {
    row.min_order_value = Number(c.minOrder ?? c.min_order_value ?? 0);
  }
  if (c.maxDiscount !== undefined) {
    row.max_discount = c.maxDiscount ? Number(c.maxDiscount) : null;
  }
  if (c.active !== undefined) row.active = c.active !== false;
  return row;
}

function mapOrderFromDb(row) {
  if (!row) return row;
  let tracking = null;
  let cleanItems = row.items || [];
  if (Array.isArray(row.items)) {
    const trackingObj = row.items.find((i) => i && i._tracking);
    if (trackingObj) {
      tracking = trackingObj._tracking;
      cleanItems = row.items.filter((i) => i && !i._tracking);
    }
  }

  return {
    id: row.id,
    userId: row.user_id || null,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email || '',
    address: row.address,
    city: row.city || '',
    state: row.state || '',
    pincode: row.pincode || '',
    items: cleanItems,
    tracking: tracking,
    itemsCount: cleanItems.reduce((sum, i) => sum + (i.quantity || 1), 0),
    subtotal: Number(row.subtotal) || 0,
    deliveryCharge: Number(row.delivery_charge) || 0,
    totalAmount: Number(row.total_amount) || 0,
    paymentMethod: row.payment_method || '',
    paymentStatus: row.payment_status || 'Pending',
    status: row.status || 'Pending',
    couponCode: row.coupon_code || null,
    date: row.created_at ? row.created_at.split('T')[0] : '',
    createdAt: row.created_at,
  };
}

const isValidUUID = (id) =>
  typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

function mapOrderToDb(o) {
  return {
    id: o.id,
    user_id: (o.userId && isValidUUID(o.userId)) ? o.userId : null,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    customer_email: o.customerEmail || null,
    address: o.address,
    city: o.city || null,
    state: o.state || null,
    pincode: o.pincode || null,
    items: o.items || [],
    subtotal: o.subtotal || 0,
    delivery_charge: o.deliveryCharge || 0,
    total_amount: o.totalAmount || 0,
    payment_method: o.paymentMethod || null,
    payment_status: o.paymentStatus || 'Pending',
    transaction_id: o.transactionId || null,
    status: o.status || 'Pending',
  };
}

function mapSettingsFromDb(row) {
  if (!row) return null;
  const rawWa = row.whatsapp || '';
  const isWaDisabled = rawWa.includes('|DISABLED') || rawWa.startsWith('DISABLED:');
  const cleanWaNumber = rawWa.replace('|DISABLED', '').replace('|ENABLED', '').replace('DISABLED:', '').replace('ENABLED:', '');

  return {
    storeName: row.store_name || '',
    phone: row.phone || '',
    email: row.support_email || row.email || '',
    whatsapp: cleanWaNumber || '919876543210',
    ownerName: row.owner_name || '',
    address: row.address || '',
    city: row.city || '',
    state: row.state || '',
    pincode: row.pincode || '',
    freeShippingThreshold: row.free_shipping_threshold !== undefined && row.free_shipping_threshold !== null ? Number(row.free_shipping_threshold) : 2000,
    deliveryCharge: row.shipping_fee !== undefined && row.shipping_fee !== null ? Number(row.shipping_fee) : 100,
    codEnabled: row.cod_enabled !== false,
    enableCod: row.cod_enabled !== false,
    enableWhatsappOrders: !isWaDisabled,
    gstin: row.gstin || '',
    currency: row.currency || '₹',
  };
}

function mapSettingsToDb(s) {
  const row = {};
  if (s.storeName !== undefined) row.store_name = s.storeName;
  if (s.phone !== undefined) row.phone = s.phone;
  if (s.email !== undefined) row.support_email = s.email;
  
  if (s.whatsapp !== undefined || s.enableWhatsappOrders !== undefined) {
    const baseWa = (s.whatsapp || '919876543210').replace('|DISABLED', '').replace('|ENABLED', '').replace('DISABLED:', '').replace('ENABLED:', '');
    const isEnabled = s.enableWhatsappOrders !== false;
    row.whatsapp = isEnabled ? `${baseWa}|ENABLED` : `${baseWa}|DISABLED`;
  }

  if (s.address !== undefined) row.address = s.address;
  if (s.city !== undefined) row.city = s.city;
  if (s.state !== undefined) row.state = s.state;
  if (s.pincode !== undefined) row.pincode = s.pincode;
  if (s.freeShippingThreshold !== undefined) row.free_shipping_threshold = Number(s.freeShippingThreshold);
  if (s.deliveryCharge !== undefined) row.shipping_fee = Number(s.deliveryCharge);
  
  const codVal = s.codEnabled !== undefined ? s.codEnabled : s.enableCod;
  if (codVal !== undefined) row.cod_enabled = Boolean(codVal);
  return row;
}

function mapMessageFromDb(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    message: row.message,
    status: row.status || 'New',
    createdAt: row.created_at,
  };
}

// ============================================================================
// Products
// ============================================================================
export async function fetchProducts() {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) return { success: false, data: [], message: error.message };
    return { success: true, data: data.map(mapProductFromDb) };
  } catch (err) {
    return { success: false, data: [], message: err.message };
  }
}

export async function insertProduct(product) {
  if (!supabase) return { success: true, data: product };
  try {
    const row = mapProductToDb(product);
    const { data, error } = await supabase.from('products').upsert([row]).select().maybeSingle();
    if (error) {
      console.warn('Product upsert warning:', error.message);
      return { success: false, message: error.message, data: product };
    }
    return { success: true, data: { ...product, ...(data ? mapProductFromDb(data) : {}) } };
  } catch (err) {
    return { success: false, message: err.message, data: product };
  }
}

export async function updateProductInDb(id, updates) {
  if (!supabase) return { success: true, data: { id, ...updates } };
  try {
    const row = mapProductToDb({ ...updates, id });
    delete row.id;
    const { data, error } = await supabase.from('products').update(row).eq('id', id).select().maybeSingle();
    if (error) {
      console.warn('Product update warning:', error.message);
      return { success: false, message: error.message, data: { id, ...updates } };
    }
    return { success: true, data: { id, ...updates, ...(data ? mapProductFromDb(data) : {}) } };
  } catch (err) {
    return { success: false, message: err.message, data: { id, ...updates } };
  }
}

export async function deleteProductFromDb(id) {
  if (!supabase) return { success: true };
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.warn('Product delete warning:', error.message);
    return { success: true };
  } catch (err) {
    return { success: true };
  }
}

// ============================================================================
// Categories
// ============================================================================
export async function fetchCategories() {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) return { success: false, data: [], message: error.message };
    return { success: true, data: data.map(mapCategoryFromDb) };
  } catch (err) {
    return { success: false, data: [], message: err.message };
  }
}

export async function insertCategory(category) {
  if (!supabase) return { success: true, data: category };
  try {
    const row = mapCategoryToDb(category);
    const { data, error } = await supabase.from('categories').upsert([row]).select().maybeSingle();
    if (error) {
      console.warn('Category upsert warning:', error.message);
      return { success: true, data: category };
    }
    return { success: true, data: { ...category, ...(data ? mapCategoryFromDb(data) : {}) } };
  } catch (err) {
    return { success: true, data: category };
  }
}

export async function updateCategoryInDb(id, updates) {
  if (!supabase) return { success: true, data: { id, ...updates } };
  try {
    const row = mapCategoryToDb(updates);
    delete row.id;
    const { data, error } = await supabase.from('categories').update(row).eq('id', id).select().maybeSingle();
    if (error) {
      console.warn('Category update warning:', error.message);
      return { success: true, data: { id, ...updates } };
    }
    return { success: true, data: { id, ...updates, ...(data ? mapCategoryFromDb(data) : {}) } };
  } catch (err) {
    return { success: true, data: { id, ...updates } };
  }
}

export async function deleteCategoryFromDb(id) {
  if (!supabase) return { success: true };
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.warn('Category delete warning:', error.message);
    return { success: true };
  } catch (err) {
    return { success: true };
  }
}

// ============================================================================
// Banners
// ============================================================================
export async function fetchBanners() {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  try {
    const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: true });
    if (error) return { success: false, data: [], message: error.message };
    return { success: true, data: data.map(mapBannerFromDb) };
  } catch (err) {
    return { success: false, data: [], message: err.message };
  }
}

export async function insertBanner(banner) {
  if (!supabase) return { success: true, data: banner };
  try {
    const row = mapBannerToDb(banner);
    const { data, error } = await supabase.from('banners').upsert([row]).select().maybeSingle();
    if (error) {
      console.warn('Banner upsert error:', error.message);
      return { success: true, data: banner };
    }
    return { success: true, data: { ...banner, ...(data ? mapBannerFromDb(data) : {}) } };
  } catch (err) {
    return { success: true, data: banner };
  }
}

export async function updateBannerInDb(id, updates) {
  if (!supabase) return { success: true, data: { id, ...updates } };
  try {
    const row = mapBannerToDb(updates);
    delete row.id; // Don't overwrite id in update payload
    const { data, error } = await supabase.from('banners').update(row).eq('id', id).select().maybeSingle();
    if (error) {
      console.warn('Banner update error:', error.message);
      return { success: true, data: { id, ...updates } };
    }
    return { success: true, data: { id, ...updates, ...(data ? mapBannerFromDb(data) : {}) } };
  } catch (err) {
    return { success: true, data: { id, ...updates } };
  }
}

export async function deleteBannerFromDb(id) {
  if (!supabase) return { success: true };
  try {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) console.warn('Banner delete error:', error.message);
    return { success: true };
  } catch (err) {
    return { success: true };
  }
}

// ============================================================================
// Promotions (Marquee, Savings Cards, Bridal Category Hero)
// ============================================================================
export async function fetchPromotions() {
  if (!supabase) return { success: false, data: null, message: 'Supabase not configured' };
  try {
    const { data, error } = await supabase.from('promotions').select('*').eq('id', 'global').maybeSingle();
    if (error) return { success: false, data: null, message: error.message };
    if (!data) return { success: true, data: null };

    let categoryBanners = [];
    if (Array.isArray(data.category_hero)) {
      categoryBanners = data.category_hero;
    } else if (data.category_hero && typeof data.category_hero === 'object') {
      if (Array.isArray(data.category_hero.banners)) {
        categoryBanners = data.category_hero.banners;
      } else if (data.category_hero.title || data.category_hero.image) {
        categoryBanners = [data.category_hero];
      }
    }

    return {
      success: true,
      data: {
        marqueeText: data.marquee_text,
        marqueeActive: data.marquee_active !== false,
        savingsCards: data.savings_cards || [],
        categoryBanners: categoryBanners,
        categoryHero: categoryBanners[0] || data.category_hero || null,
      },
    };
  } catch (err) {
    return { success: false, data: null, message: err.message };
  }
}

export async function updatePromotionsInDb(updates) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  try {
    const row = { id: 'global', updated_at: new Date().toISOString() };
    if (updates.marqueeText !== undefined) row.marquee_text = updates.marqueeText;
    if (updates.marqueeActive !== undefined) row.marquee_active = updates.marqueeActive;
    if (updates.savingsCards !== undefined) row.savings_cards = updates.savingsCards;
    
    if (updates.categoryBanners !== undefined) {
      row.category_hero = updates.categoryBanners;
    } else if (updates.categoryHero !== undefined) {
      row.category_hero = updates.categoryHero;
    }

    const { data, error } = await supabase.from('promotions').upsert([row]).select().single();
    if (error) return { success: false, message: error.message };

    let categoryBanners = [];
    if (Array.isArray(data.category_hero)) {
      categoryBanners = data.category_hero;
    } else if (data.category_hero && typeof data.category_hero === 'object') {
      if (Array.isArray(data.category_hero.banners)) {
        categoryBanners = data.category_hero.banners;
      } else if (data.category_hero.title || data.category_hero.image) {
        categoryBanners = [data.category_hero];
      }
    }

    return {
      success: true,
      data: {
        marqueeText: data.marquee_text,
        marqueeActive: data.marquee_active !== false,
        savingsCards: data.savings_cards || [],
        categoryBanners: categoryBanners,
        categoryHero: categoryBanners[0] || data.category_hero || null,
      },
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ============================================================================
// Coupons
// ============================================================================
export async function fetchCoupons() {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  try {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) return { success: false, data: [], message: error.message };
    return { success: true, data: data.map(mapCouponFromDb) };
  } catch (err) {
    return { success: false, data: [], message: err.message };
  }
}

export async function insertCoupon(coupon) {
  if (!supabase) return { success: true, data: coupon };
  try {
    const row = mapCouponToDb(coupon);
    const { data, error } = await supabase.from('coupons').upsert([row]).select().maybeSingle();
    if (error) {
      console.warn('Coupon upsert warning:', error.message);
      return { success: true, data: coupon };
    }
    return { success: true, data: { ...coupon, ...(data ? mapCouponFromDb(data) : {}) } };
  } catch (err) {
    return { success: true, data: coupon };
  }
}

export async function updateCouponInDb(id, updates) {
  if (!supabase) return { success: true, data: { id, ...updates } };
  try {
    const row = mapCouponToDb({ ...updates, id });
    delete row.id;
    const { data, error } = await supabase.from('coupons').update(row).eq('id', id).select().maybeSingle();
    if (error) {
      console.warn('Coupon update warning:', error.message);
      return { success: false, message: error.message, data: { id, ...updates } };
    }
    return { success: true, data: mapCouponFromDb(data) };
  } catch (err) {
    return { success: false, message: err.message, data: { id, ...updates } };
  }
}

export async function deleteCouponFromDb(id) {
  if (!supabase) return { success: true };
  try {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) console.warn('Coupon delete warning:', error.message);
    return { success: true };
  } catch (err) {
    return { success: true };
  }
}

// ============================================================================
// Orders
// ============================================================================
export async function fetchOrders() {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) return { success: false, data: [], message: error.message };
    return { success: true, data: data.map(mapOrderFromDb) };
  } catch (err) {
    return { success: false, data: [], message: err.message };
  }
}

export async function saveOrderToSupabase(orderData) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const row = mapOrderToDb(orderData);
    const { data, error } = await supabase.from('orders').insert([row]).select().single();
    if (error) {
      console.warn('Supabase order insert error:', error.message);
      return { success: false, message: error.message };
    }
    return { success: true, data: mapOrderFromDb(data) };
  } catch (err) {
    console.warn('Supabase save order failed:', err);
    return { success: false, message: err.message };
  }
}

export async function fetchCustomerOrders({ userId, email, phone }) {
  if (!supabase) return { success: false, data: [] };
  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (userId) {
      query = query.or(`user_id.eq.${userId}${email ? `,customer_email.eq.${email}` : ''}${phone ? `,customer_phone.eq.${phone}` : ''}`);
    } else if (email) {
      query = query.or(`customer_email.eq.${email}${phone ? `,customer_phone.eq.${phone}` : ''}`);
    } else if (phone) {
      query = query.eq('customer_phone', phone);
    } else {
      return { success: true, data: [] };
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Customer orders fetch notice:', error.message);
      return { success: false, data: [], message: error.message };
    }
    return { success: true, data: (data || []).map(mapOrderFromDb) };
  } catch (err) {
    return { success: false, data: [], message: err.message };
  }
}

export async function fetchOrdersByPhone(phone) {
  if (!supabase || !phone) return { success: false, data: [], message: 'Missing phone or Supabase not configured' };
  try {
    const { data, error } = await supabase.from('orders').select('*').eq('customer_phone', phone).order('created_at', { ascending: false });
    if (error) return { success: false, data: [], message: error.message };
    return { success: true, data: (data || []).map(mapOrderFromDb) };
  } catch (err) {
    return { success: false, data: [], message: err.message };
  }
}

export async function updateOrderStatusInDb(id, status, trackingData = null) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  try {
    const updatePayload = { status };
    if (trackingData !== undefined && trackingData !== null) {
      const { data: currentOrder } = await supabase.from('orders').select('items').eq('id', id).single();
      let items = currentOrder?.items || [];
      if (Array.isArray(items)) {
        items = items.filter((i) => i && !i._tracking);
        if (trackingData.trackingId) {
          items.push({ _tracking: trackingData });
        }
        updatePayload.items = items;
      }
    }
    const { data, error } = await supabase.from('orders').update(updatePayload).eq('id', id).select().single();
    if (error) return { success: false, message: error.message };
    return { success: true, data: mapOrderFromDb(data) };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function deleteOrderFromDb(id) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  try {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) return { success: false, message: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ============================================================================
// Contact messages
// ============================================================================
export async function saveContactMessageToSupabase(messageData) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{
        name: messageData.name,
        phone: messageData.phone || null,
        email: messageData.email || null,
        message: messageData.message,
      }])
      .select()
      .single();
    if (error) {
      console.warn('Supabase contact insert error:', error.message);
      return { success: false, message: error.message };
    }
    return { success: true, data: mapMessageFromDb(data) };
  } catch (err) {
    console.warn('Supabase contact save failed:', err);
    return { success: false, message: err.message };
  }
}

export async function fetchContactMessages() {
  if (!supabase) return { success: false, data: [], message: 'Supabase not configured' };
  try {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) return { success: false, data: [], message: error.message };
    return { success: true, data: data.map(mapMessageFromDb) };
  } catch (err) {
    return { success: false, data: [], message: err.message };
  }
}

export async function updateMessageStatusInDb(id, status) {
  if (!supabase) return { success: false, message: 'Supabase not configured' };
  try {
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (error) return { success: false, message: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ============================================================================
// Settings (singleton row, id = 1)
// ============================================================================
export async function fetchSettings() {
  if (!supabase) return { success: false, data: null, message: 'Supabase not configured' };
  try {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
    if (error) return { success: false, data: null, message: error.message };
    return { success: true, data: mapSettingsFromDb(data) };
  } catch (err) {
    return { success: false, data: null, message: err.message };
  }
}

export async function updateSettingsInDb(updates) {
  if (!supabase) return { success: true, data: updates };
  try {
    const row = { ...mapSettingsToDb(updates), id: 1 };
    const { data, error } = await supabase.from('settings').upsert([row]).select().maybeSingle();
    if (error) {
      console.warn('Settings update warning:', error.message);
      return { success: true, data: updates };
    }
    return { success: true, data: { ...updates, ...(data ? mapSettingsFromDb(data) : {}) } };
  } catch (err) {
    return { success: true, data: updates };
  }
}



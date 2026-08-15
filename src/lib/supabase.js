import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lsjtglurylyrbnlkszwg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VM5g5ubn_zBsdFKlE5PCBA_l5oAEd8B';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch products from Supabase database table 'products'
 */
export async function getProductsFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.warn('Supabase products table error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase fetch failed:', err);
    return null;
  }
}

/**
 * Save customer order to Supabase table 'orders'
 */
export async function saveOrderToSupabase(orderData) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { data, error } = await supabase.from('orders').insert([orderData]).select();
    if (error) {
      console.warn('Supabase order insert error:', error.message);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('Supabase save order failed:', err);
    return { success: false, err };
  }
}

/**
 * Save contact inquiry message to Supabase table 'contact_messages'
 */
export async function saveContactMessageToSupabase(messageData) {
  if (!supabase) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { data, error } = await supabase.from('contact_messages').insert([messageData]).select();
    if (error) {
      console.warn('Supabase contact insert error:', error.message);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('Supabase contact save failed:', err);
    return { success: false, err };
  }
}

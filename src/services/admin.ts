import { supabase } from '@/services/supabase';
import type { Product, Category, Order, Coupon } from '@/types';

// Admin services use the service role key via edge functions for privileged operations.
// For reads, we can query directly since admin has access via the frontend supabase client.

export async function adminGetProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminCreateProduct(product: {
  name: string;
  slug: string;
  description: string;
  brand: string;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  size: string;
  image_url: string;
  gallery: string[];
  fragrance_notes: { top: string[]; heart: string[]; base: string[] };
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
}): Promise<void> {
  const { error } = await supabase.from('products').insert(product);
  if (error) throw error;
}

export async function adminUpdateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const { error } = await supabase.from('products').update(updates).eq('id', id);
  if (error) throw error;
}

export async function adminDeleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function adminGetCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function adminCreateCategory(cat: {
  name: string;
  slug: string;
  description: string;
  image_url: string;
}): Promise<void> {
  const { error } = await supabase.from('categories').insert(cat);
  if (error) throw error;
}

export async function adminUpdateCategory(id: string, updates: Partial<Category>): Promise<void> {
  const { error } = await supabase.from('categories').update(updates).eq('id', id);
  if (error) throw error;
}

export async function adminDeleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function adminGetOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items:order_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpdateOrderStatus(id: string, status: string, paymentStatus?: string): Promise<void> {
  const updates: Record<string, string> = { order_status: status };
  if (paymentStatus) updates.payment_status = paymentStatus;
  const { error } = await supabase.from('orders').update(updates).eq('id', id);
  if (error) throw error;
}

export async function adminGetCustomers(): Promise<{ id: string; email: string; full_name: string; phone: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, phone, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminGetCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminCreateCoupon(coupon: {
  code: string;
  discount_type: string;
  discount_value: number;
  minimum_order: number;
  expires_at: string | null;
  usage_limit: number | null;
  active: boolean;
}): Promise<void> {
  const { error } = await supabase.from('coupons').insert(coupon);
  if (error) throw error;
}

export async function adminUpdateCoupon(id: string, updates: Partial<Coupon>): Promise<void> {
  const { error } = await supabase.from('coupons').update(updates).eq('id', id);
  if (error) throw error;
}

export async function adminDeleteCoupon(id: string): Promise<void> {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
}

export async function adminGetDashboardStats(): Promise<{
  totalSales: number;
  todaySales: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: Product[];
}> {
  const { data: orders } = await supabase
    .from('orders')
    .select('total, created_at, order_status');
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
  const { count: totalCustomers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  const { data: lowStock } = await supabase
    .from('products')
    .select('*')
    .lt('stock_quantity', 10)
    .order('stock_quantity', { ascending: true });

  const allOrders = orders ?? [];
  const totalSales = allOrders.reduce((s, o) => s + Number(o.total), 0);
  const today = new Date().toISOString().split('T')[0];
  const todaySales = allOrders
    .filter((o) => o.created_at.startsWith(today))
    .reduce((s, o) => s + Number(o.total), 0);
  const pendingOrders = allOrders.filter((o) => o.order_status === 'pending').length;
  const deliveredOrders = allOrders.filter((o) => o.order_status === 'delivered').length;

  return {
    totalSales,
    todaySales,
    totalOrders: totalOrders ?? 0,
    pendingOrders,
    deliveredOrders,
    totalCustomers: totalCustomers ?? 0,
    totalProducts: totalProducts ?? 0,
    lowStockProducts: lowStock ?? [],
  };
}

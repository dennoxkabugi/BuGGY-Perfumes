import { supabase } from '@/services/supabase';
import type { Product, Category, Review, Order, OrderItem, Address, Coupon } from '@/types';

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getProducts(opts?: {
  category?: string;
  search?: string;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  limit?: number;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
}): Promise<Product[]> {
  let query = supabase.from('products').select('*, category:categories(*)');
  if (opts?.category) {
    query = query.eq('category_id', opts.category);
  }
  if (opts?.search) {
    query = query.or(`name.ilike.%${opts.search}%,brand.ilike.%${opts.search}%,description.ilike.%${opts.search}%`);
  }
  if (opts?.featured) query = query.eq('is_featured', true);
  if (opts?.bestseller) query = query.eq('is_bestseller', true);
  if (opts?.isNew) query = query.eq('is_new', true);
  if (opts?.brand) query = query.eq('brand', opts.brand);
  if (opts?.minPrice !== undefined) query = query.gte('price', opts.minPrice);
  if (opts?.maxPrice !== undefined) query = query.lte('price', opts.maxPrice);
  if (opts?.rating !== undefined) query = query.gte('rating_avg', opts.rating);

  switch (opts?.sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'price-low':
      query = query.order('price', { ascending: true });
      break;
    case 'price-high':
      query = query.order('price', { ascending: false });
      break;
    case 'popular':
      query = query.order('rating_count', { ascending: false });
      break;
    default:
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  }

  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:user_profiles(full_name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addReview(review: {
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
}): Promise<void> {
  const { error } = await supabase.from('reviews').insert(review);
  if (error) throw error;

  // Update product rating
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', review.product_id);
  if (reviews && reviews.length > 0) {
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await supabase
      .from('products')
      .update({ rating_avg: Math.round(avg * 100) / 100, rating_count: reviews.length })
      .eq('id', review.product_id);
  }
}

export async function getMyOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items:order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items:order_items(*)')
    .eq('id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createOrder(orderData: {
  order_number: string;
  user_id: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  customer_name: string;
  email: string;
  phone: string;
  county: string;
  town: string;
  area: string;
  building: string;
  delivery_instructions: string;
  items: { product_id: string; product_name: string; quantity: number; unit_price: number; subtotal: number }[];
}): Promise<Order> {
  const { items, ...orderFields } = orderData;
  const { data, error } = await supabase
    .from('orders')
    .insert(orderFields)
    .select()
    .single();
  if (error) throw error;

  const orderItems = items.map((item) => ({ ...item, order_id: data.id }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  return data;
}

export async function getAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addAddress(addr: Omit<Address, 'id' | 'created_at' | 'user_id'> & { user_id: string }): Promise<void> {
  const { error } = await supabase.from('addresses').insert(addr);
  if (error) throw error;
}

export async function updateAddress(id: string, updates: Partial<Address>): Promise<void> {
  const { error } = await supabase.from('addresses').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw error;
}

export async function validateCoupon(code: string): Promise<Coupon | null> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  if (data.usage_limit && data.times_used >= data.usage_limit) return null;
  return data;
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_coupon_usage', { coupon_id: couponId });
  if (error) {
    // Fallback: read, increment, write
    const { data } = await supabase.from('coupons').select('times_used').eq('id', couponId).single();
    if (data) {
      await supabase.from('coupons').update({ times_used: data.times_used + 1 }).eq('id', couponId);
    }
  }
}

export async function subscribeNewsletter(email: string): Promise<void> {
  const { error } = await supabase.from('newsletter_subscribers').insert({ email });
  if (error && error.code !== '23505') throw error;
}

export async function submitContactMessage(msg: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert(msg);
  if (error) throw error;
}

export async function getBrands(): Promise<string[]> {
  const { data, error } = await supabase.from('products').select('brand');
  if (error) throw error;
  if (!data) return [];
  return [...new Set(data.map((d) => d.brand))].sort();
}

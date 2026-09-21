export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string;
  category_id: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  size: string | null;
  image_url: string | null;
  gallery: string[];
  fragrance_notes: FragranceNotes;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  customer_name: string;
  email: string;
  phone: string | null;
  county: string | null;
  town: string | null;
  area: string | null;
  building: string | null;
  delivery_instructions: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  user?: { full_name: string } | null;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  county: string | null;
  town: string | null;
  area: string | null;
  building: string | null;
  delivery_instructions: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  minimum_order: number;
  expires_at: string | null;
  usage_limit: number | null;
  times_used: number;
  active: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'mpesa' | 'card' | 'cod';

export type OrderStatus =
  | 'en_attente'
  | 'confirme'
  | 'en_livraison'
  | 'livre'
  | 'annule';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  order?: number;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  promo_price?: number;
  image_url: string;
  images?: string[];
  variant_names?: string[];
  variant_stocks?: number[];
  category_id: string;
  category?: Category;
  stock: number;
  is_active: boolean;
  is_featured?: boolean;
  characteristics?: Record<string, string>;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  notes?: string;
  cancel_reason?: string;
  customer_confirmed?: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  sku: string;
  condition: "NEW" | "REFURBISHED" | "USED";
  images: string[];
  specs: Record<string, string>;
  categoryId: string;
  brandId: string;
  isActive: boolean;
  isFeatured: boolean;
  category?: Category;
  brand?: Brand;
}

export interface Category {
  id: string;
  nameRo: string;
  nameRu: string;
  slug: string;
  image?: string;
  parentId?: string | null;
  order: number;
  isActive: boolean;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: "CASH" | "CARD" | "CREDIT";
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  link: string;
  buttonText: string;
  position: "HERO" | "SIDEBAR" | "FOOTER";
  order: number;
  isActive: boolean;
  gradient?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "MODERATOR" | "CUSTOMER";
  createdAt: string;
}

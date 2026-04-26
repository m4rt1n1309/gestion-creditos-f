export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  currentPrice: number;
  availableStock: number;
  status: ProductStatus;
  createdAt: string;
}

export interface ProductDetail extends Product {
  updatedAt: string;
}

export interface ProductListFilters {
  status?: ProductStatus;
  search?: string;
}

export interface ProductCreatePayload {
  name: string;
  description?: string;
  currentPrice: number;
  availableStock: number;
}

export interface ProductUpdatePayload {
  name?: string;
  description?: string;
  currentPrice?: number;
}

export interface StockAdjustPayload {
  movement: 'IN' | 'OUT';
  quantity: number;
  reason: string;
}

export interface StockAdjustResult {
  id: string;
  name: string;
  availableStock: number;
}

export interface ProductRaw {
  id: string;
  name: string;
  description: string | null;
  current_price: number;
  available_stock: number;
  status: ProductStatus;
  created_at: string;
}

export interface ProductDetailRaw extends ProductRaw {
  updated_at: string;
}

export interface StockAdjustResultRaw {
  id: string;
  name: string;
  available_stock: number;
}

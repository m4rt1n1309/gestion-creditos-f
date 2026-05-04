export interface ProductVariant {
  id: string;
  color: string | null;
  size: string | null;
  capacity: string | null;
  currentPrice: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  productId: string;
  productName: string;
  title: string;
  model: string | null;
  productStatus: string;
  brandId: string | null;
  brandName: string | null;
}

export interface ProductVariantDetail extends ProductVariant {
  availableCount: number;
  reservedCount: number;
  soldCount: number;
}

export interface ProductVariantCreatePayload {
  productId: string;
  color?: string;
  size?: string;
  capacity?: string;
  currentPrice: number;
}

export interface ProductVariantUpdatePayload {
  color?: string;
  size?: string;
  capacity?: string;
  currentPrice?: number;
}

export interface ProductVariantRaw {
  id: string;
  color: string | null;
  size: string | null;
  capacity: string | null;
  current_price: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
  product_id: string;
  product_name: string;
  title: string;
  model: string | null;
  product_status: string;
  brand_id: string | null;
  brand_name: string | null;
}

export interface ProductVariantDetailRaw extends ProductVariantRaw {
  available_count: number;
  reserved_count: number;
  sold_count: number;
}

export interface ProductVariantFilters {
  productId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export type ProductUnitStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'INACTIVE';

export interface ProductUnit {
  id: string;
  unitCode: string;
  status: ProductUnitStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  variantId: string;
  color: string | null;
  size: string | null;
  capacity: string | null;
  currentPrice: number;
  productId: string;
  productName: string;
}

export interface ProductUnitCreatePayload {
  variantId: string;
  unitCode: string;
  notes?: string;
}

export interface ProductUnitBulkPayload {
  variantId: string;
  units: Array<{ unitCode: string; notes?: string }>;
}

export interface ProductUnitBulkResult {
  created: number;
  units: ProductUnit[];
}

export interface ProductUnitUpdatePayload {
  unitCode?: string;
  notes?: string;
}

export interface ProductUnitRaw {
  id: string;
  unit_code: string;
  status: ProductUnitStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  variant_id: string;
  color: string | null;
  size: string | null;
  capacity: string | null;
  current_price: number;
  product_id: string;
  product_name: string;
}

export interface ProductUnitFilters {
  variantId?: string;
  productId?: string;
  status?: ProductUnitStatus;
}

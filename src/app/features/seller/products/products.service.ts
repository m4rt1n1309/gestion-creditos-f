import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../../../core/http/api-http.service';
import {
  Product,
  ProductCreatePayload,
  ProductDetail,
  ProductDetailRaw,
  ProductListFilters,
  ProductRaw,
  ProductUpdatePayload,
  StockAdjustPayload,
  StockAdjustResult,
  StockAdjustResultRaw,
} from '../models/product.model';

/**
 * Convierte un objeto ProductRaw a Product
 * @param raw
 * @returns
 */
function toProduct(raw: ProductRaw): Product {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    currentPrice: raw.current_price,
    availableStock: raw.available_stock,
    status: raw.status,
    createdAt: raw.created_at,
  };
}

/**
 * Convierte un objeto ProductDetailRaw a ProductDetail
 * @param raw
 * @returns
 */
function toProductDetail(raw: ProductDetailRaw): ProductDetail {
  return {
    ...toProduct(raw),
    updatedAt: raw.updated_at,
  };
}

/**
 * Convierte un objeto StockAdjustResultRaw a StockAdjustResult
 * @param raw
 * @returns
 */
function toStockAdjustResult(raw: StockAdjustResultRaw): StockAdjustResult {
  return {
    id: raw.id,
    name: raw.name,
    availableStock: raw.available_stock,
  };
}

/**
 * Convierte un objeto ProductCreatePayload a un objeto para ser enviado en la solicitud de creación de producto.
 * @param product
 * @returns
 */
function fromCreatePayload(
  product: ProductCreatePayload,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: product.name,
    current_price: product.currentPrice,
    available_stock: product.availableStock,
  };
  if (product.description !== undefined)
    body['description'] = product.description;
  return body;
}

/**
 * Convierte un objeto ProductUpdatePayload a un objeto para ser enviado en la solicitud de actualización de producto.
 * @param product
 * @returns
 */
function fromUpdatePayload(
  product: ProductUpdatePayload,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (product.name !== undefined) body['name'] = product.name;
  if (product.description !== undefined)
    body['description'] = product.description;
  if (product.currentPrice !== undefined)
    body['current_price'] = product.currentPrice;
  return body;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly api = inject(ApiHttpService);

  /**
   * Lista los productos con filtros opcionales.
   * @param filters
   * @returns
   */
  list(filters?: ProductListFilters): Observable<Product[]> {
    const params: Record<string, string> = {};
    if (filters?.status) params['status'] = filters.status;
    if (filters?.search) params['search'] = filters.search;
    return this.api
      .get<ProductRaw[]>('products', params)
      .pipe(map((items) => items.map(toProduct)));
  }

  /**
   * Obtiene un producto por su ID.
   * @param id
   * @returns
   */
  getById(id: string): Observable<ProductDetail> {
    return this.api
      .get<ProductDetailRaw>(`products/${id}`)
      .pipe(map(toProductDetail));
  }

  /**
   * Crea un nuevo producto.
   * @param payload
   * @returns
   */
  create(payload: ProductCreatePayload): Observable<ProductDetail> {
    return this.api
      .post<ProductDetailRaw>('products', fromCreatePayload(payload))
      .pipe(map(toProductDetail));
  }

  /**
   * Actualiza un producto existente.
   * @param id
   * @param payload
   * @returns
   */
  update(id: string, payload: ProductUpdatePayload): Observable<ProductDetail> {
    return this.api
      .put<ProductDetailRaw>(`products/${id}`, fromUpdatePayload(payload))
      .pipe(map(toProductDetail));
  }

  /**
   * Ajusta el stock de un producto.
   * @param id
   * @param payload
   * @returns
   */
  adjustStock(
    id: string,
    payload: StockAdjustPayload,
  ): Observable<StockAdjustResult> {
    return this.api
      .patch<StockAdjustResultRaw>(`products/${id}/stock`, {
        movement: payload.movement,
        quantity: payload.quantity,
        reason: payload.reason,
      })
      .pipe(map(toStockAdjustResult));
  }

  /**
   * Desactiva un producto.
   * @param id
   * @returns
   */
  deactivate(id: string): Observable<void> {
    return this.api
      .patch<void>(`products/${id}/deactivate`)
      .pipe(map(() => undefined));
  }

  /**
   * Activa un producto.
   * @param id
   * @returns
   */
  activate(id: string): Observable<void> {
    return this.api
      .patch<void>(`products/${id}/activate`)
      .pipe(map(() => undefined));
  }
}

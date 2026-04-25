import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../../core/http/api-http.service';
import {
  CollectionFilter,
  CollectionGeneratePayload,
  CollectionSheet,
  CollectionSheetDetail,
  CollectionSheetDetailRaw,
  CollectionSheetItem,
  CollectionSheetItemRaw,
  CollectionSheetRaw,
} from './models/collection.model';

/**
 * Convierte una representación en bruto de una planilla de cobranza a su forma estructurada.
 * @param raw
 * @returns
 */
function toSheet(raw: CollectionSheetRaw): CollectionSheet {
  return {
    id: raw.id,
    sheetDate: raw.sheet_date,
    filterUsed: raw.filter_used,
    createdAt: raw.created_at,
    collectorName: raw.collector_name,
    totalItems: raw.total_items,
  };
}

/**
 * Convierte una representación en bruto de un ítem de planilla de cobranza a su forma estructurada.
 * @param raw
 * @returns
 */
function toSheetItem(raw: CollectionSheetItemRaw): CollectionSheetItem {
  return {
    orderNumber: raw.order_number,
    plannedAmount: raw.planned_amount,
    installmentId: raw.installment_id,
    installmentNumber: raw.installment_number,
    dueDate: raw.due_date,
    amountDue: raw.amount_due,
    amountPaid: raw.amount_paid,
    penaltyAmount: raw.penalty_amount,
    installmentStatus: raw.installment_status,
    creditId: raw.credit_id,
    creditType: raw.credit_type,
    customerName: raw.customer_name,
    customerPhone: raw.customer_phone,
    customerAddress: raw.customer_address,
  };
}

/**
 * Convierte una representación en bruto de un detalle de planilla de cobranza a su forma estructurada.
 * @param raw
 * @returns
 */
function toSheetDetail(raw: CollectionSheetDetailRaw): CollectionSheetDetail {
  return {
    ...toSheet(raw),
    collectorId: raw.collector_id,
    generatedByName: raw.generated_by_name,
    items: raw.items.map(toSheetItem),
  };
}

@Injectable({ providedIn: 'root' })
export class CollectionsService {
  private readonly api = inject(ApiHttpService);

  /**
   * Lista las planillas de cobranza según los filtros especificados.
   * @param filters
   * @returns
   */
  list(filters?: {
    collectorId?: string;
    date?: string;
  }): Observable<CollectionSheet[]> {
    const params: Record<string, string> = {};
    if (filters?.collectorId) params['collector_id'] = filters.collectorId;
    if (filters?.date) params['date'] = filters.date;
    return this.api
      .get<CollectionSheetRaw[]>('collections', params)
      .pipe(map((items) => items.map(toSheet)));
  }

  /**
   * Obtiene una planilla de cobranza por su ID.
   * @param id
   * @returns
   */
  getById(id: string): Observable<CollectionSheetDetail> {
    return this.api
      .get<CollectionSheetDetailRaw>(`collections/${id}`)
      .pipe(map(toSheetDetail));
  }

  /**
   * Genera una nueva planilla de cobranza.
   * @param payload
   * @returns
   */
  generate(
    payload: CollectionGeneratePayload,
  ): Observable<CollectionSheetDetail> {
    return this.api
      .post<CollectionSheetDetailRaw>('collections', {
        collector_id: payload.collectorId,
        date: payload.date,
        filter: payload.filter,
      })
      .pipe(map(toSheetDetail));
  }
}

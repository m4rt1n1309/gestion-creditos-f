import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../../core/http/api-http.service';
import {
  Payment,
  PaymentCreatePayload,
  PaymentCreateResult,
  PaymentCreateResultRaw,
  PaymentDetail,
  PaymentDetailRaw,
  PaymentListFilters,
  PaymentRaw,
} from './models/payment.model';

/**
 * Convierte un objeto raw de tipo PaymentRaw en un objeto de tipo Payment.
 * @param raw
 * @returns
 */
function toPayment(raw: PaymentRaw): Payment {
  return {
    id: raw.id,
    installmentId: raw.installment_id,
    amountReceived: raw.amount_received,
    paymentMethod: raw.payment_method,
    transferReference: raw.transfer_reference,
    status: raw.status,
    rejectionReason: raw.rejection_reason,
    notes: raw.notes,
    createdAt: raw.created_at,
    approvedAt: raw.approved_at,
    approvedBy: raw.approved_by,
    installmentNumber: raw.installment_number,
    amountDue: raw.amount_due,
    dueDate: raw.due_date,
    creditId: raw.credit_id,
    creditType: raw.credit_type,
    customerName: raw.customer_name,
    customerDni: raw.customer_dni,
    collectorName: raw.collector_name,
  };
}

/**
 * Convierte un objeto raw de tipo PaymentDetailRaw en un objeto de tipo PaymentDetail.
 * @param raw
 * @returns
 */
function toPaymentDetail(raw: PaymentDetailRaw): PaymentDetail {
  return {
    ...toPayment(raw),
    amountPaid: raw.amount_paid,
    penaltyAmount: raw.penalty_amount,
    customerId: raw.customer_id,
    collectorId: raw.collector_id,
  };
}

/**
 * Convierte un objeto raw de tipo PaymentCreateResultRaw en un objeto de tipo PaymentCreateResult.
 * @param raw
 * @returns
 */
function toCreateResult(raw: PaymentCreateResultRaw): PaymentCreateResult {
  return {
    id: raw.id,
    installmentId: raw.installment_id,
    amountReceived: raw.amount_received,
    paymentMethod: raw.payment_method,
    status: raw.status,
    createdAt: raw.created_at,
    ...(raw.warning ? { warning: raw.warning } : {}),
  };
}

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly api = inject(ApiHttpService);

  /**
   * Lista los pagos según los filtros especificados.
   * @param filters
   * @returns
   */
  list(filters?: PaymentListFilters): Observable<Payment[]> {
    const params: Record<string, string> = {};
    if (filters?.status) params['status'] = filters.status;
    if (filters?.collectorId) params['collector_id'] = filters.collectorId;
    if (filters?.installmentId)
      params['installment_id'] = filters.installmentId;
    return this.api
      .get<PaymentRaw[]>('payments', params)
      .pipe(map((items) => items.map(toPayment)));
  }

  /**
   * Obtiene los detalles de un pago por su ID.
   * @param id
   * @returns
   */
  getById(id: string): Observable<PaymentDetail> {
    return this.api
      .get<PaymentDetailRaw>(`payments/${id}`)
      .pipe(map(toPaymentDetail));
  }

  /**
   * Crea un nuevo pago.
   * @param payload
   * @returns
   */
  create(payload: PaymentCreatePayload): Observable<PaymentCreateResult> {
    const body: Record<string, unknown> = {
      installment_id: payload.installmentId,
      amount_received: payload.amountReceived,
      payment_method: payload.paymentMethod,
    };
    if (payload.transferReference)
      body['transfer_reference'] = payload.transferReference;
    if (payload.notes) body['notes'] = payload.notes;
    return this.api
      .post<PaymentCreateResultRaw>('payments', body)
      .pipe(map(toCreateResult));
  }

  /**
   * Aprueba un pago por su ID.
   * @param id
   * @returns
   */
  approve(id: string): Observable<PaymentDetail> {
    return this.api
      .patch<PaymentDetailRaw>(`payments/${id}/approve`)
      .pipe(map(toPaymentDetail));
  }

  /**
   * Rechaza un pago por su ID.
   * @param id
   * @param rejectionReason
   * @returns
   */
  reject(id: string, rejectionReason: string): Observable<void> {
    return this.api.patch<void>(`payments/${id}/reject`, {
      rejection_reason: rejectionReason,
    });
  }
}

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../../../core/http/api-http.service';
import {
  ApprovePayload,
  Credit,
  CreditCreatePayload,
  CreditDetail,
  CreditDetailRaw,
  CreditInstallment,
  CreditInstallmentRaw,
  CreditListFilters,
  CreditProduct,
  CreditProductRaw,
  CreditRaw,
  CreditStatus,
  EarlySettlementPayload,
  EarlySettlementResult,
  RejectPayload,
  SimulatePayload,
  SimulateResult,
  SimulateResultItem,
} from '../models/credit.model';

/**
 * Convierte un CreditRaw (formato recibido de la API) a un Credit (formato usado en la app).
 * @param raw
 * @returns
 */
function toCredit(raw: CreditRaw): Credit {
  return {
    id: raw.id,
    type: raw.type,
    totalAmount: raw.total_amount,
    installmentsCount: raw.installments_count,
    paymentFrequency: raw.payment_frequency,
    interestRate: raw.interest_rate,
    status: raw.status,
    createdAt: raw.created_at,
    approvedAt: raw.approved_at,
    customerId: raw.customer_id,
    customerName: raw.customer_name,
    customerDni: raw.customer_dni,
    createdById: raw.created_by_id,
    createdByName: raw.created_by_name,
  };
}

/**
 * Convierte un CreditInstallmentRaw (formato recibido de la API) a un CreditInstallment (formato usado en la app).
 * @param raw
 * @returns
 */
function toInstallment(raw: CreditInstallmentRaw): CreditInstallment {
  return {
    id: raw.id,
    installmentNumber: raw.installment_number,
    dueDate: raw.due_date,
    amountDue: raw.amount_due,
    amountPaid: raw.amount_paid,
    penaltyAmount: raw.penalty_amount,
    status: raw.status,
  };
}

/**
 * Convierte un CreditProductRaw (formato recibido de la API) a un CreditProduct (formato usado en la app).
 * @param raw
 * @returns
 */
function toProduct(raw: CreditProductRaw): CreditProduct {
  return {
    id: raw.id,
    quantity: raw.quantity,
    historicalPrice: raw.historical_price,
    productId: raw.product_id,
    productName: raw.product_name,
    historicalRate: raw.historical_rate,
  };
}

/**
 * Convierte un CreditDetailRaw (formato recibido de la API) a un CreditDetail (formato usado en la app).
 * @param raw
 * @returns
 */
function toCreditDetail(raw: CreditDetailRaw): CreditDetail {
  return {
    ...toCredit(raw),
    rejectionReason: raw.rejection_reason,
    notes: raw.notes,
    approvedBy: raw.approved_by,
    customerPhone: raw.customer_phone,
    products: raw.products?.map(toProduct),
    installments: raw.installments.map(toInstallment),
    downPayment: raw.down_payment ?? 0,
    downPaymentMethod: raw.down_payment_method,
    downPaymentTransferReference: raw.down_payment_transfer_reference,
    prepaidInstallments: raw.prepaid_installments ?? 0,
    prepaidInstallmentsMethod: raw.prepaid_installments_method,
    prepaidInstallmentsTransferReference:
      raw.prepaid_installments_transfer_reference,
    settledAt: raw.settled_at,
    settlementAmount: raw.settlement_amount,
    settlementType: raw.settlement_type,
  };
}

/**
 * Convierte un SimulatePayload (formato usado en la app) a un objeto para el cuerpo de la solicitud.
 * @param p
 * @returns
 */
function toSimulateBody(p: SimulatePayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    type: p.type,
    installments_count: p.installmentsCount,
    payment_frequency: p.paymentFrequency,
  };
  if (p.totalAmount !== undefined) body['total_amount'] = p.totalAmount;
  if (p.products) {
    body['products'] = p.products.map((pr) => ({
      product_id: pr.productId,
      quantity: pr.quantity,
    }));
  }
  if (p.downPayment !== undefined && p.downPayment > 0) {
    body['down_payment'] = p.downPayment;
  }
  return body;
}

function toSimulateResult(raw: Record<string, unknown>): SimulateResult {
  const result: SimulateResult = {
    type: raw['type'] as string,
    paymentFrequency: raw['payment_frequency'] as string,
    installmentsCount: raw['installments_count'] as number,
    totalAmount: raw['total_amount'] as number,
    installmentAmount: raw['installment_amount'] as number,
    totalToReturn: raw['total_to_return'] as number,
    note: (raw['note'] as string) ?? '',
  };
  if (Array.isArray(raw['items'])) {
    result.items = (raw['items'] as Record<string, unknown>[]).map(
      (item): SimulateResultItem => ({
        productId: item['product_id'] as string,
        productName: item['product_name'] as string,
        quantity: item['quantity'] as number,
        unitPrice: item['unit_price'] as number,
        lineTotal: item['line_total'] as number,
        rate: item['rate'] as number,
        installmentContribution: item['installment_contribution'] as number,
      }),
    );
  }
  if (raw['down_payment'] !== undefined) {
    result.downPayment = raw['down_payment'] as number;
  }
  if (raw['financed_amount'] !== undefined) {
    result.financedAmount = raw['financed_amount'] as number;
  }
  return result;
}

/**
 * Convierte un CreditCreatePayload (formato usado en la app) a un objeto para el cuerpo de la solicitud.
 * @param p
 * @returns
 */
function toCreateBody(p: CreditCreatePayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    customer_id: p.customerId,
    type: p.type,
    installments_count: p.installmentsCount,
    payment_frequency: p.paymentFrequency,
  };
  if (p.notes) body['notes'] = p.notes;
  if (p.type === 'SALE') {
    body['products'] = p.products.map((pr) => ({
      product_id: pr.productId,
      quantity: pr.quantity,
    }));
    if (p.downPayment !== undefined && p.downPayment > 0) {
      body['down_payment'] = p.downPayment;
      if (p.downPaymentMethod)
        body['down_payment_method'] = p.downPaymentMethod;
      if (p.downPaymentTransferReference)
        body['down_payment_transfer_reference'] =
          p.downPaymentTransferReference;
    }
    if (p.prepaidInstallments !== undefined && p.prepaidInstallments > 0) {
      body['prepaid_installments'] = p.prepaidInstallments;
      if (p.prepaidInstallmentsMethod)
        body['prepaid_installments_method'] = p.prepaidInstallmentsMethod;
      if (p.prepaidInstallmentsTransferReference)
        body['prepaid_installments_transfer_reference'] =
          p.prepaidInstallmentsTransferReference;
    }
  } else {
    body['total_amount'] = p.totalAmount;
  }
  return body;
}

@Injectable({ providedIn: 'root' })
export class CreditsService {
  private readonly api = inject(ApiHttpService);

  /**
   * Simula un crédito según los parámetros proporcionados.
   * @param payload
   * @returns
   */
  simulate(payload: SimulatePayload): Observable<SimulateResult> {
    return this.api
      .post<
        Record<string, unknown>
      >('credits/simulate', toSimulateBody(payload))
      .pipe(map(toSimulateResult));
  }

  /**
   * Lista los créditos según los filtros especificados.
   * @param filters
   * @returns
   */
  list(filters?: CreditListFilters): Observable<Credit[]> {
    const params: Record<string, string> = {};
    if (filters?.status) params['status'] = filters.status;
    if (filters?.type) params['type'] = filters.type;
    if (filters?.customerId) params['customer_id'] = filters.customerId;
    return this.api
      .get<CreditRaw[]>('credits', params)
      .pipe(map((items) => items.map(toCredit)));
  }

  /**
   * Obtiene un crédito por su ID.
   * @param id
   * @returns
   */
  getById(id: string): Observable<CreditDetail> {
    return this.api
      .get<CreditDetailRaw>(`credits/${id}`)
      .pipe(map(toCreditDetail));
  }

  /**
   * Crea un nuevo crédito.
   * @param payload
   * @returns
   */
  create(
    payload: CreditCreatePayload,
  ): Observable<{ id: string; status: CreditStatus }> {
    return this.api.post<{ id: string; status: CreditStatus }>(
      'credits',
      toCreateBody(payload),
    );
  }

  /**
   * Aprueba un crédito.
   * @param id
   * @param payload
   * @returns
   */
  approve(id: string, payload: ApprovePayload): Observable<CreditDetail> {
    const body: Record<string, unknown> = {};
    if (payload.installmentsCount !== undefined) {
      body['installments_count'] = payload.installmentsCount;
    }
    return this.api
      .patch<CreditDetailRaw>(`credits/${id}/approve`, body)
      .pipe(map(toCreditDetail));
  }

  /**
   * Rechaza un crédito.
   * @param id
   * @param payload
   * @returns
   */
  reject(id: string, payload: RejectPayload): Observable<void> {
    return this.api.patch<void>(`credits/${id}/reject`, {
      rejection_reason: payload.rejectionReason,
    });
  }

  /**
   * Realiza un pago anticipado del crédito.
   * @param id
   * @param payload
   * @returns
   */
  earlySettlement(
    id: string,
    payload: EarlySettlementPayload,
  ): Observable<EarlySettlementResult> {
    const body: Record<string, unknown> = {
      payment_method: payload.paymentMethod,
    };
    if (payload.transferReference) {
      body['transfer_reference'] = payload.transferReference;
    }
    return this.api
      .patch<{
        credit_id: string;
        settlement_amount: number;
        payment_method: string;
      }>(`credits/${id}/early-settlement`, body)
      .pipe(
        map((raw) => ({
          creditId: raw.credit_id,
          settlementAmount: raw.settlement_amount,
          paymentMethod: raw.payment_method,
        })),
      );
  }
}

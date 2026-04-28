import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../../../core/http/api-http.service';
import {
  Expense,
  ExpenseCreatePayload,
  ExpenseListFilters,
  ExpensePagedRaw,
  ExpensePagedResponse,
  ExpenseRaw,
} from './expense.model';

/**
 * Convierte un ExpenseRaw (formato recibido de la API) a un Expense (formato usado en la app).
 * @param r
 * @returns
 */
function toExpense(r: ExpenseRaw): Expense {
  return {
    id: r.id,
    amount: r.amount,
    description: r.description,
    paymentMethod: r.payment_method as Expense['paymentMethod'],
    transferReference: r.transfer_reference,
    createdAt: r.created_at,
    createdByName: r.created_by_name,
  };
}

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private readonly api = inject(ApiHttpService);

  /**
   * Obtiene todos los gastos con filtros opcionales.
   * @param filters
   * @returns
   */
  getAll(filters?: ExpenseListFilters): Observable<ExpensePagedResponse> {
    const params: Record<string, string> = {};
    if (filters?.dateFrom) params['date_from'] = filters.dateFrom;
    if (filters?.dateTo) params['date_to'] = filters.dateTo;
    params['page'] = String(filters?.page ?? 1);
    params['limit'] = String(filters?.limit ?? 20);
    return this.api
      .get<ExpensePagedRaw>('expenses', params)
      .pipe(map((r) => ({ rows: r.rows.map(toExpense), total: r.total })));
  }

  /**
   * Obtiene un gasto por su ID.
   * @param id
   * @returns
   */
  getById(id: string): Observable<Expense> {
    return this.api.get<ExpenseRaw>(`expenses/${id}`).pipe(map(toExpense));
  }

  /**
   * Crea un nuevo gasto.
   * @param payload
   * @returns
   */
  create(payload: ExpenseCreatePayload): Observable<Expense> {
    const body: Record<string, unknown> = {
      amount: payload.amount,
      description: payload.description,
      payment_method: payload.paymentMethod,
    };
    if (payload.transferReference) {
      body['transfer_reference'] = payload.transferReference;
    }
    return this.api.post<ExpenseRaw>('expenses', body).pipe(map(toExpense));
  }

  /**
   * Elimina un gasto por su ID.
   * @param id
   * @returns
   */
  remove(id: string): Observable<void> {
    return this.api.delete<void>(`expenses/${id}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../../../core/http/api-http.service';
import {
  Commission,
  CommissionListFilters,
  CommissionRaw,
  LiquidatePayload,
  Liquidation,
  LiquidationRaw,
  Salary,
  SalaryRaw,
  WeeklySummary,
  WeeklySummaryEmployee,
  WeeklySummaryEmployeeRaw,
  WeeklySummaryRaw,
} from '../models/commission.model';

/**
 * Convierte un objeto de tipo CommissionRaw a un objeto de tipo Commission.
 * @param r
 * @returns
 */
function toCommission(r: CommissionRaw): Commission {
  return {
    id: r.id,
    userId: r.user_id,
    creditId: r.credit_id,
    amount: r.amount,
    status: r.status as Commission['status'],
    weekStart: r.week_start,
    weekEnd: r.week_end,
    createdAt: r.created_at,
    userName: r.user_name,
    userRole: r.user_role,
    creditType: r.credit_type as Commission['creditType'],
    creditAmount: r.credit_amount,
    customerName: r.customer_name,
  };
}

/**
 * Convierte un objeto de tipo WeeklySummaryEmployeeRaw a un objeto de tipo WeeklySummaryEmployee.
 * @param r
 * @returns
 */
function toEmployee(r: WeeklySummaryEmployeeRaw): WeeklySummaryEmployee {
  return {
    userId: r.user_id,
    fullName: r.full_name,
    role: r.role,
    commissionsTotal: r.commissions_total,
    earliestWeek: r.earliest_week,
    latestWeek: r.latest_week,
    salaryAmount: r.salary_amount,
    totalNet: r.total_net,
  };
}

/**
 * Convierte un objeto de tipo LiquidationRaw a un objeto de tipo Liquidation.
 * @param r
 * @returns
 */
function toLiquidation(r: LiquidationRaw): Liquidation {
  return {
    id: r.id,
    userId: r.user_id,
    weekStart: r.week_start,
    weekEnd: r.week_end,
    commissionsTotal: r.commissions_total,
    salaryAmount: r.salary_amount,
    totalPaid: r.total_paid,
    paymentMethod: r.payment_method as Liquidation['paymentMethod'],
    transferReference: r.transfer_reference,
    paidAt: r.paid_at,
    paidBy: r.paid_by,
    userName: r.user_name,
    paidByName: r.paid_by_name,
  };
}

/**
 * Convierte un objeto de tipo SalaryRaw a un objeto de tipo Salary.
 * @param r
 * @returns
 */
function toSalary(r: SalaryRaw): Salary {
  return { userId: r.user_id, weeklyAmount: r.weekly_amount, active: r.active };
}

@Injectable({ providedIn: 'root' })
export class CommissionsService {
  private readonly api = inject(ApiHttpService);

  /**
   * Obtiene la lista de comisiones con filtros opcionales.
   * @param filters
   * @returns
   */
  getCommissions(filters?: CommissionListFilters): Observable<Commission[]> {
    const params: Record<string, string> = {};
    if (filters?.userId) params['user_id'] = filters.userId;
    if (filters?.status) params['status'] = filters.status;
    if (filters?.weekStart) params['week_start'] = filters.weekStart;
    return this.api
      .get<CommissionRaw[]>('commissions', params)
      .pipe(map((items) => items.map(toCommission)));
  }

  /**
   * Obtiene el resumen semanal de comisiones.
   * @returns
   */
  getWeeklySummary(): Observable<WeeklySummary> {
    return this.api
      .get<WeeklySummaryRaw>('commissions/weekly-summary')
      .pipe(map((r) => ({ employees: r.employees.map(toEmployee) })));
  }

  /**
   * Obtiene las liquidaciones de comisiones para un usuario específico.
   * @param userId
   * @returns
   */
  getLiquidations(userId?: string): Observable<Liquidation[]> {
    const params: Record<string, string> = {};
    if (userId) params['user_id'] = userId;
    return this.api
      .get<LiquidationRaw[]>('commissions/liquidations', params)
      .pipe(map((items) => items.map(toLiquidation)));
  }

  /**
   * Crea una nueva liquidación de comisiones.
   * @param payload
   * @returns
   */
  liquidate(payload: LiquidatePayload): Observable<Liquidation> {
    const body: Record<string, unknown> = {
      user_id: payload.userId,
      payment_method: payload.paymentMethod,
    };
    if (payload.transferReference)
      body['transfer_reference'] = payload.transferReference;
    return this.api
      .post<LiquidationRaw>('commissions/liquidate', body)
      .pipe(map(toLiquidation));
  }

  /**
   * Obtiene el salario de un usuario específico.
   * @param userId
   * @returns
   */
  getSalary(userId: string): Observable<Salary> {
    return this.api
      .get<SalaryRaw>(`commissions/salary/${userId}`)
      .pipe(map(toSalary));
  }

  /**
   * Establece el salario de un usuario específico.
   * @param userId
   * @param weeklyAmount
   * @returns
   */
  setSalary(userId: string, weeklyAmount: number): Observable<Salary> {
    return this.api
      .put<SalaryRaw>(`commissions/salary/${userId}`, {
        weekly_amount: weeklyAmount,
      })
      .pipe(map(toSalary));
  }
}

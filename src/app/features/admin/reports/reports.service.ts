import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../../../core/http/api-http.service';
import {
  CollectionDailyRaw,
  CollectionDailyRow,
  CollectionReport,
  CollectionReportRaw,
  CollectionSummary,
  CollectionSummaryRaw,
  CollectorReportRow,
  CollectorReportRowRaw,
  OverdueByCustomer,
  OverdueByCustomerRaw,
  OverdueReport,
  OverdueReportRaw,
  OverdueSummary,
  OverdueSummaryRaw,
  PortfolioByStatusType,
  PortfolioByStatusTypeRaw,
  PortfolioReport,
  PortfolioReportRaw,
  ProductReportRow,
  ProductReportRowRaw,
  ReportDateRange,
} from './report.models';

/**
 * Convierte un objeto CollectionSummaryRaw a CollectionSummary.
 * @param r
 * @returns
 */
function toCollectionSummary(r: CollectionSummaryRaw): CollectionSummary {
  return {
    grandTotal: r.grand_total,
    totalCash: r.total_cash,
    totalTransfer: r.total_transfer,
    paymentsCount: r.payments_count,
    avgPayment: r.avg_payment,
  };
}

/**
 * Convierte un objeto CollectionDailyRaw a CollectionDailyRow.
 * @param r
 * @returns
 */
function toCollectionDaily(r: CollectionDailyRaw): CollectionDailyRow {
  return {
    day: r.day,
    total: r.total,
    totalCash: r.total_cash,
    totalTransfer: r.total_transfer,
    paymentsCount: r.payments_count,
  };
}

/**
 * Convierte un objeto CollectionReportRaw a CollectionReport.
 * @param r
 * @returns
 */
function toCollectionReport(r: CollectionReportRaw): CollectionReport {
  return {
    summary: toCollectionSummary(r.summary),
    daily: r.daily.map(toCollectionDaily),
  };
}

/**
 * Convierte un objeto PortfolioByStatusTypeRaw a PortfolioByStatusType.
 * @param r
 * @returns
 */
function toPortfolioRow(r: PortfolioByStatusTypeRaw): PortfolioByStatusType {
  return {
    status: r.status as PortfolioByStatusType['status'],
    type: r.type as PortfolioByStatusType['type'],
    count: r.count,
    totalAmount: r.total_amount,
  };
}

/**
 * Convierte un objeto PortfolioReportRaw a PortfolioReport.
 * @param r
 * @returns
 */
function toPortfolioReport(r: PortfolioReportRaw): PortfolioReport {
  return {
    byStatusType: r.by_status_type.map(toPortfolioRow),
    activePendingBalance: r.active_pending_balance,
  };
}

/**
 * Convierte un objeto OverdueSummaryRaw a OverdueSummary.
 * @param r
 * @returns
 */
function toOverdueSummary(r: OverdueSummaryRaw): OverdueSummary {
  return {
    overdueInstallments: r.overdue_installments,
    totalOverdueAmount: r.total_overdue_amount,
    totalPenalties: r.total_penalties,
    avgDaysOverdue: r.avg_days_overdue,
  };
}

/**
 * Convierte un objeto OverdueByCustomerRaw a OverdueByCustomer.
 * @param r
 * @returns
 */
function toOverdueByCustomer(r: OverdueByCustomerRaw): OverdueByCustomer {
  return {
    customerId: r.customer_id,
    customerName: r.customer_name,
    phone: r.phone,
    overdueCount: r.overdue_count,
    totalOverdue: r.total_overdue,
    maxDaysOverdue: r.max_days_overdue,
  };
}

/**
 * Convierte un objeto OverdueReportRaw a OverdueReport.
 * @param r
 * @returns
 */
function toOverdueReport(r: OverdueReportRaw): OverdueReport {
  return {
    summary: toOverdueSummary(r.summary),
    byCustomer: r.by_customer.map(toOverdueByCustomer),
  };
}

/**
 * Convierte un objeto CollectorReportRowRaw a CollectorReportRow.
 * @param r
 * @returns
 */
function toCollectorRow(r: CollectorReportRowRaw): CollectorReportRow {
  return {
    collectorId: r.collector_id,
    collectorName: r.collector_name,
    totalPayments: r.total_payments,
    approvedCount: r.approved_count,
    rejectedCount: r.rejected_count,
    totalCollected: r.total_collected,
    approvalRate: r.approval_rate,
  };
}

/**
 * Convierte un objeto ProductReportRowRaw a ProductReportRow.
 * @param r
 * @returns
 */
function toProductRow(r: ProductReportRowRaw): ProductReportRow {
  return {
    id: r.id,
    name: r.name,
    currentPrice: r.current_price,
    availableStock: r.available_stock,
    status: r.status as ProductReportRow['status'],
    timesSold: r.times_sold,
    totalUnitsSold: r.total_units_sold,
    totalRevenue: r.total_revenue,
  };
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly api = inject(ApiHttpService);

  /**
   * Obtiene el informe de colección para un rango de fechas.
   * @param range
   * @returns
   */
  getCollectionReport(range: ReportDateRange): Observable<CollectionReport> {
    if (!range.dateFrom || !range.dateTo) {
      return throwError(() => ({
        status: 400,
        message: 'Los parámetros date_from y date_to son obligatorios.',
      }));
    }
    const params = { date_from: range.dateFrom, date_to: range.dateTo };
    return this.api
      .get<CollectionReportRaw>('reports/collection', params)
      .pipe(map(toCollectionReport));
  }

  /**
   * Obtiene el informe de portafolio.
   * @returns
   */
  getPortfolioReport(): Observable<PortfolioReport> {
    return this.api
      .get<PortfolioReportRaw>('reports/portfolio')
      .pipe(map(toPortfolioReport));
  }

  /**
   * Obtiene el informe de vencimientos.
   * @returns
   */
  getOverdueReport(): Observable<OverdueReport> {
    return this.api
      .get<OverdueReportRaw>('reports/overdue')
      .pipe(map(toOverdueReport));
  }

  /**
   * Obtiene el informe de cobradores para un rango de fechas.
   * @param range
   * @returns
   */
  getCollectorsReport(
    range: ReportDateRange,
  ): Observable<CollectorReportRow[]> {
    if (!range.dateFrom || !range.dateTo) {
      return throwError(() => ({
        status: 400,
        message: 'Los parámetros date_from y date_to son obligatorios.',
      }));
    }
    const params = { date_from: range.dateFrom, date_to: range.dateTo };
    return this.api
      .get<CollectorReportRowRaw[]>('reports/collectors', params)
      .pipe(map((items) => items.map(toCollectorRow)));
  }

  /**
   * Obtiene el informe de productos.
   * @returns
   */
  getProductsReport(): Observable<ProductReportRow[]> {
    return this.api
      .get<ProductReportRowRaw[]>('reports/products')
      .pipe(map((items) => items.map(toProductRow)));
  }
}

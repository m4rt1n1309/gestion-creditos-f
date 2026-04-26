export interface CollectionSummary {
  grandTotal: number;
  totalCash: number;
  totalTransfer: number;
  paymentsCount: number;
  avgPayment: number;
}

export interface CollectionDailyRow {
  day: string;
  total: number;
  totalCash: number;
  totalTransfer: number;
  paymentsCount: number;
}

export interface CollectionReport {
  summary: CollectionSummary;
  daily: CollectionDailyRow[];
}

export interface PortfolioByStatusType {
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SETTLED' | 'REJECTED';
  type: 'SALE' | 'LOAN';
  count: number;
  totalAmount: number;
}

export interface PortfolioReport {
  byStatusType: PortfolioByStatusType[];
  activePendingBalance: number;
}

export interface OverdueSummary {
  overdueInstallments: number;
  totalOverdueAmount: number;
  totalPenalties: number;
  avgDaysOverdue: number | null;
}

export interface OverdueByCustomer {
  customerId: string;
  customerName: string;
  phone: string | null;
  overdueCount: number;
  totalOverdue: number;
  maxDaysOverdue: number;
}

export interface OverdueReport {
  summary: OverdueSummary;
  byCustomer: OverdueByCustomer[];
}

export interface CollectorReportRow {
  collectorId: string;
  collectorName: string;
  totalPayments: number;
  approvedCount: number;
  rejectedCount: number;
  totalCollected: number;
  approvalRate: number | null;
}

export interface ProductReportRow {
  id: string;
  name: string;
  currentPrice: number;
  availableStock: number;
  status: 'ACTIVE' | 'INACTIVE';
  timesSold: number;
  totalUnitsSold: number;
  totalRevenue: number;
}

export interface ReportDateRange {
  dateFrom: string;
  dateTo: string;
}

export type ReportTab =
  | 'collection'
  | 'portfolio'
  | 'overdue'
  | 'collectors'
  | 'products';

export interface CollectionSummaryRaw {
  grand_total: number;
  total_cash: number;
  total_transfer: number;
  payments_count: number;
  avg_payment: number;
}

export interface CollectionDailyRaw {
  day: string;
  total: number;
  total_cash: number;
  total_transfer: number;
  payments_count: number;
}

export interface CollectionReportRaw {
  summary: CollectionSummaryRaw;
  daily: CollectionDailyRaw[];
}

export interface PortfolioByStatusTypeRaw {
  status: string;
  type: string;
  count: number;
  total_amount: number;
}

export interface PortfolioReportRaw {
  by_status_type: PortfolioByStatusTypeRaw[];
  active_pending_balance: number;
}

export interface OverdueSummaryRaw {
  overdue_installments: number;
  total_overdue_amount: number;
  total_penalties: number;
  avg_days_overdue: number | null;
}

export interface OverdueByCustomerRaw {
  customer_id: string;
  customer_name: string;
  phone: string | null;
  overdue_count: number;
  total_overdue: number;
  max_days_overdue: number;
}

export interface OverdueReportRaw {
  summary: OverdueSummaryRaw;
  by_customer: OverdueByCustomerRaw[];
}

export interface CollectorReportRowRaw {
  collector_id: string;
  collector_name: string;
  total_payments: number;
  approved_count: number;
  rejected_count: number;
  total_collected: number;
  approval_rate: number | null;
}

export interface ProductReportRowRaw {
  id: string;
  name: string;
  current_price: number;
  available_stock: number;
  status: string;
  times_sold: number;
  total_units_sold: number;
  total_revenue: number;
}

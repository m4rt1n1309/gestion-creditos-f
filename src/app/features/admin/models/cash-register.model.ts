export type DifferenceStatus = 'EXACT' | 'SURPLUS' | 'SHORTAGE';

export interface CashRegisterDashboard {
  date: string;
  cashAmount: number;
  transferAmount: number;
  totalCollected: number;
  totalEgreses: number;
  approvedCount: number;
  pendingCount: number;
  netBalance: number;
  pendingAmount: number;
  downPaymentsTotal: number;
  downPaymentsCount: number;
}

export interface CashRegister {
  id: string;
  registerDate: string;
  totalCollected: number;
  cashAmount: number;
  transferAmount: number;
  declaredCash: number;
  difference: number;
  differenceStatus: DifferenceStatus;
  observations: string | null;
  createdAt: string;
  closedByName: string;
}

export interface CashRegisterFilters {
  dateFrom?: string;
  dateTo?: string;
  differenceStatus?: DifferenceStatus;
}

export interface CashRegisterClosePayload {
  declaredCash: number;
  observations?: string;
  force?: boolean;
}

export interface CashRegisterDashboardRaw {
  date: string;
  cash_amount: number;
  transfer_amount: number;
  total_collected: number;
  total_egreses: number;
  approved_count: number;
  pending_count: number;
  net_balance: number;
  pending_amount: number;
  down_payments_total: number;
  down_payments_count: number;
}

export interface CashRegisterRaw {
  id: string;
  register_date: string;
  total_collected: number;
  cash_amount: number;
  transfer_amount: number;
  declared_cash: number;
  difference: number;
  difference_status: string;
  observations: string | null;
  created_at: string;
  closed_by_name: string;
}

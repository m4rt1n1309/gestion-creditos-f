export type CommissionStatus = 'PENDING' | 'PAID';
export type PaymentMethod = 'CASH' | 'TRANSFER';
export type CreditType = 'SALE' | 'LOAN';

export interface Commission {
  id: string;
  userId: string;
  creditId: string;
  amount: number;
  status: CommissionStatus;
  weekStart: string;
  weekEnd: string;
  createdAt: string;
  userName: string;
  userRole: string;
  creditType: CreditType;
  creditAmount: number;
  customerName: string;
}

export interface CommissionListFilters {
  userId?: string;
  status?: CommissionStatus;
  weekStart?: string;
}

export interface WeeklySummaryEmployee {
  userId: string;
  fullName: string;
  role: string;
  commissionsTotal: number;
  earliestWeek: string | null;
  latestWeek: string | null;
  salaryAmount: number;
  totalNet: number;
}

export interface WeeklySummary {
  employees: WeeklySummaryEmployee[];
}

export interface Liquidation {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  commissionsTotal: number;
  salaryAmount: number;
  totalPaid: number;
  paymentMethod: PaymentMethod;
  transferReference: string | null;
  paidAt: string;
  paidBy: string;
  userName: string;
  paidByName: string;
}

export interface LiquidatePayload {
  userId: string;
  paymentMethod: PaymentMethod;
  transferReference?: string;
}

export interface Salary {
  userId: string;
  weeklyAmount: number;
  active: boolean;
}

export interface CommissionRaw {
  id: string;
  user_id: string;
  credit_id: string;
  amount: number;
  status: string;
  week_start: string;
  week_end: string;
  created_at: string;
  user_name: string;
  user_role: string;
  credit_type: string;
  credit_amount: number;
  customer_name: string;
}

export interface WeeklySummaryEmployeeRaw {
  user_id: string;
  full_name: string;
  role: string;
  commissions_total: number;
  earliest_week: string | null;
  latest_week: string | null;
  salary_amount: number;
  total_net: number;
}

export interface WeeklySummaryRaw {
  employees: WeeklySummaryEmployeeRaw[];
}

export interface LiquidationRaw {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  commissions_total: number;
  salary_amount: number;
  total_paid: number;
  payment_method: string;
  transfer_reference: string | null;
  paid_at: string;
  paid_by: string;
  user_name: string;
  paid_by_name: string;
}

export interface SalaryRaw {
  user_id: string;
  weekly_amount: number;
  active: boolean;
}

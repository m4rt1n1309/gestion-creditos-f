export interface Expense {
  id: string;
  amount: number;
  description: string;
  paymentMethod: 'CASH' | 'TRANSFER';
  transferReference: string | null;
  createdAt: string;
  createdByName: string;
}

export interface ExpenseListFilters {
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseCreatePayload {
  amount: number;
  description: string;
  paymentMethod: 'CASH' | 'TRANSFER';
  transferReference?: string;
}

export interface ExpensePagedResponse {
  rows: Expense[];
  total: number;
}

export interface ExpenseRaw {
  id: string;
  amount: number;
  description: string;
  payment_method: string;
  transfer_reference: string | null;
  created_at: string;
  created_by_name: string;
}

export interface ExpensePagedRaw {
  rows: ExpenseRaw[];
  total: number;
}

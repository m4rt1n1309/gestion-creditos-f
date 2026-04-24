export type CreditStatus =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'SETTLED'
  | 'REJECTED';
export type CreditType = 'SALE' | 'LOAN';
export type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type InstallmentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';

export interface Credit {
  id: string;
  type: CreditType;
  totalAmount: number;
  installmentsCount: number;
  paymentFrequency: PaymentFrequency;
  interestRate: number | null;
  status: CreditStatus;
  createdAt: string;
  approvedAt: string | null;
  customerId: string;
  customerName: string;
  customerDni: string;
  createdById: string | null;
  createdByName: string | null;
}

export interface CreditInstallment {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  penaltyAmount: number;
  status: InstallmentStatus;
}

export interface CreditProduct {
  id: string;
  quantity: number;
  historicalPrice: number;
  productId: string;
  productName: string;
}

export interface CreditDetail extends Credit {
  rejectionReason: string | null;
  notes: string | null;
  approvedBy: string | null;
  customerPhone: string | null;
  products?: CreditProduct[];
  installments: CreditInstallment[];
}

export interface CreditListFilters {
  status?: CreditStatus;
  type?: CreditType;
  customerId?: string;
}

export interface SimulatePayload {
  type: CreditType;
  totalAmount?: number;
  installmentsCount: number;
  paymentFrequency: PaymentFrequency;
  products?: Array<{ productId: string; quantity: number }>;
}

export interface SimulateResult {
  type: string;
  paymentFrequency: string;
  installmentsCount: number;
  totalAmount: number;
  installmentAmount: number;
  totalToReturn: number;
  note: string;
}

export interface SaleCreditPayload {
  customerId: string;
  type: 'SALE';
  installmentsCount: number;
  paymentFrequency: PaymentFrequency;
  products: Array<{ productId: string; quantity: number }>;
  notes?: string;
}

export interface LoanCreditPayload {
  customerId: string;
  type: 'LOAN';
  totalAmount: number;
  installmentsCount: number;
  paymentFrequency: PaymentFrequency;
  notes?: string;
}

export type CreditCreatePayload = SaleCreditPayload | LoanCreditPayload;

export interface CreditRaw {
  id: string;
  type: CreditType;
  total_amount: number;
  installments_count: number;
  payment_frequency: PaymentFrequency;
  interest_rate: number | null;
  status: CreditStatus;
  created_at: string;
  approved_at: string | null;
  customer_id: string;
  customer_name: string;
  customer_dni: string;
  created_by_id: string | null;
  created_by_name: string | null;
}

export interface CreditInstallmentRaw {
  id: string;
  installment_number: number;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  penalty_amount: number;
  status: InstallmentStatus;
}

export interface CreditProductRaw {
  id: string;
  quantity: number;
  historical_price: number;
  product_id: string;
  product_name: string;
}

export interface CreditDetailRaw extends CreditRaw {
  rejection_reason: string | null;
  notes: string | null;
  approved_by: string | null;
  customer_phone: string | null;
  products?: CreditProductRaw[];
  installments: CreditInstallmentRaw[];
}

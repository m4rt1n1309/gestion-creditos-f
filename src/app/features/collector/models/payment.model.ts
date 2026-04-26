export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Payment {
  id: string;
  installmentId: string;
  amountReceived: number;
  paymentMethod: 'CASH' | 'TRANSFER';
  transferReference: string | null;
  status: PaymentStatus;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  installmentNumber: number;
  amountDue: number;
  dueDate: string;
  creditId: string;
  creditType: 'SALE' | 'LOAN';
  customerName: string;
  customerDni: string;
  collectorName: string | null;
}

export interface PaymentDetail extends Payment {
  amountPaid: number;
  penaltyAmount: number;
  customerId: string;
  collectorId: string | null;
}

export interface PaymentListFilters {
  status?: PaymentStatus;
  collectorId?: string;
  installmentId?: string;
}

export interface PaymentCreatePayload {
  installmentId: string;
  amountReceived: number;
  paymentMethod: 'CASH' | 'TRANSFER';
  transferReference?: string;
  notes?: string;
}

export interface PaymentCreateResult {
  id: string;
  installmentId: string;
  amountReceived: number;
  paymentMethod: string;
  status: PaymentStatus;
  createdAt: string;
  warning?: string;
}

// Raw API shapes
export interface PaymentRaw {
  id: string;
  installment_id: string;
  amount_received: number;
  payment_method: 'CASH' | 'TRANSFER';
  transfer_reference: string | null;
  status: PaymentStatus;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  installment_number: number;
  amount_due: number;
  due_date: string;
  credit_id: string;
  credit_type: 'SALE' | 'LOAN';
  customer_name: string;
  customer_dni: string;
  collector_name: string | null;
}

export interface PaymentDetailRaw extends PaymentRaw {
  amount_paid: number;
  penalty_amount: number;
  customer_id: string;
  collector_id: string | null;
}

export interface PaymentCreateResultRaw {
  id: string;
  installment_id: string;
  amount_received: number;
  payment_method: string;
  status: PaymentStatus;
  created_at: string;
  warning?: string;
}

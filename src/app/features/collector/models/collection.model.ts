import { InstallmentStatus } from '../../seller/models/installment.model';

export type CollectionFilter =
  | 'TODAY'
  | 'OVERDUE'
  | 'TODAY_AND_OVERDUE'
  | 'ALL_PENDING';

export interface CollectionSheet {
  id: string;
  sheetDate: string;
  filterUsed: CollectionFilter;
  createdAt: string;
  collectorName: string;
  totalItems: number;
}

export interface CollectionSheetItem {
  orderNumber: number;
  plannedAmount: number;
  installmentId: string;
  installmentNumber: number;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  penaltyAmount: number;
  installmentStatus: InstallmentStatus;
  creditId: string;
  creditType: 'SALE' | 'LOAN';
  customerName: string;
  customerPhone: string | null;
  customerAddress: string | null;
}

export interface CollectionSheetDetail extends CollectionSheet {
  collectorId: string;
  generatedByName: string;
  items: CollectionSheetItem[];
}

// Raw API shapes
export interface CollectionSheetRaw {
  id: string;
  sheet_date: string;
  filter_used: CollectionFilter;
  created_at: string;
  collector_name: string;
  total_items: number;
}

export interface CollectionSheetItemRaw {
  order_number: number;
  planned_amount: number;
  installment_id: string;
  installment_number: number;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  penalty_amount: number;
  installment_status: InstallmentStatus;
  credit_id: string;
  credit_type: 'SALE' | 'LOAN';
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
}

export interface CollectionSheetDetailRaw extends CollectionSheetRaw {
  collector_id: string;
  generated_by_name: string;
  items: CollectionSheetItemRaw[];
}

export const COLLECTION_FILTER_LABELS: Record<CollectionFilter, string> = {
  TODAY: 'Hoy',
  OVERDUE: 'Vencidas',
  TODAY_AND_OVERDUE: 'Hoy y vencidas',
  ALL_PENDING: 'Todas las pendientes',
};

export interface CollectionGeneratePayload {
  collectorId: string;
  date: string;
  filter: CollectionFilter;
}

export interface DelinquencyRow {
  id: string;
  clientName: string;
  dni: string;
  installmentNumber: number;
  amount: number;
  daysOverdue: number;
  delinquencyAmount: number;
  status: DelinquencyStatus;
  collectorName: string | null;
}

export interface DelinquencyStats {
  enMoraCount: number;
  sinAplicar: number;
  aplicada: number;
}

type DelinquencyStatus = 'EN_MORA' | 'SIN_APLICAR';

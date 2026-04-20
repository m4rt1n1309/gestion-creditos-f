import { DelinquencyClient, DelinquencyStats } from '../mock-data.service';

// Pantalla de Mora (mockup pág. 17)
export const MOCK_DELINQUENCY_STATS: DelinquencyStats = {
  enMoraCount: 12,
  sinAplicar: 5_800,
  aplicada: 3_500,
};

export const MOCK_DELINQUENCY_CLIENTS: DelinquencyClient[] = [
  {
    id: 'c-01',
    clientName: 'Juan Pérez',
    dni: '27.123.456',
    installmentNumber: 3,
    amount: 2900,
    daysOverdue: 29,
    delinquencyAmount: 580,
    status: 'SIN_APLICAR',
    dueDate: '2026-03-17',
  },
  {
    id: 'c-02',
    clientName: 'Maria Lucia',
    dni: '28.654.321',
    installmentNumber: 5,
    amount: 1600,
    daysOverdue: 5,
    delinquencyAmount: 50,
    status: 'EN_MORA',
    dueDate: '2026-04-09',
  },
  {
    id: 'c-03',
    clientName: 'Carlos Ruiz',
    dni: '29.987.654',
    installmentNumber: 8,
    amount: 3100,
    daysOverdue: 42,
    delinquencyAmount: 1200,
    status: 'EN_MORA',
    dueDate: '2026-03-03',
  },
];

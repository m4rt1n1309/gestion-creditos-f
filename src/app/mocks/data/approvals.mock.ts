import { PendingApproval } from '../mock-data.service';

// Fiel a la pantalla de Aprobaciones del mockup (pág. 32)
export const MOCK_APPROVALS: PendingApproval[] = [
  {
    id: 'CR001',
    type: 'VENTA',
    clientName: 'Juan Pérez García',
    createdBy: 'María S.',
    amount: 35000,
    installments: 12,
    waitingHours: 4,
    status: 'PENDING_APPROVAL',
    riskLevel: 'MEDIUM',
    createdAt: '2026-04-15T10:30:00',
  },
  {
    id: 'CR002',
    type: 'PRÉSTAMO',
    clientName: 'María López',
    createdBy: 'Carlos L.',
    amount: 15000,
    installments: 6,
    waitingHours: 28,
    status: 'PENDING_APPROVAL',
    riskLevel: 'LOW',
    createdAt: '2026-04-14T10:00:00',
  },
  {
    id: 'CR003',
    type: 'VENTA',
    clientName: 'Carlos Ruiz',
    createdBy: 'María S.',
    amount: 22000,
    installments: 8,
    waitingHours: 52,
    status: 'PENDING_APPROVAL',
    riskLevel: 'HIGH', // alerta roja 52h!!!
    createdAt: '2026-04-13T08:00:00',
  },
];

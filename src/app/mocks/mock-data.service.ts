import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_APPROVALS } from './data/approvals.mock';
import { MOCK_DELINQUENCY_CLIENTS, MOCK_DELINQUENCY_STATS } from './data/delinquency';

// ── Tipos ─────────────────────────────────────────────────────────────────────
export type CreditStatus =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SETTLED'
  | 'EXPIRED';
export type CreditType = 'VENTA' | 'PRÉSTAMO';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type DelinquencyStatus = 'EN_MORA' | 'SIN_APLICAR' | 'APLICADA';

export interface PendingApproval {
  id: string;
  type: CreditType;
  clientName: string;
  createdBy: string;
  amount: number;
  installments: number;
  waitingHours: number;
  status: CreditStatus;
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface DelinquencyStats {
  enMora: number;
  sinAplicar: number;
  aplicada: number;
}

export interface DelinquencyClient {
  id: string;
  clientName: string;
  dni: string;
  installmentNumber: number;
  amount: number;
  daysOverdue: number;
  delinquencyAmount: number;
  status: DelinquencyStatus;
  dueDate: string; // ISO string
}

// ── Servicio ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly LATENCY = 600;
  // Copia mutable en memoria para simular operaciones
  private _approvals = [...MOCK_APPROVALS];

  // ── Aprobaciones ──────────────────────────────────────────────────────────
  getPendingApprovals(): Observable<PendingApproval[]> {
    return of(
      this._approvals.filter((a) => a.status === 'PENDING_APPROVAL'),
    ).pipe(delay(this.LATENCY));
  }

  approveCredit(id: string): Observable<{ ok: boolean }> {
    const idx = this._approvals.findIndex((a) => a.id === id);
    if (idx > -1)
      this._approvals[idx] = { ...this._approvals[idx], status: 'ACTIVE' };
    return of({ ok: true }).pipe(delay(400));
  }

  rejectCredit(id: string, reason: string): Observable<{ ok: boolean }> {
    const idx = this._approvals.findIndex((a) => a.id === id);
    if (idx > -1)
      this._approvals[idx] = { ...this._approvals[idx], status: 'REJECTED' };
    return of({ ok: true }).pipe(delay(400));
  }

  // ── Mora ──────────────────────────────────────────────────────────────────
  getDelinquencyStats(): Observable<DelinquencyStats> {
    return of({ ...MOCK_DELINQUENCY_STATS }).pipe(delay(this.LATENCY));
  }

  getDelinquencyClients(): Observable<DelinquencyClient[]> {
    return of([...MOCK_DELINQUENCY_CLIENTS]).pipe(delay(this.LATENCY));
  }

  applyDelinquency(clientId: string): Observable<{ ok: boolean }> {
    return of({ ok: true }).pipe(delay(400));
  }

  condoneDelinquency(clientId: string): Observable<{ ok: boolean }> {
    return of({ ok: true }).pipe(delay(400));
  }
}

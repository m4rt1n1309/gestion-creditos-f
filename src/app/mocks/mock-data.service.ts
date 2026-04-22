import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { MOCK_APPROVALS } from './data/approvals.mock';
import { MOCK_DELINQUENCY_CLIENTS, MOCK_DELINQUENCY_STATS } from './data/delinquency';
import { MOCK_COLLECTORS, MOCK_PLANILLA, MOCK_PLANILLA_HISTORIAL } from './data/sheet.mock';

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
  enMoraCount: number;
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

export type PaymentStatus = 'PENDIENTE' | 'COBRADO' | 'PARCIAL' | 'EN_MORA';

export interface Collector {
  id: string;
  name: string;
  dni: string;
  zone: string;
  clientCount: number;
}

export interface PlanillaEntry {
  id: string;
  collectorId: string;
  collectorName: string;
  clientName: string;
  clientDni: string;
  creditId: string;
  creditType: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string;
  paymentStatus: PaymentStatus;
  paidAmount?: number;
  paymentDate?: string;
  notes?: string;
}

export interface PlanillaStats {
  totalClients: number;
  totalAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  collectedCount: number;
  pendingCount: number;
  partialCount: number;
  inMoraCount: number;
}

export type PlanillaHistorialStatus = 'EMITIDA' | 'COMPLETA' | 'PARCIAL';
export type CuotasFilter = 'SOLO_VENCIDAS' | 'DEL_DIA' | 'VENCIDAS_HOY' | 'TODAS';

export interface PlanillaHistorial {
  id: string;
  fecha: string;
  collectorId: string;
  collectorName: string;
  clientCount: number;
  totalAmount: number;
  status: PlanillaHistorialStatus;
}

export interface GeneratedPlanillaResult {
  collectorName: string;
  fecha: string;
  clientCount: number;
  totalAmount: number;
  entries: PlanillaEntry[];
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

  // ── Planilla de Cobro ─────────────────────────────────────────────────────
  getCollectors(): Observable<Collector[]> {
    return of([...MOCK_COLLECTORS]).pipe(delay(this.LATENCY));
  }

  getPlanillaByCollector(collectorId: string | null): Observable<PlanillaEntry[]> {
    const entries = collectorId
      ? MOCK_PLANILLA.filter((e) => e.collectorId === collectorId)
      : [...MOCK_PLANILLA];
    return of(entries).pipe(delay(this.LATENCY));
  }

  getPlanillaStats(collectorId: string | null): Observable<PlanillaStats> {
    const entries = collectorId
      ? MOCK_PLANILLA.filter((e) => e.collectorId === collectorId)
      : [...MOCK_PLANILLA];

    const stats: PlanillaStats = {
      totalClients: entries.length,
      totalAmount: entries.reduce((s, e) => s + e.amount, 0),
      collectedAmount: entries.reduce((s, e) => s + (e.paidAmount ?? 0), 0),
      pendingAmount: entries
        .filter((e) => e.paymentStatus === 'PENDIENTE' || e.paymentStatus === 'EN_MORA')
        .reduce((s, e) => s + e.amount, 0),
      collectedCount: entries.filter((e) => e.paymentStatus === 'COBRADO').length,
      pendingCount: entries.filter((e) => e.paymentStatus === 'PENDIENTE').length,
      partialCount: entries.filter((e) => e.paymentStatus === 'PARCIAL').length,
      inMoraCount: entries.filter((e) => e.paymentStatus === 'EN_MORA').length,
    };
    return of(stats).pipe(delay(this.LATENCY));
  }

  registerPayment(
    entryId: string,
    paidAmount: number,
    totalAmount: number,
  ): Observable<{ ok: boolean }> {
    const idx = MOCK_PLANILLA.findIndex((e) => e.id === entryId);
    if (idx > -1) {
      const status: PaymentStatus =
        paidAmount >= totalAmount ? 'COBRADO' : 'PARCIAL';
      MOCK_PLANILLA[idx] = {
        ...MOCK_PLANILLA[idx],
        paymentStatus: status,
        paidAmount,
        paymentDate: new Date().toISOString().split('T')[0],
      };
    }
    return of({ ok: true }).pipe(delay(400));
  }

  generatePlanilla(
    collectorId: string | null,
    fecha: string,
    cuotasFilter: CuotasFilter,
  ): Observable<GeneratedPlanillaResult> {
    const entries = collectorId
      ? MOCK_PLANILLA.filter((e) => e.collectorId === collectorId)
      : [...MOCK_PLANILLA];

    const collectorName = collectorId
      ? (MOCK_COLLECTORS.find((c) => c.id === collectorId)?.name ?? 'Desconocido')
      : 'Todos los cobradores';

    const totalAmount = entries.reduce((s, e) => s + e.amount, 0);

    const result: GeneratedPlanillaResult = {
      collectorName,
      fecha,
      clientCount: entries.length,
      totalAmount,
      entries,
    };

    return of(result).pipe(delay(900));
  }

  getPlanillaHistorial(): Observable<PlanillaHistorial[]> {
    return of([...MOCK_PLANILLA_HISTORIAL]).pipe(delay(this.LATENCY));
  }

  generateAllPlanillas(
    fecha: string,
    cuotasFilter: CuotasFilter,
  ): Observable<GeneratedPlanillaResult[]> {
    const results: GeneratedPlanillaResult[] = MOCK_COLLECTORS.map((c) => {
      const entries = MOCK_PLANILLA.filter((e) => e.collectorId === c.id);
      return {
        collectorName: c.name,
        fecha,
        clientCount: entries.length,
        totalAmount: entries.reduce((s, e) => s + e.amount, 0),
        entries,
      };
    });
    return of(results).pipe(delay(900));
  }

  sendPlanillaToCollector(collectorName: string): Observable<{ ok: boolean }> {
    return of({ ok: true }).pipe(delay(600));
  }
}

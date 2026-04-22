import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';
import { jsPDF } from 'jspdf';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  Collector,
  CuotasFilter,
  GeneratedPlanillaResult,
  MockDataService,
  PaymentMethod,
  PaymentStatus,
  PlanillaEntry,
  PlanillaHistorial,
  PlanillaHistorialStatus,
} from '../../../mocks/mock-data.service';
import { HeaderService } from '../../../core/services/header.service';

@Component({
  selector: 'app-sheet',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgTemplateOutlet,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    DropdownModule,
    SkeletonModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './sheet.component.html',
  styleUrl: './sheet.component.scss',
})
export class SheetComponent implements OnInit, OnDestroy {
  // Datos base
  collectors: Collector[] = [];
  collectorOptions: { label: string; value: string }[] = [];
  loadingCollectors = true;

  // Formulario de generación
  selectedDateStr: string = this.todayStr();
  selectedCollectorId: string | null = null;
  generateForAll = false;
  cuotasFilter: CuotasFilter = 'SOLO_VENCIDAS';

  readonly todayMax: string = this.todayStr();

  readonly cuotasOptions: { label: string; value: CuotasFilter }[] = [
    { label: 'Solo vencidas', value: 'SOLO_VENCIDAS' },
    { label: 'Del día', value: 'DEL_DIA' },
    { label: 'Vencidas+hoy', value: 'VENCIDAS_HOY' },
    { label: 'Todas', value: 'TODAS' },
  ];

  // Resultados — uno (cobrador específico) o varios (todos)
  generatedResult: GeneratedPlanillaResult | null = null;
  generatedResults: GeneratedPlanillaResult[] = [];
  generating = false;

  // Dialogs
  showReviewDialog = false;
  showSendDialog = false;
  activeResult: GeneratedPlanillaResult | null = null;
  reviewEntries: PlanillaEntry[] = [];
  sending = false;

  // Historial
  historial: PlanillaHistorial[] = [];
  loadingHistorial = true;

  private destroy$ = new Subject<void>();

  constructor(
    private data: MockDataService,
    private header: HeaderService,
    readonly msg: MessageService,
  ) {}

  ngOnInit(): void {
    this.header.setTitle('Gestión de Planilla de Cobro');

    this.data
      .getCollectors()
      .pipe(takeUntil(this.destroy$))
      .subscribe((cols) => {
        this.collectors = cols;
        this.collectorOptions = cols.map((c) => ({
          label: `${c.name} — ${c.zone}`,
          value: c.id,
        }));
        this.loadingCollectors = false;
      });

    this.data
      .getPlanillaHistorial()
      .pipe(takeUntil(this.destroy$))
      .subscribe((h) => {
        this.historial = h;
        this.loadingHistorial = false;
      });
  }

  ngOnDestroy(): void {
    this.header.reset();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onGenerateForAllChange(): void {
    if (this.generateForAll) this.selectedCollectorId = null;
  }

  generatePlanilla(): void {
    if (this.generating) return;
    if (!this.generateForAll && !this.selectedCollectorId) {
      this.msg.add({
        severity: 'warn',
        summary: 'Cobrador requerido',
        detail: 'Seleccioná un cobrador o marcá "Generar para TODOS".',
        life: 3000,
      });
      return;
    }

    this.generating = true;
    this.generatedResult = null;
    this.generatedResults = [];

    if (this.generateForAll) {
      this.data
        .generateAllPlanillas(this.selectedDateStr, this.cuotasFilter)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => { this.generating = false; }),
        )
        .subscribe({
          next: (results) => {
            this.generatedResults = results;
            // Agrega una entrada por cobrador al historial como EMITIDA
            const nuevas: PlanillaHistorial[] = results.map((r, i) => ({
              id: `NEW-${Date.now()}-${i}`,
              fecha: this.selectedDateStr,
              collectorId: this.collectors.find((c) => c.name === r.collectorName)?.id ?? '',
              collectorName: r.collectorName,
              clientCount: r.clientCount,
              totalAmount: r.totalAmount,
              status: 'EMITIDA' as PlanillaHistorialStatus,
            }));
            this.historial = [...nuevas, ...this.historial];
          },
          error: () => this.showGenError(),
        });
    } else {
      this.data
        .generatePlanilla(this.selectedCollectorId!, this.selectedDateStr, this.cuotasFilter)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => { this.generating = false; }),
        )
        .subscribe({
          next: (result) => {
            this.generatedResult = result;
            // Agrega la planilla al historial como EMITIDA
            const nueva: PlanillaHistorial = {
              id: `NEW-${Date.now()}`,
              fecha: this.selectedDateStr,
              collectorId: this.selectedCollectorId ?? '',
              collectorName: result.collectorName,
              clientCount: result.clientCount,
              totalAmount: result.totalAmount,
              status: 'EMITIDA',
            };
            this.historial = [nueva, ...this.historial];
          },
          error: () => this.showGenError(),
        });
    }
  }

  // FIX: limpia resultados y desbloquea el formulario
  resetForm(): void {
    this.generatedResult = null;
    this.generatedResults = [];
    this.generateForAll = false;
    this.selectedCollectorId = null;
  }

  get hasResults(): boolean {
    return this.generatedResult !== null || this.generatedResults.length > 0;
  }

  openReview(result: GeneratedPlanillaResult): void {
    this.activeResult = result;
    this.reviewEntries = result.entries;
    this.showReviewDialog = true;
  }

  openSendDialog(result: GeneratedPlanillaResult): void {
    this.activeResult = result;
    this.showSendDialog = true;
  }

  confirmSend(): void {
    if (!this.activeResult || this.sending) return;
    this.sending = true;
    this.data
      .sendPlanillaToCollector(this.activeResult.collectorName)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.sending = false; }),
      )
      .subscribe({
        next: () => {
          this.showSendDialog = false;
          this.msg.add({
            severity: 'success',
            summary: 'Planilla enviada',
            detail: `Enviada a ${this.activeResult!.collectorName}`,
            life: 4000,
          });
        },
        error: () => {
          this.msg.add({ severity: 'error', summary: 'Error al enviar', detail: 'Intentá de nuevo.', life: 3000 });
        },
      });
  }

  // Descarga PDF directo con jsPDF — sin diálogo, sin bloqueo
  downloadPdf(result: GeneratedPlanillaResult): void {
    this.buildPdf(result, false);
  }

  downloadHistorialPdf(item: PlanillaHistorial): void {
    this.buildPdf({
      collectorName: item.collectorName,
      fecha: item.fecha,
      clientCount: item.clientCount,
      totalAmount: item.totalAmount,
      entries: [],
    }, false);
  }

  // Abre tab e invoca el diálogo de impresión del browser — bloqueo esperado
  printPlanilla(result: GeneratedPlanillaResult): void {
    this.openPrintTab(result);
  }

  private buildPdf(result: GeneratedPlanillaResult, _unused: boolean): void {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const mL = 14;                                      // margen izquierdo
    const mR = 14;                                      // margen derecho
    const pageW = doc.internal.pageSize.getWidth();     // 297 mm
    const pageH = doc.internal.pageSize.getHeight();    // 210 mm
    const usableW = pageW - mL - mR;                   // 269 mm

    // ── Encabezado ──────────────────────────────────────────────────────────
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageW, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Planilla de Cobro', mL, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${result.collectorName}  ·  ${this.formatDateDisplay(result.fecha)}  ·  ${result.clientCount} clientes  ·  Total: ${this.formatCurrency(result.totalAmount)}`,
      pageW - mR, 12, { align: 'right' },
    );

    // ── Definición de columnas ───────────────────────────────────────────────
    const cols: { header: string; width: number; align: 'left' | 'center' | 'right' }[] = [
      { header: 'Cliente',       width: 55, align: 'left'   },
      { header: 'DNI',           width: 24, align: 'left'   },
      { header: 'Crédito',       width: 20, align: 'left'   },
      { header: 'Cuota',         width: 15, align: 'center' },
      { header: 'Monto',         width: 38, align: 'right'  },
      { header: 'Monto Cobrado', width: 38, align: 'right'  },
      { header: 'Método',        width: 30, align: 'center' },
      { header: 'Vencimiento',   width: 25, align: 'center' },
      { header: 'Estado',        width: 24, align: 'center' },
    ];

    const rowH  = 6;
    const hdrH  = 7.5;
    let y = 22;

    const drawHeader = () => {
      doc.setFillColor(30, 41, 59);
      doc.rect(mL, y, usableW, hdrH, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      let x = mL;
      for (const col of cols) {
        const tx = col.align === 'right'  ? x + col.width - 2
                 : col.align === 'center' ? x + col.width / 2
                 : x + 2;
        doc.text(col.header.toUpperCase(), tx, y + 5, { align: col.align });
        x += col.width;
      }
      y += hdrH;
    };

    drawHeader();

    // ── Filas ────────────────────────────────────────────────────────────────
    if (result.entries.length === 0) {
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.text('Sin detalle disponible', mL + usableW / 2, y + 10, { align: 'center' });
    } else {
      doc.setFontSize(7.5);

      result.entries.forEach((entry, idx) => {
        if (y + rowH > pageH - 14) {
          doc.addPage();
          y = 14;
          drawHeader();
        }

        if (idx % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(mL, y, usableW, rowH, 'F');
        }

        const rowData = [
          entry.clientName,
          entry.clientDni,
          entry.creditId,
          `${entry.installmentNumber}/${entry.totalInstallments}`,
          this.formatCurrency(entry.amount),
          entry.paidAmount != null ? this.formatCurrency(entry.paidAmount) : '—',
          entry.paymentMethod === 'EFECTIVO' ? 'Efectivo'
            : entry.paymentMethod === 'TRANSFERENCIA' ? 'Transf.'
            : '—',
          this.formatDateDisplay(entry.dueDate),
          this.paymentStatusLabel(entry.paymentStatus),
        ];

        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');

        let x = mL;
        cols.forEach((col, ci) => {
          const tx = col.align === 'right'  ? x + col.width - 2
                   : col.align === 'center' ? x + col.width / 2
                   : x + 2;

          let text = rowData[ci];
          const maxW = col.width - 4;
          while (doc.getTextWidth(text) > maxW && text.length > 1) {
            text = text.slice(0, -1);
          }
          if (rowData[ci].length > text.length) text += '…';

          doc.text(text, tx, y + 4, { align: col.align });
          x += col.width;
        });

        doc.setDrawColor(229, 231, 235);
        doc.line(mL, y + rowH, mL + usableW, y + rowH);
        y += rowH;
      });
    }

    // ── Pie de página ────────────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generado el ${new Date().toLocaleDateString('es-AR')}  ·  Página ${p} de ${totalPages}`,
        pageW - mR, pageH - 6, { align: 'right' },
      );
    }

    const slug = result.collectorName.toLowerCase().replace(/\s+/g, '-');
    doc.save(`planilla-${slug}-${result.fecha}.pdf`);
  }

  // Tab con vista previa + botón Imprimir (bloqueo esperado y aceptado)
  private openPrintTab(result: GeneratedPlanillaResult): void {
    const fecha = this.formatDateDisplay(result.fecha);
    const rows = result.entries
      .map(
        (e) => `<tr>
          <td>${e.clientName}</td>
          <td style="font-family:monospace;font-size:11px">${e.clientDni}</td>
          <td style="font-family:monospace">${e.creditId}</td>
          <td style="text-align:center">${e.installmentNumber}/${e.totalInstallments}</td>
          <td style="text-align:right;font-family:monospace">${this.formatCurrency(e.amount)}</td>
          <td style="text-align:center">${this.formatDateDisplay(e.dueDate)}</td>
        </tr>`,
      )
      .join('');

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Planilla — ${result.collectorName}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:12px;background:#f3f4f6}
  .bar{position:sticky;top:0;background:#1e293b;color:#fff;padding:10px 24px;display:flex;align-items:center;justify-content:space-between}
  .bar span{font-size:13px;font-weight:600}
  .btn{background:#3b82f6;color:#fff;border:none;padding:7px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer}
  .btn:hover{background:#2563eb}
  .page{background:#fff;max-width:900px;margin:24px auto;padding:28px 32px;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,.1)}
  .meta{display:flex;justify-content:space-between;border-bottom:2px solid #1e293b;padding-bottom:14px;margin-bottom:18px}
  h1{font-size:20px;font-weight:900;color:#1e293b}
  .sub{font-size:12px;color:#6b7280;margin-top:3px}
  .amt{font-size:22px;font-weight:900;color:#1d4ed8;text-align:right}
  .lbl{font-size:10px;color:#9ca3af;text-transform:uppercase;text-align:right}
  table{width:100%;border-collapse:collapse}
  th{background:#1e293b;color:#fff;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase}
  td{padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:11px}
  tr:nth-child(even) td{background:#f9fafb}
  .foot{margin-top:14px;font-size:10px;color:#9ca3af;text-align:right}
  @media print{body{background:#fff}.bar{display:none}.page{box-shadow:none;margin:0;padding:16px}}
</style></head><body>
<div class="bar">
  <span>Planilla — ${result.collectorName} — ${fecha}</span>
  <button class="btn" onclick="window.print()">🖨 Imprimir</button>
</div>
<div class="page">
  <div class="meta">
    <div><h1>Planilla de Cobro</h1><p class="sub">${result.collectorName} · ${fecha}</p></div>
    <div><div class="lbl">Total a cobrar</div><div class="amt">${this.formatCurrency(result.totalAmount)}</div><div class="lbl">${result.clientCount} clientes</div></div>
  </div>
  <table>
    <thead><tr><th>Cliente</th><th>DNI</th><th>Crédito</th><th style="text-align:center">Cuota</th><th style="text-align:right">Monto</th><th style="text-align:center">Vencimiento</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="foot">Generado el ${new Date().toLocaleDateString('es-AR')} — Sistema de Gestión de Créditos</div>
</div></body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const tab  = window.open(url, '_blank');
    if (!tab) {
      this.msg.add({ severity: 'warn', summary: 'Popup bloqueado', detail: 'Habilitá ventanas emergentes para imprimir.', life: 4000 });
    }
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  private paymentStatusLabel(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      COBRADO: 'Cobrado', PENDIENTE: 'Pendiente', PARCIAL: 'Parcial', EN_MORA: 'En mora',
    };
    return map[status] ?? status;
  }

  historialStatusLabel(status: PlanillaHistorialStatus): string {
    const map: Record<PlanillaHistorialStatus, string> = {
      EMITIDA: 'Emitida',
      COMPLETA: 'Completa',
      PARCIAL: 'Parcial',
    };
    return map[status];
  }

  historialStatusSeverity(
    status: PlanillaHistorialStatus,
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const map: Record<PlanillaHistorialStatus, 'success' | 'info' | 'warning' | 'danger' | 'secondary'> = {
      EMITIDA: 'info',
      COMPLETA: 'success',
      PARCIAL: 'warning',
    };
    return map[status];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatDateDisplay(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  private showGenError(): void {
    this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar la planilla.', life: 3000 });
  }

  private todayStr(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

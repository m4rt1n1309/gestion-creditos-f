import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG — en Standalone cada componente importa solo lo que usa
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { DateService } from '../../../core/services/date.service';
import {
  MockDataService,
  PendingApproval,
} from '../../../mocks/mock-data.service';

@Component({
  selector: 'approvals',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    TableModule,
    TagModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    SkeletonModule,
    TooltipModule,
    DialogModule,
    CardModule,
    BadgeModule,
    DropdownModule,
    DatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.scss',
})
export class ApprovalsComponent implements OnInit, OnDestroy {
  readonly REJECT_REASONS = [
    'Cliente con mora activa',
    'Monto excede capacidad de pago',
    'Documentación insuficiente',
    'Decisión comercial',
    'Otro',
  ];

  approvals: PendingApproval[] = [];
  loading = true;
  processingId: string | null = null;
  showRejectDialog = false;
  rejectingRow: PendingApproval | null = null;
  rejectReason = '';
  rejectDetail = '';
  processingReject = false;

  private destroy$ = new Subject<void>();

  constructor(
    private data: MockDataService,
    private msg: MessageService,
    private confirm: ConfirmationService,
    public dateService: DateService,
  ) {}

  ngOnInit(): void {
    this.loadApprovals();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga las aprobaciones pendientes desde el servicio.
   * Maneja el estado de carga y errores.
   */
  private loadApprovals(): void {
    this.loading = true;
    this.data
      .getPendingApprovals()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.approvals = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  /**
   * Maneja la aprobación de una solicitud. Muestra un confirm dialog y, si se acepta, llama al servicio para aprobar. Mientras se procesa, bloquea los botones para evitar acciones duplicadas.
   * @param row
   * @returns
   */
  onApprove(row: PendingApproval): void {
    if (this.processingId) return;

    this.confirm.confirm({
      message: `¿Aprobar la operación de <strong>${row.clientName}</strong> por $${row.amount.toLocaleString()}?`,
      header: 'Confirmar aprobación',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Sí, aprobar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.processingId = `${row.id}_approve`;

        this.data
          .approveCredit(row.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.approvals = this.approvals.filter((a) => a.id !== row.id);
              this.processingId = null;
              this.msg.add({
                severity: 'success',
                summary: 'Aprobado',
                detail: `Crédito de ${row.clientName} aprobado. Se generó el cronograma de cuotas.`,
                life: 4000,
              });
            },
            error: () => {
              this.processingId = null;
              this.msg.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo aprobar. Intentá nuevamente.',
              });
            },
          });
      },
    });
  }

  /**
   *  Maneja el rechazo de una solicitud. Abre un diálogo para seleccionar el motivo de rechazo y, al confirmar, llama al servicio para rechazar. Mientras se procesa, bloquea los botones para evitar acciones duplicadas.
   * @param row
   * @returns
   */
  onReject(row: PendingApproval): void {
    if (this.processingId) return;
    this.rejectingRow = row;
    this.rejectReason = '';
    this.rejectDetail = '';
    this.showRejectDialog = true;
  }

  confirmReject(): void {
    if (!this.rejectReason || !this.rejectingRow) return;
    this.processingReject = true;

    this.data
      .rejectCredit(this.rejectingRow.id, this.rejectReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.approvals = this.approvals.filter(
            (approval) => approval.id !== this.rejectingRow!.id,
          );
          this.processingReject = false;
          this.showRejectDialog = false;
          this.msg.add({
            severity: 'info',
            summary: 'Rechazado',
            detail: `${this.rejectingRow!.clientName} — ${this.rejectReason}`,
            life: 4000,
          });
          this.rejectingRow = null;
        },
        error: () => {
          this.processingReject = false;
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo rechazar.',
          });
        },
      });
  }
}

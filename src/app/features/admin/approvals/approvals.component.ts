import { Component, OnInit, OnDestroy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG — en Standalone cada componente importa solo lo que usa
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import {
  MockDataService,
  PendingApproval,
} from '../../../mocks/mock-data.service';
import { DateService } from '../../../core/services/date.service';

@Component({
  selector: 'approvals',
  standalone: true,
  imports: [
    CurrencyPipe,
    TableModule,
    TagModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    SkeletonModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.scss',
})
export class ApprovalsComponent implements OnInit, OnDestroy {
  approvals: PendingApproval[] = [];
  loading = true;
  processingId: string | null = null;

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
   * Maneja el rechazo de una solicitud. Muestra un confirm dialog y, si se acepta, llama al servicio para rechazar. Mientras se procesa, bloquea los botones para evitar acciones duplicadas.
   * @param row
   * @returns
   */
  onReject(row: PendingApproval): void {
    if (this.processingId) return;

    // TODO Semana 2: abrir un Dialog con el selector de motivo (mockup pág. 33)
    // Por ahora: confirm dialog simple
    this.confirm.confirm({
      message: `¿Rechazar la operación de <strong>${row.clientName}</strong>?`,
      header: 'Confirmar rechazo',
      icon: 'pi pi-times-circle',
      acceptLabel: 'Sí, rechazar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.processingId = `${row.id}_reject`;

        this.data
          .rejectCredit(row.id, 'Decisión comercial')
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.approvals = this.approvals.filter((a) => a.id !== row.id);
              this.processingId = null;
              this.msg.add({
                severity: 'info',
                summary: 'Rechazado',
                detail: row.clientName,
                life: 3000,
              });
            },
            error: () => {
              this.processingId = null;
              this.msg.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo rechazar.',
              });
            },
          });
      },
    });
  }
}

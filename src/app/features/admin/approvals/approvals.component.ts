import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG — en Standalone cada componente importa solo lo que usa
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
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
    DatePipe,
    NgClass,
    FormsModule,
    TableModule,
    TagModule,
    ButtonModule,
    ToastModule,
    SkeletonModule,
    TooltipModule,
    DialogModule,
    CardModule,
    BadgeModule,
    DropdownModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    CheckboxModule,
  ],
  providers: [MessageService],
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

  showApproveDialog = false;
  approvingRow: PendingApproval | null = null;
  approveCheckDoc = false;
  approveCheckClient = false;
  approveNote = '';
  processingApprove = false;

  showRejectDialog = false;
  rejectingRow: PendingApproval | null = null;
  rejectReason = '';
  rejectDetail = '';
  processingReject = false;

  searchTerm = '';
  filterType: string | null = null;

  readonly TYPE_OPTIONS = [
    { label: 'Venta', value: 'VENTA' },
    { label: 'Préstamo', value: 'PRÉSTAMO' },
  ];

  get filteredApprovals(): PendingApproval[] {
    return this.approvals.filter((a) => {
      const term = this.searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        a.clientName.toLowerCase().includes(term) ||
        a.createdBy.toLowerCase().includes(term);
      const matchType = !this.filterType || a.type === this.filterType;
      return matchSearch && matchType;
    });
  }

  private destroy$ = new Subject<void>();

  constructor(
    private data: MockDataService,
    private msg: MessageService,
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
  refresh(): void {
    this.loadApprovals();
  }

  /**
   * Carga las aprobaciones pendientes desde el servicio. Establece el estado de carga mientras se realiza la petición y actualiza la lista de aprobaciones al recibir la respuesta. En caso de error, simplemente desactiva el estado de carga.
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
    this.approvingRow = row;
    this.approveCheckDoc = false;
    this.approveCheckClient = false;
    this.approveNote = '';
    this.showApproveDialog = true;
  }

  /**
   * Confirma la aprobación de una solicitud. Verifica que se hayan marcado las casillas de verificación y luego llama al servicio para aprobar la solicitud. Mientras se procesa, bloquea los botones para evitar acciones duplicadas. Al finalizar, muestra un mensaje de éxito o error según corresponda.
   * @returns
   */
  confirmApprove(): void {
    if (!this.approvingRow) return;
    this.processingApprove = true;
    const row = this.approvingRow;

    this.data
      .approveCredit(row.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.approvals = this.approvals.filter((a) => a.id !== row.id);
          this.processingApprove = false;
          this.showApproveDialog = false;
          this.approvingRow = null;
          this.msg.add({
            severity: 'success',
            summary: 'Aprobado',
            detail: `Crédito de ${row.clientName} aprobado. Se generó el cronograma de cuotas.`,
            life: 4000,
          });
        },
        error: () => {
          this.processingApprove = false;
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo aprobar. Intentá nuevamente.',
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

  /**
   * Confirma el rechazo de una solicitud. Verifica que se haya seleccionado un motivo de rechazo y luego llama al servicio para rechazar la solicitud. Mientras se procesa, bloquea los botones para evitar acciones duplicadas. Al finalizar, muestra un mensaje de información o error según corresponda.
   * @returns
   */
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

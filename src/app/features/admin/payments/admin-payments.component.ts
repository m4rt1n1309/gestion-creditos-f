import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AppError } from '../../../core/models/app-error';
import { HeaderService } from '../../../core/services/header.service';
import { ErrorStateComponent } from '../../../shared/states/error-state/error-state.component';
import { LoadingStateComponent } from '../../../shared/states/loading-state/loading-state.component';
import {
  Payment,
  PaymentDetail,
  PaymentStatus,
} from '../../collector/models/payment.model';
import { PaymentsService } from '../../collector/payments.service';
import { User } from '../users/user.model';
import { UsersService } from '../users/users.service';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    DialogModule,
    DropdownModule,
    InputTextareaModule,
    SkeletonModule,
    ToastModule,
    TooltipModule,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  providers: [MessageService],
  templateUrl: './admin-payments.component.html',
})
export class AdminPaymentsComponent implements OnInit {
  private readonly paymentsService = inject(PaymentsService);
  private readonly usersService = inject(UsersService);
  private readonly header = inject(HeaderService);
  private readonly msg = inject(MessageService);

  payments: Payment[] = [];
  collectors: User[] = [];
  loading = true;
  error: AppError | null = null;

  filterStatus: PaymentStatus | null = null;
  filterCollectorId: string | null = null;

  showDetailDialog = false;
  selectedPayment: PaymentDetail | null = null;
  loadingDetail = false;

  showRejectDialog = false;
  rejectReason = '';
  processingReject = false;
  processingApprove = false;

  readonly STATUS_OPTIONS = [
    { label: 'Pendiente', value: 'PENDING' as PaymentStatus },
    { label: 'Aprobado', value: 'APPROVED' as PaymentStatus },
    { label: 'Rechazado', value: 'REJECTED' as PaymentStatus },
  ];

  /**
   * Devuelve las opciones de cobradores para el filtro, formateando cada cobrador como un objeto con propiedades `label` (nombre completo del cobrador) y `value` (ID del cobrador).
   */
  get collectorOptions(): { label: string; value: string }[] {
    return this.collectors.map((c) => ({ label: c.fullName, value: c.id }));
  }

  /**
   * Devuelve la lista de cobros filtrada según el estado y el cobrador seleccionados. Si no se ha seleccionado ningún filtro, devuelve la lista completa de cobros. Este método se utiliza para mostrar solo los cobros que coinciden con los criterios de filtrado seleccionados por el usuario en la interfaz.
   */
  get filteredPayments(): Payment[] {
    return this.payments.filter((p) => {
      const matchStatus = !this.filterStatus || p.status === this.filterStatus;
      const matchCollector =
        !this.filterCollectorId ||
        p.collectorName ===
          this.collectors.find((c) => c.id === this.filterCollectorId)
            ?.fullName;
      return matchStatus && matchCollector;
    });
  }

  /**
   * Devuelve el número de caracteres restantes para el motivo de rechazo.
   * @returns
   */
  rejectCharCount(): number {
    return this.rejectReason.length;
  }

  ngOnInit(): void {
    this.header.set([{ label: 'Cobros' }]);
    this.usersService.listCollectors().subscribe((c) => (this.collectors = c));
    this.load();
  }

  /**
   * Devuelve la severidad del estado del cobro.
   * @param status
   * @returns
   */
  statusSeverity(
    status: PaymentStatus,
  ): 'success' | 'warning' | 'danger' | 'secondary' {
    return { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' }[
      status
    ] as any;
  }

  /**
   * Devuelve la etiqueta del estado del cobro.
   * @param status
   * @returns
   */
  statusLabel(status: PaymentStatus): string {
    return {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
    }[status];
  }

  /**
   * Refresca la lista de cobros aplicando los filtros seleccionados.
   */
  refresh(): void {
    this.load();
  }

  /**
   * Abre el diálogo de detalles para un cobro específico.
   * @param payment
   */
  openDetail(payment: Payment): void {
    this.showDetailDialog = true;
    this.selectedPayment = null;
    this.loadingDetail = true;
    this.paymentsService.getById(payment.id).subscribe({
      next: (detail) => {
        this.selectedPayment = detail;
        this.loadingDetail = false;
      },
      error: () => {
        this.loadingDetail = false;
        this.showDetailDialog = false;
      },
    });
  }

  /**
   * Abre el diálogo de rechazo para un cobro específico.
   */
  openRejectDialog(): void {
    this.rejectReason = '';
    this.showRejectDialog = true;
  }

  /**
   * Confirma la aprobación de un cobro específico.
   * @returns
   */
  confirmApprove(): void {
    if (!this.selectedPayment) return;
    this.processingApprove = true;
    this.paymentsService.approve(this.selectedPayment.id).subscribe({
      next: (detail) => {
        this.processingApprove = false;
        this.showDetailDialog = false;
        const isPaid = detail.amountPaid >= detail.amountDue;
        this.msg.add({
          severity: 'success',
          summary: 'Cobro aprobado',
          detail: isPaid
            ? 'Cobro aprobado. La cuota quedó pagada.'
            : 'Cobro aprobado correctamente.',
          life: 5000,
        });
        this.updatePaymentInList(detail.id, 'APPROVED');
      },
      error: (err: AppError) => {
        this.processingApprove = false;
        this.msg.add({
          severity: err.status === 409 ? 'warn' : 'error',
          summary: err.status === 409 ? 'Advertencia' : 'Error',
          detail: err.message ?? 'No se pudo aprobar.',
        });
      },
    });
  }

  /**
   * Confirma el rechazo de un cobro específico.
   * @returns
   */
  confirmReject(): void {
    if (!this.selectedPayment || this.rejectReason.length < 5) return;
    this.processingReject = true;
    this.paymentsService
      .reject(this.selectedPayment.id, this.rejectReason)
      .subscribe({
        next: () => {
          this.processingReject = false;
          this.showRejectDialog = false;
          this.showDetailDialog = false;
          this.msg.add({
            severity: 'info',
            summary: 'Cobro rechazado',
            detail: 'El cobro fue rechazado.',
            life: 4000,
          });
          this.updatePaymentInList(this.selectedPayment!.id, 'REJECTED');
        },
        error: (err: AppError) => {
          this.processingReject = false;
          this.msg.add({
            severity: err.status === 409 ? 'warn' : 'error',
            summary: err.status === 409 ? 'Advertencia' : 'Error',
            detail: err.message ?? 'No se pudo rechazar.',
          });
        },
      });
  }

  /**
   *  Actualiza el estado de un cobro específico en la lista de cobros.
   * @param id
   * @param status
   */
  private updatePaymentInList(id: string, status: PaymentStatus): void {
    this.payments = this.payments.map((p) =>
      p.id === id ? { ...p, status } : p,
    );
  }

  /**
   * Carga la lista de cobros. Si la carga es exitosa, actualiza la lista de cobros y el estado de carga. Si ocurre un error, almacena el error para mostrarlo en la interfaz y actualiza el estado de carga.
   */
  private load(): void {
    this.loading = true;
    this.error = null;
    this.paymentsService.list().subscribe({
      next: (data) => {
        this.payments = data;
        this.loading = false;
      },
      error: (err: AppError) => {
        this.error = err;
        this.loading = false;
      },
    });
  }
}

import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AppError } from '../../../../core/models/app-error';
import { HeaderService } from '../../../../core/services/header.service';
import { ErrorStateComponent } from '../../../../shared/states/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/states/loading-state/loading-state.component';
import {
  CreditDetail,
  CreditStatus,
  InstallmentStatus,
} from '../../models/credit.model';
import { CreditsService } from '../credits.service';

@Component({
  selector: 'app-credit-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    TableModule,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './credit-detail.component.html',
})
export class CreditDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly creditsService = inject(CreditsService);
  private readonly location = inject(Location);
  private readonly header = inject(HeaderService);

  credit: CreditDetail | null = null;
  loading = false;
  error: AppError | null = null;

  /**
   * Obtener el ID del crédito desde la ruta. Se asume que la ruta es algo como /seller/operations/credits/:id
   */
  private get creditId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.header.set([
      { label: 'Operaciones', route: '/seller/operations' },
      { label: 'Detalle' },
    ]);
    this.load();
  }

  /**
   * Navegar hacia atrás en el historial del navegador. Esto es útil para volver a la lista de créditos después de ver el detalle de uno específico.
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Obtiene la etiqueta legible para un estado de crédito.
   * @param status
   * @returns
   */
  statusLabel(status: CreditStatus): string {
    const map: Record<CreditStatus, string> = {
      PENDING_APPROVAL: 'Pendiente de aprobación',
      ACTIVE: 'Activo',
      SETTLED: 'Liquidado',
      REJECTED: 'Rechazado',
    };
    return map[status];
  }

  /**
   * Obtiene la severidad para un estado de crédito.
   * @param status
   * @returns
   */
  statusSeverity(
    status: CreditStatus,
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<
      CreditStatus,
      'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast'
    > = {
      PENDING_APPROVAL: 'warning',
      ACTIVE: 'success',
      SETTLED: 'secondary',
      REJECTED: 'danger',
    };
    return map[status];
  }

  /**
   * Obtiene la severidad para un estado de cuota.
   * @param status
   * @returns
   */
  installmentSeverity(
    status: InstallmentStatus,
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<
      InstallmentStatus,
      'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast'
    > = {
      PENDING: 'info',
      PAID: 'success',
      OVERDUE: 'danger',
      PARTIAL: 'warning',
    };
    return map[status] ?? 'secondary';
  }

  /**
   * Obtiene la etiqueta legible para un estado de cuota.
   * @param status
   * @returns
   */
  installmentLabel(status: InstallmentStatus): string {
    const map: Record<InstallmentStatus, string> = {
      PENDING: 'Pendiente',
      PAID: 'Pagada',
      OVERDUE: 'Vencida',
      PARTIAL: 'Parcial',
    };
    return map[status] ?? status;
  }

  /**
   * Obtiene la etiqueta legible para una frecuencia de pago.
   * @param frequency
   * @returns
   */
  frequencyLabel(frequency: string): string {
    const map: Record<string, string> = {
      WEEKLY: 'Semanal',
      BIWEEKLY: 'Quincenal',
      MONTHLY: 'Mensual',
    };
    return map[frequency] ?? frequency;
  }

  /**
   * Carga el detalle del crédito desde el servicio. Maneja los estados de carga y error para mostrar la información adecuada en la interfaz de usuario.
   */
  private load(): void {
    this.loading = true;
    this.error = null;
    this.creditsService.getById(this.creditId).subscribe({
      next: (data) => {
        this.credit = data;
        this.header.set([
          { label: 'Operaciones', route: '/seller/operations' },
          {
            label: `${data.type === 'SALE' ? 'Venta' : 'Préstamo'} — ${data.customerName}`,
          },
        ]);
        this.loading = false;
      },
      error: (err: AppError) => {
        this.error = err;
        this.loading = false;
      },
    });
  }
}

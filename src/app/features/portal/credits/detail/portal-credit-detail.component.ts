import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import {
  PortalCreditDetail,
  PortalInstallment,
} from '../../models/portal.models';
import { PortalService } from '../../portal.service';
import { AppRoutes } from '../../../../shared/models/enums/routes.enum';

@Component({
  selector: 'app-portal-credit-detail',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    ButtonModule,
    TagModule,
    SkeletonModule,
  ],
  templateUrl: './portal-credit-detail.component.html',
})
export class PortalCreditDetailComponent implements OnInit {
  private readonly portalService = inject(PortalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  credit: PortalCreditDetail | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.portalService.getCreditById(id).subscribe({
      next: (data) => {
        this.credit = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message ?? 'Error al cargar el crédito.';
      },
    });
  }

  back(): void {
    this.router.navigate([AppRoutes.PORTAL_CREDITS]);
  }

  /**
   * Devuelve una etiqueta legible para la frecuencia de pago del crédito.
   */
  get frequencyLabel(): string {
    switch (this.credit?.paymentFrequency) {
      case 'WEEKLY':
        return 'Semanal';
      case 'BIWEEKLY':
        return 'Quincenal';
      case 'MONTHLY':
        return 'Mensual';
      default:
        return this.credit?.paymentFrequency ?? '';
    }
  }

  /**
   * Calcula el total pagado sumando los montos pagados de cada cuota.
   */
  get totalPaid(): number {
    return (this.credit?.installments ?? []).reduce(
      (sum, i) => sum + i.amountPaid,
      0,
    );
  }

  /**
   * Calcula el saldo pendiente sumando las diferencias entre monto debido y monto pagado de las cuotas que no están completamente pagadas.
   */
  get pendingBalance(): number {
    return (this.credit?.installments ?? [])
      .filter((i) => i.status !== 'PAID')
      .reduce((sum, i) => sum + (i.amountDue - i.amountPaid), 0);
  }

  /**
   * Devuelve una etiqueta legible para el estado de una cuota.
   * @param status
   * @returns
   */
  installmentLabel(status: PortalInstallment['status']): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'OVERDUE':
        return 'Vencida';
      case 'PARTIAL':
        return 'Parcial';
      case 'PAID':
        return 'Pagada';
    }
  }

  /**
   * Devuelve el severidad para el estado de una cuota.
   * @param status
   * @returns
   */
  installmentSeverity(
    status: PortalInstallment['status'],
  ): 'info' | 'danger' | 'warning' | 'success' {
    switch (status) {
      case 'PENDING':
        return 'info';
      case 'OVERDUE':
        return 'danger';
      case 'PARTIAL':
        return 'warning';
      case 'PAID':
        return 'success';
    }
  }
}

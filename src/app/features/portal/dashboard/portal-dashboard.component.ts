import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AccountSummary, UpcomingInstallment } from '../models/portal.models';
import { PortalService } from '../portal.service';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    ButtonModule,
    TagModule,
    TableModule,
    SkeletonModule,
  ],
  templateUrl: './portal-dashboard.component.html',
})
export class PortalDashboardComponent implements OnInit {
  private readonly portalService = inject(PortalService);

  summary: AccountSummary | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    this.portalService.getAccountSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message ?? 'Error al cargar el resumen.';
      },
    });
  }

  /**
   * Devuelve una etiqueta descriptiva basada en el indicador de estado del resumen de la cuenta.
   */
  get statusLabel(): string {
    switch (this.summary?.statusIndicator) {
      case 'GREEN':
        return 'Tu cuenta está al día';
      case 'YELLOW':
        return 'Tenés cuotas vencidas';
      case 'RED':
        return 'Tenés varias cuotas vencidas — comunicate con el negocio';
      default:
        return '';
    }
  }

  /**
   * Devuelve una etiqueta descriptiva basada en el estado de la cuota.
   * @param status
   * @returns
   */
  statusLabel_(status: UpcomingInstallment['status']): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'OVERDUE':
        return 'Vencida';
      case 'PARTIAL':
        return 'Parcial';
    }
  }

  /**
   * Devuelve el severidad basada en el estado de la cuota.
   * @param status
   * @returns
   */
  statusSeverity(
    status: UpcomingInstallment['status'],
  ): 'info' | 'danger' | 'warning' {
    switch (status) {
      case 'PENDING':
        return 'info';
      case 'OVERDUE':
        return 'danger';
      case 'PARTIAL':
        return 'warning';
    }
  }
}

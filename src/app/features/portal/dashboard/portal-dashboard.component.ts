import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { AccountSummary, PortalCredit } from '../models/portal.models';
import { PortalAuthService } from '../auth/portal-auth.service';
import { PortalService } from '../portal.service';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink, SkeletonModule],
  templateUrl: './portal-dashboard.component.html',
})
export class PortalDashboardComponent implements OnInit {
  private readonly portalService = inject(PortalService);
  private readonly authService = inject(PortalAuthService);

  summary: AccountSummary | null = null;
  credits: PortalCredit[] = [];
  loading = true;
  error = '';

  get customerName(): string {
    return this.authService.snapshot?.fullName ?? '';
  }

  get firstName(): string {
    return this.customerName.split(' ')[0] ?? this.customerName;
  }

  get activeCredits(): PortalCredit[] {
    return this.credits.filter((c) => c.status === 'ACTIVE');
  }

  get totalInstallments(): number {
    return this.credits.reduce((acc, c) => acc + c.totalInstallments, 0);
  }

  get totalPaidInstallments(): number {
    return this.credits.reduce((acc, c) => acc + c.paidInstallments, 0);
  }

  get nextDue(): PortalCredit | null {
    return (
      this.activeCredits
        .filter((c) => c.nextDueDate)
        .sort(
          (a, b) =>
            new Date(a.nextDueDate!).getTime() -
            new Date(b.nextDueDate!).getTime(),
        )[0] ?? null
    );
  }

  /**
   * Calcula la cantidad de días restantes hasta una fecha dada (generalmente la próxima fecha de vencimiento de cuota). Si la fecha es nula, devuelve null. Si la fecha ya pasó, devuelve un número negativo indicando los días de atraso.
   * @param dateStr
   * @returns
   */
  daysUntil(dateStr: string | null): number | null {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcula el porcentaje de avance de un crédito basado en las cuotas pagadas. Si el crédito no tiene cuotas, devuelve 0 para evitar división por cero. El porcentaje se redondea al número entero más cercano.
   * @param credit
   * @returns
   */
  progressPercent(credit: PortalCredit): number {
    if (!credit.totalInstallments) return 0;
    return Math.round(
      (credit.paidInstallments / credit.totalInstallments) * 100,
    );
  }

  /**
   * Devuelve la etiqueta correspondiente al tipo de crédito.
   * @param credit
   * @returns
   */
  creditLabel(credit: PortalCredit): string {
    return credit.type === 'LOAN' ? 'Préstamo' : 'Venta a crédito';
  }

  /**
   * Devuelve la referencia correspondiente al crédito.
   * @param credit
   * @returns
   */
  creditRef(credit: PortalCredit): string {
    const year = new Date(credit.createdAt).getFullYear();
    return `CR-${year}-${credit.id.substring(0, 4).toUpperCase()}`;
  }

  ngOnInit(): void {
    forkJoin({
      summary: this.portalService.getAccountSummary(),
      credits: this.portalService.getCredits(),
    }).subscribe({
      next: ({ summary, credits }) => {
        this.summary = summary;
        this.credits = credits;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message ?? 'Error al cargar el resumen.';
      },
    });
  }
}

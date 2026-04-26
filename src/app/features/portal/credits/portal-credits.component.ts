import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { PortalService } from '../portal.service';
import { PortalCredit } from '../models/portal.models';
import { AppRoutes } from '../../../shared/models/enums/routes.enum';

@Component({
  selector: 'app-portal-credits',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    TagModule,
    ProgressBarModule,
    SkeletonModule,
  ],
  templateUrl: './portal-credits.component.html',
})
export class PortalCreditsComponent implements OnInit {
  private readonly portalService = inject(PortalService);
  private readonly router = inject(Router);

  credits: PortalCredit[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.portalService.getCredits().subscribe({
      next: (data) => {
        this.credits = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message ?? 'Error al cargar los créditos.';
      },
    });
  }

  /**
   * Calcula el porcentaje de progreso para un crédito dado.
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
   * Navega a la vista detallada de un crédito.
   * @param id
   */
  goToDetail(id: string): void {
    this.router.navigate([AppRoutes.PORTAL_CREDIT_DETAIL, id]);
  }
}

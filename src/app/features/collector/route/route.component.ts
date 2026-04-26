import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CurrencyArsPipe } from '../../../core/pipes/currency-ars.pipe';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AppError } from '../../../core/models/app-error';
import { HeaderService } from '../../../core/services/header.service';
import { ErrorStateComponent } from '../../../shared/states/error-state/error-state.component';
import { LoadingStateComponent } from '../../../shared/states/loading-state/loading-state.component';
import { CollectionsService } from '../collections.service';
import {
  COLLECTION_FILTER_LABELS,
  CollectionFilter,
  CollectionSheet,
} from '../models/collection.model';
import { Payment } from '../models/payment.model';
import { PaymentsService } from '../payments.service';

@Component({
  selector: 'app-route',
  standalone: true,
  imports: [
    CurrencyArsPipe,
    DatePipe,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    SkeletonModule,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './route.component.html',
  styleUrl: './route.component.scss',
})
export class RouteComponent implements OnInit {
  private readonly collectionsService = inject(CollectionsService);
  private readonly paymentsService = inject(PaymentsService);
  private readonly router = inject(Router);
  private readonly header = inject(HeaderService);

  sheets: CollectionSheet[] = [];
  recentPayments: Payment[] = [];
  loadingSheets = true;
  loadingPayments = true;
  errorSheets: AppError | null = null;

  today = new Date();

  ngOnInit(): void {
    this.header.set([{ label: 'Mi Ruta' }]);
    this.loadSheets();
    this.loadRecentPayments();
  }

  /**
   * Obtiene la etiqueta correspondiente a un filtro de colección.
   * @param f
   * @returns
   */
  filterLabel(f: CollectionFilter): string {
    return COLLECTION_FILTER_LABELS[f];
  }

  /**
   * Navega a la vista de una planilla específica.
   * @param sheet
   */
  goToSheet(sheet: CollectionSheet): void {
    this.router.navigate(['/collector/route', sheet.id]);
  }

  /**
   * Carga la lista de planillas.
   */
  private loadSheets(): void {
    this.loadingSheets = true;
    this.collectionsService.list().subscribe({
      next: (data) => {
        this.sheets = data;
        this.loadingSheets = false;
      },
      error: (err: AppError) => {
        this.errorSheets = err;
        this.loadingSheets = false;
      },
    });
  }

  /**
   * Carga los pagos recientes.
   */
  private loadRecentPayments(): void {
    this.loadingPayments = true;
    this.paymentsService.list({ status: 'PENDING' }).subscribe({
      next: (data) => {
        this.recentPayments = data;
        this.loadingPayments = false;
      },
      error: () => {
        this.loadingPayments = false;
      },
    });
  }
}

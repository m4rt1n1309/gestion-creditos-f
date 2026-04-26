import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppError } from '../../../core/models/app-error';
import { HeaderService } from '../../../core/services/header.service';
import { ErrorStateComponent } from '../../../shared/states/error-state/error-state.component';
import { LoadingStateComponent } from '../../../shared/states/loading-state/loading-state.component';
import {
  CollectionReport,
  CollectorReportRow,
  OverdueReport,
  PortfolioReport,
  ProductReportRow,
  ReportTab,
} from './report.models';
import { ReportsService } from './reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    ButtonModule,
    CardModule,
    SkeletonModule,
    TableModule,
    TagModule,
    TooltipModule,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit, OnDestroy {
  private readonly service = inject(ReportsService);
  private readonly header = inject(HeaderService);
  private destroy$ = new Subject<void>();

  activeTab: ReportTab = 'collection';
  private loaded = new Set<ReportTab>();

  collectionDateFrom: string;
  collectionDateTo: string;
  collectionReport: CollectionReport | null = null;
  loadingCollection = false;
  errorCollection: AppError | null = null;
  collectionDateError = '';

  portfolioReport: PortfolioReport | null = null;
  loadingPortfolio = false;
  errorPortfolio: AppError | null = null;

  overdueReport: OverdueReport | null = null;
  loadingOverdue = false;
  errorOverdue: AppError | null = null;

  collectorsDateFrom: string;
  collectorsDateTo: string;
  collectorsRows: CollectorReportRow[] = [];
  loadingCollectors = false;
  errorCollectors: AppError | null = null;
  collectorsDateError = '';

  productRows: ProductReportRow[] = [];
  loadingProducts = false;
  errorProducts: AppError | null = null;

  readonly TABS: { id: ReportTab; label: string; icon: string }[] = [
    { id: 'collection', label: 'Recaudación', icon: 'pi pi-money-bill' },
    { id: 'portfolio', label: 'Cartera', icon: 'pi pi-briefcase' },
    { id: 'overdue', label: 'Mora', icon: 'pi pi-exclamation-triangle' },
    { id: 'collectors', label: 'Cobradores', icon: 'pi pi-users' },
    { id: 'products', label: 'Productos', icon: 'pi pi-box' },
  ];

  readonly STATUS_LABELS: Record<string, string | undefined> = {
    PENDING_APPROVAL: 'Pend. aprobación',
    ACTIVE: 'Activo',
    SETTLED: 'Cancelado',
    REJECTED: 'Rechazado',
  };

  readonly TYPE_LABELS: Record<string, string | undefined> = {
    SALE: 'Venta',
    LOAN: 'Préstamo',
  };

  constructor() {
    const { from, to } = this.defaultRange();
    this.collectionDateFrom = from;
    this.collectionDateTo = to;
    this.collectorsDateFrom = from;
    this.collectorsDateTo = to;
  }

  ngOnInit(): void {
    this.header.set([{ label: 'Reportes' }]);
    this.activateTab('collection');
  }

  ngOnDestroy(): void {
    this.header.reset();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setea la pestaña activa y carga los datos si no se habían cargado antes.
   * @param tab
   */
  setTab(tab: ReportTab): void {
    this.activeTab = tab;
    this.activateTab(tab);
  }

  /**
   * Activa una pestaña y carga sus datos si no se han cargado antes.
   * @param tab
   * @returns
   */
  private activateTab(tab: ReportTab): void {
    if (this.loaded.has(tab)) return;
    this.loaded.add(tab);
    switch (tab) {
      case 'collection':
        this.fetchCollection();
        break;
      case 'portfolio':
        this.fetchPortfolio();
        break;
      case 'overdue':
        this.fetchOverdue();
        break;
      case 'collectors':
        this.fetchCollectors();
        break;
      case 'products':
        this.fetchProducts();
        break;
    }
  }

  /**
   * Valida el rango de fechas y carga el reporte de recaudación. Si el rango no es válido, muestra un mensaje de error específico.
   */
  get collectionRangeValid(): boolean {
    return !!(
      this.collectionDateFrom &&
      this.collectionDateTo &&
      this.collectionDateFrom <= this.collectionDateTo
    );
  }

  /**
   * Consulta el reporte de recaudación con el rango de fechas seleccionado.
   * @returns
   */
  consultCollection(): void {
    this.collectionDateError = '';
    if (!this.collectionDateFrom || !this.collectionDateTo) {
      this.collectionDateError = 'Seleccioná ambas fechas.';
      return;
    }
    if (this.collectionDateFrom > this.collectionDateTo) {
      this.collectionDateError =
        'La fecha desde no puede ser posterior a la fecha hasta.';
      return;
    }
    this.collectionReport = null;
    this.fetchCollection();
  }

  /**
   * Consulta el reporte de recaudación.
   * @returns
   */
  private fetchCollection(): void {
    if (!this.collectionRangeValid) return;
    this.loadingCollection = true;
    this.errorCollection = null;
    this.service
      .getCollectionReport({
        dateFrom: this.collectionDateFrom,
        dateTo: this.collectionDateTo,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingCollection = false;
        }),
      )
      .subscribe({
        next: (r) => {
          this.collectionReport = r;
        },
        error: (err: AppError) => {
          this.errorCollection = err;
        },
      });
  }

  /**
   * Consulta el reporte de cartera.
   */
  private fetchPortfolio(): void {
    this.loadingPortfolio = true;
    this.errorPortfolio = null;
    this.service
      .getPortfolioReport()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingPortfolio = false;
        }),
      )
      .subscribe({
        next: (r) => {
          this.portfolioReport = r;
        },
        error: (err: AppError) => {
          this.errorPortfolio = err;
        },
      });
  }

  /**
   * Consulta el reporte de mora.
   */
  private fetchOverdue(): void {
    this.loadingOverdue = true;
    this.errorOverdue = null;
    this.service
      .getOverdueReport()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingOverdue = false;
        }),
      )
      .subscribe({
        next: (r) => {
          this.overdueReport = r;
        },
        error: (err: AppError) => {
          this.errorOverdue = err;
        },
      });
  }

  /**
   * Valida el rango de fechas y carga el reporte de cobradores. Si el rango no es válido, muestra un mensaje de error específico.
   */
  get collectorsRangeValid(): boolean {
    return !!(
      this.collectorsDateFrom &&
      this.collectorsDateTo &&
      this.collectorsDateFrom <= this.collectorsDateTo
    );
  }

  /**
   * Consulta el reporte de cobradores con el rango de fechas seleccionado.
   * @returns
   */
  consultCollectors(): void {
    this.collectorsDateError = '';
    if (!this.collectorsDateFrom || !this.collectorsDateTo) {
      this.collectorsDateError = 'Seleccioná ambas fechas.';
      return;
    }
    if (this.collectorsDateFrom > this.collectorsDateTo) {
      this.collectorsDateError =
        'La fecha desde no puede ser posterior a la fecha hasta.';
      return;
    }
    this.collectorsRows = [];
    this.fetchCollectors();
  }

  /**
   * Consulta el reporte de cobradores.
   * @returns
   */
  private fetchCollectors(): void {
    if (!this.collectorsRangeValid) return;
    this.loadingCollectors = true;
    this.errorCollectors = null;
    this.service
      .getCollectorsReport({
        dateFrom: this.collectorsDateFrom,
        dateTo: this.collectorsDateTo,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingCollectors = false;
        }),
      )
      .subscribe({
        next: (r) => {
          this.collectorsRows = r;
        },
        error: (err: AppError) => {
          this.errorCollectors = err;
        },
      });
  }

  /**
   * Consulta el reporte de productos.
   */
  private fetchProducts(): void {
    this.loadingProducts = true;
    this.errorProducts = null;
    this.service
      .getProductsReport()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingProducts = false;
        }),
      )
      .subscribe({
        next: (r) => {
          this.productRows = r;
        },
        error: (err: AppError) => {
          this.errorProducts = err;
        },
      });
  }

  /**
   * Retorna el rango de fechas por defecto.
   * @returns
   */
  private defaultRange(): { from: string; to: string } {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 30);
    return { from: this.toIso(from), to: this.toIso(today) };
  }

  /**
   * Convierte una fecha a formato ISO.
   * @param d
   * @returns
   */
  private toIso(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  /**
   * Formatea un valor numérico como moneda.
   * @param v
   * @returns
   */
  formatCurrency(v: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(v);
  }

  /**
   * Formatea una fecha en formato DD/MM/YYYY.
   * @param iso
   * @returns
   */
  formatDate(iso: string): string {
    if (!iso) return '—';
    const [y, m, d] = iso.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  }

  /**
   * Formatea una tasa de interés.
   * @param rate
   * @returns
   */
  formatRate(rate: number | null): string {
    return rate == null ? '—' : `${rate.toFixed(2)}%`;
  }
}

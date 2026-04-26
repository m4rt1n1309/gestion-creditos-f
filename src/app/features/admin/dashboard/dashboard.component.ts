import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CurrencyArsPipe } from '../../../core/pipes/currency-ars.pipe';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Subject, forkJoin } from 'rxjs';
import { catchError, of, takeUntil } from 'rxjs';
import { MockAuthService } from '../../../core/auth/mock-auth.service';
import { DateService } from '../../../core/services/date.service';
import { FormatService } from '../../../core/services/format.service';
import { CashRegisterService } from '../cash-register/cash-register.service';
import { KpiCard } from '../models/interface/kpi-card';
import { RecentOperation } from '../models/interface/recent-operation';
import { ReportsService } from '../reports/reports.service';
import { CreditsService } from '../../seller/operations/credits.service';
import { MONTH_LIST } from '../utils/month-list';
import { STATUS_CLIENT } from '../utils/status-client';
import { Credit } from '../../seller/models/credit.model';

const TYPE_LABEL: Record<string, string> = { SALE: 'VENTA', LOAN: 'PRÉSTAMO' };
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Activo',
  PENDING_APPROVAL: 'Pendiente',
  SETTLED: 'Liquidado',
  REJECTED: 'Rechazado',
};

/**
 * Convierte un crédito a una operación reciente.
 * @param credit
 * @returns
 */
function creditToOp(credit: Credit): RecentOperation {
  const dateParts = credit.createdAt?.slice(5, 10).replace('-', '/') ?? '';
  return {
    date: dateParts,
    client: credit.customerName,
    type: (TYPE_LABEL[credit.type] ?? credit.type) as RecentOperation['type'],
    amount: credit.totalAmount,
    installments: String(credit.installmentsCount),
    status: STATUS_LABEL[credit.status] ?? credit.status,
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyArsPipe,
    TableModule,
    TagModule,
    SkeletonModule,
    CardModule,
    ChartModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly auth = inject(MockAuthService);
  private readonly cashRegisterSvc = inject(CashRegisterService);
  private readonly reportsSvc = inject(ReportsService);
  private readonly creditsSvc = inject(CreditsService);
  private readonly dateService = inject(DateService);
  private readonly fmt = inject(FormatService);

  userName = '';
  today = '';
  loadingKpis = true;
  loadingOps = true;
  kpis: KpiCard[] = [];
  recentOps: RecentOperation[] = [];
  opsError = false;

  lineData: any;
  lineOptions: any;
  pieData: any;
  pieOptions: any;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.userName = this.auth.snapshot?.name ?? 'Administrador';
    this.today = this.dateService.display(new Date(), "EEEE d 'de' MMMM, yyyy");
    this.loadKpis();
    this.loadRecentOps();
    this.initCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los KPIs para el dashboard. Realiza llamadas paralelas a los servicios de caja, cartera y morosidad, manejando errores individualmente para cada uno y actualizando el estado de carga y los datos de los KPIs en consecuencia.
   */
  private loadKpis(): void {
    this.loadingKpis = true;

    const cashRegister$ = this.cashRegisterSvc
      .getDashboard()
      .pipe(catchError(() => of(null)));
    const portfolio$ = this.reportsSvc
      .getPortfolioReport()
      .pipe(catchError(() => of(null)));
    const overdue$ = this.reportsSvc
      .getOverdueReport()
      .pipe(catchError(() => of(null)));

    forkJoin([cashRegister$, portfolio$, overdue$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([cashReg, portfolio, overdue]) => {
        const activeCount = portfolio
          ? portfolio.byStatusType
              .filter((r) => r.status === 'ACTIVE')
              .reduce((s, r) => s + r.count, 0)
          : 0;

        this.kpis = [
          {
            label: 'Cartera Activa',
            value: portfolio ? this.fmt.currency(portfolio.activePendingBalance) : '–',
            trend: 'Cartera actual',
            trendUp: true,
            icon: 'pi pi-dollar text-blue-600',
            iconBg: 'bg-blue-50',
          },
          {
            label: 'Créditos Activos',
            value: portfolio ? this.fmt.number(activeCount) : '–',
            trend: 'Créditos activos',
            trendUp: true,
            icon: 'pi pi-file text-green-600',
            iconBg: 'bg-green-50',
          },
          {
            label: 'En Mora',
            value: overdue
              ? this.fmt.number(overdue.summary.overdueInstallments)
              : '–',
            trend: 'Cuotas en mora',
            trendUp: false,
            icon: 'pi pi-exclamation-triangle text-orange-500',
            iconBg: 'bg-orange-50',
          },
          {
            label: 'Cobrado Hoy',
            value: cashReg ? this.fmt.currency(cashReg.totalCollected) : '–',
            trend: 'Datos de hoy',
            trendUp: true,
            icon: 'pi pi-wallet text-purple-600',
            iconBg: 'bg-purple-50',
          },
        ];
        this.loadingKpis = false;
      });
  }

  /**
   * Carga las operaciones recientes para el dashboard. Realiza una llamada al servicio de créditos para obtener la lista de créditos, transformándolos en operaciones recientes y manejando errores en caso de que la carga falle.
   */
  private loadRecentOps(): void {
    this.loadingOps = true;
    this.opsError = false;
    this.creditsSvc
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (credits) => {
          this.recentOps = credits.slice(0, 5).map(creditToOp);
          this.loadingOps = false;
        },
        error: () => {
          this.opsError = true;
          this.loadingOps = false;
        },
      });
  }

  /**
   * Devuelve la severidad del estado de una operación reciente.
   */
  private initCharts(): void {
    const textColor = '#6b7280';
    const gridColor = '#f3f4f6';

    this.lineData = {
      labels: MONTH_LIST,
      datasets: [
        {
          label: 'Cobranza ($)',
          data: [
            32000, 41000, 37500, 48920, 52000, 45000, 61000, 57000, 63000,
            71000, 68000, 75000,
          ],
          fill: true,
          tension: 0.4,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.10)',
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#2563eb',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    this.lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 0 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => ` ${this.fmt.currency(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { size: 11 } },
          grid: { color: gridColor },
          border: { display: false },
        },
        y: {
          ticks: {
            color: textColor,
            font: { size: 11 },
            callback: (v: number) => `$${(v / 1000).toFixed(0)}k`,
          },
          grid: { color: gridColor },
          border: { display: false },
        },
      },
    };

    this.pieData = {
      labels: STATUS_CLIENT,
      datasets: [
        {
          data: [58, 22, 12, 8],
          backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
          hoverBackgroundColor: ['#16a34a', '#2563eb', '#d97706', '#dc2626'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };

    this.pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      layout: { padding: 0 },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            font: { size: 12 },
            padding: 14,
            usePointStyle: true,
            pointStyle: 'rect',
            pointStyleWidth: 12,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}%`,
          },
        },
      },
    };
  }
}

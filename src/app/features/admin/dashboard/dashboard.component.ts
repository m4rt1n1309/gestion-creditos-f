import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Subject } from 'rxjs';
import { MockAuthService } from '../../../core/auth/mock-auth.service';
import { DateService } from '../../../core/services/date.service';
import { MockDataService } from '../../../mocks/mock-data.service';
import { KpiCard } from '../models/interface/kpi-card';
import { RecentOperation } from '../models/interface/recent-operation';
import { MONTH_LIST } from '../utils/month-list';
import { STATUS_CLIENT } from '../utils/status-client';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe,
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
  userName = '';
  today = '';
  loadingKpis = true;
  loadingOps = true;
  kpis: KpiCard[] = [];
  recentOps: RecentOperation[] = [];

  lineData: any;
  lineOptions: any;
  pieData: any;
  pieOptions: any;

  private destroy$ = new Subject<void>();

  constructor(
    private auth: MockAuthService,
    private data: MockDataService,
    private dateService: DateService,
  ) {}

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
   * Inicializa los datos y opciones para los gráficos de líneas y pastel. Los datos son simulados para mostrar tendencias de cobranza y distribución de estados de crédito. Las opciones configuran la apariencia, colores y comportamiento de las leyendas y tooltips.
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
            label: (ctx: any) => ` $${ctx.parsed.y.toLocaleString('es-AR')}`,
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

  /**
   *  Carga los datos de los KPI cards y las operaciones recientes con un retraso simulado para mostrar los skeletons de carga. Los KPI cards muestran métricas clave como cartera activa, créditos activos, en mora y cobrado hoy, mientras que las operaciones recientes muestran transacciones recientes con detalles como fecha, cliente, tipo, monto, cuotas y estado.
   */
  private loadKpis(): void {
    setTimeout(() => {
      this.kpis = [
        {
          label: 'Cartera Activa',
          value: '$2.847.320',
          trend: '+12.4% vs mes anterior',
          trendUp: true,
          icon: 'pi pi-dollar text-blue-600',
          iconBg: 'bg-blue-50',
        },
        {
          label: 'Créditos Activos',
          value: '1.284',
          trend: '+8.1% vs mes anterior',
          trendUp: true,
          icon: 'pi pi-file text-green-600',
          iconBg: 'bg-green-50',
        },
        {
          label: 'En Mora',
          value: '87',
          trend: '-3.2% vs mes anterior',
          trendUp: false,
          icon: 'pi pi-exclamation-triangle text-orange-500',
          iconBg: 'bg-orange-50',
        },
        {
          label: 'Cobrado Hoy',
          value: '$48.920',
          trend: '+5.7% vs ayer',
          trendUp: true,
          icon: 'pi pi-wallet text-purple-600',
          iconBg: 'bg-purple-50',
        },
      ];
      this.loadingKpis = false;
    }, 600);
  }

  /**
   *  Carga las operaciones recientes con un retraso simulado para mostrar el skeleton de carga. Las operaciones incluyen detalles como fecha, cliente, tipo de operación (venta o préstamo), monto, número de cuotas y estado (al día, en mora, vencido). Esta función simula la obtención de datos recientes para mostrar en la tabla del dashboard.
   */
  private loadRecentOps(): void {
    setTimeout(() => {
      this.recentOps = [
        {
          date: '15/04',
          client: 'María García López',
          type: 'VENTA',
          amount: 15000,
          installments: '12/24',
          status: 'Al día',
        },
        {
          date: '15/04',
          client: 'Carlos Mendoza Ruiz',
          type: 'PRÉSTAMO',
          amount: 8500,
          installments: '3/12',
          status: 'En mora',
        },
        {
          date: '14/04',
          client: 'Ana Lucía Torres',
          type: 'VENTA',
          amount: 22000,
          installments: '8/36',
          status: 'Al día',
        },
        {
          date: '13/04',
          client: 'Roberto Sánchez Paz',
          type: 'PRÉSTAMO',
          amount: 5200,
          installments: '1/6',
          status: 'Vencido',
        },
      ];
      this.loadingOps = false;
    }, 800);
  }
}

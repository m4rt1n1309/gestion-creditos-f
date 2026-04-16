import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Subject } from 'rxjs';
import { MockAuthService } from '../../../core/auth/mock-auth.service';
import { DateService } from '../../../core/services/date.service';
import { MockDataService } from '../../../mocks/mock-data.service';
import { KpiCard } from '../models/interface/kpi-card';
import { RecentOperation } from '../models/interface/recent-operation';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, TableModule, TagModule, SkeletonModule, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  userName = '';
  today = '';
  loadingKpis = true;
  loadingOps = true;
  kpis: KpiCard[] = [];
  recentOps: RecentOperation[] = [];

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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Simula carga de KPIs con datos estáticos y un retraso para mostrar el skeleton. En un caso real, aquí se haría una llamada a un servicio para obtener los datos del backend.
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

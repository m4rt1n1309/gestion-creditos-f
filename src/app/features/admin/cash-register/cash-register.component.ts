import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, interval } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { AppError } from '../../../core/models/app-error';
import { HeaderService } from '../../../core/services/header.service';
import { ErrorStateComponent } from '../../../shared/states/error-state/error-state.component';
import { LoadingStateComponent } from '../../../shared/states/loading-state/loading-state.component';
import {
  CashRegister,
  CashRegisterClosePayload,
  CashRegisterDashboard,
  CashRegisterFilters,
  DifferenceStatus,
} from '../models/cash-register.model';
import { CashRegisterService } from './cash-register.service';

@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputNumberModule,
    InputTextareaModule,
    SkeletonModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  providers: [MessageService],
  templateUrl: './cash-register.component.html',
})
export class CashRegisterComponent implements OnInit, OnDestroy {
  private readonly service = inject(CashRegisterService);
  private readonly header = inject(HeaderService);
  private readonly msg = inject(MessageService);
  private destroy$ = new Subject<void>();

  dashboard: CashRegisterDashboard | null = null;
  loadingDashboard = true;
  errorDashboard: AppError | null = null;
  closedToday = false;

  history: CashRegister[] = [];
  loadingHistory = true;
  errorHistory: AppError | null = null;

  filterDateFrom: string | null = null;
  filterDateTo: string | null = null;

  showCloseDialog = false;
  declaredCash: number | null = null;
  observations = '';
  closing = false;

  showDetailDialog = false;
  selectedRegister: CashRegister | null = null;

  ngOnInit(): void {
    this.header.set([{ label: 'Caja' }]);
    this.loadDashboard();
    this.loadHistory();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.header.reset();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicia un polling que actualiza el dashboard cada minuto para mantener los datos frescos, especialmente si hay otras personas usando el sistema y cerrando cajas. El historial no se actualiza automáticamente para no interferir con la revisión de datos históricos, pero se puede actualizar manualmente con los filtros.
   */
  private startPolling(): void {
    interval(60_000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.service.getDashboard()),
      )
      .subscribe({
        next: (d) => {
          this.dashboard = d;
        },
      });
  }

  /**
   * Carga los datos del dashboard, incluyendo el estado actual de la caja del día. Si la caja ya fue cerrada, se muestra un mensaje informativo. Cualquier error durante la carga se muestra en pantalla.
   */
  loadDashboard(): void {
    this.loadingDashboard = true;
    this.errorDashboard = null;
    this.service
      .getDashboard()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingDashboard = false;
        }),
      )
      .subscribe({
        next: (d) => {
          this.dashboard = d;
        },
        error: (err: AppError) => {
          this.errorDashboard = err;
        },
      });
  }

  /**
   * Carga el historial de cajas cerradas, aplicando los filtros de fecha si están establecidos. Mientras se cargan los datos, se muestra un indicador de carga. Si ocurre un error, se muestra un mensaje de error en pantalla.
   */
  loadHistory(): void {
    this.loadingHistory = true;
    this.errorHistory = null;
    const filters: CashRegisterFilters = {};
    if (this.filterDateFrom) filters.dateFrom = this.filterDateFrom;
    if (this.filterDateTo) filters.dateTo = this.filterDateTo;
    this.service
      .getAll(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingHistory = false;
        }),
      )
      .subscribe({
        next: (history) => {
          this.history = history;
        },
        error: (err: AppError) => {
          this.errorHistory = err;
        },
      });
  }

  /**
   * Abre el diálogo para cerrar la caja del día. Se precarga el monto declarado con el total de efectivo registrado en el dashboard para facilitar el proceso. Al confirmar el cierre, se envía la información al servicio y se maneja la respuesta para actualizar la interfaz y mostrar mensajes informativos o de error según corresponda.
   */
  openCloseDialog(): void {
    this.declaredCash = this.dashboard?.cashAmount ?? 0;
    this.observations = '';
    this.showCloseDialog = true;
  }

  /**
   * Confirma el cierre de la caja del día.
   * @returns
   */
  confirmClose(): void {
    if (this.declaredCash == null) return;
    const payload: CashRegisterClosePayload = {
      declaredCash: this.declaredCash,
    };
    if (this.observations.trim())
      payload.observations = this.observations.trim();
    this.closing = true;
    this.service
      .close(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.closing = false;
        }),
      )
      .subscribe({
        next: (reg) => {
          this.showCloseDialog = false;
          this.closedToday = true;
          this.history = [reg, ...this.history];
          this.msg.add({
            severity: 'success',
            summary: 'Caja cerrada',
            detail: 'Cierre de caja registrado correctamente.',
            life: 5000,
          });
          this.selectedRegister = reg;
          this.showDetailDialog = true;
          this.loadDashboard();
        },
        error: (err: AppError) => {
          if (err.status === 409) {
            this.closedToday = true;
            this.showCloseDialog = false;
            this.msg.add({
              severity: 'warn',
              summary: 'Caja ya cerrada',
              detail: err.message,
              life: 5000,
            });
          } else {
            this.msg.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message ?? 'No se pudo cerrar la caja.',
              life: 5000,
            });
          }
        },
      });
  }

  /**
   * Abre el diálogo de detalles para una caja cerrada específica.
   * @param reg
   */
  openDetail(reg: CashRegister): void {
    this.selectedRegister = reg;
    this.showDetailDialog = true;
  }

  /**
   * Aplica los filtros de fecha para actualizar el historial de cajas cerradas. Si se han establecido fechas de filtro, se cargarán los datos correspondientes a ese rango. Si no hay filtros, se cargará todo el historial disponible.
   */
  applyFilters(): void {
    this.loadHistory();
  }

  /**
   * Limpia los filtros de fecha y recarga el historial completo de cajas cerradas. Esto permite al usuario volver a ver todo el historial sin restricciones de fecha después de haber aplicado algún filtro.
   */
  clearFilters(): void {
    this.filterDateFrom = null;
    this.filterDateTo = null;
    this.loadHistory();
  }

  /**
   * Devuelve la etiqueta correspondiente al estado de diferencia.
   * @param status
   * @returns
   */
  differenceLabel(status: DifferenceStatus): string {
    return { BALANCED: 'Cuadrada', SURPLUS: 'Sobrante', SHORTAGE: 'Faltante' }[
      status
    ];
  }

  /**
   * Devuelve el severidad correspondiente al estado de diferencia.
   * @param status
   * @returns
   */
  differenceSeverity(
    status: DifferenceStatus,
  ): 'success' | 'warning' | 'danger' {
    return { BALANCED: 'success', SURPLUS: 'warning', SHORTAGE: 'danger' }[
      status
    ] as 'success' | 'warning' | 'danger';
  }

  /**
   * Formatea un valor numérico como moneda.
   * @param value
   * @returns
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Formatea una fecha en formato dd/mm/yyyy.
   * @param iso
   * @returns
   */
  formatDate(iso: string): string {
    if (!iso) return '—';
    const d = iso.split('T')[0].split('-');
    return `${d[2]}/${d[1]}/${d[0]}`;
  }
}

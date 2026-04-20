import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  DelinquencyClient,
  DelinquencyStats,
  MockDataService,
} from '../../../mocks/mock-data.service';

@Component({
  selector: 'app-delinquency',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    SkeletonModule,
    InputTextModule,
    DropdownModule,
    CardModule,
  ],
  providers: [MessageService],
  templateUrl: './delinquency.component.html',
  styleUrl: './delinquency.component.scss',
})
export class DelinquencyComponent implements OnInit, OnDestroy {
  stats: DelinquencyStats = { enMoraCount: 0, sinAplicar: 0, aplicada: 0 };
  clients: DelinquencyClient[] = [];
  filteredClients: DelinquencyClient[] = [];
  loadingStats = true;
  loadingClients = true;
  processingId: string | null = null;

  searchTerm = '';
  filterEstado: string | null = null;
  filterDias: string | null = null;
  activeStatusFilter: string | null = null;

  estadoOptions = [
    { label: 'Todos', value: null },
    { label: 'En Mora', value: 'EN_MORA' },
    { label: 'Sin Aplicar', value: 'SIN_APLICAR' },
    { label: 'Aplicada', value: 'APLICADA' },
  ];

  diasOptions = [
    { label: 'Todos', value: null },
    { label: '1-15 días', value: '1-15' },
    { label: '16-30 días', value: '16-30' },
    { label: 'Más de 30', value: '30+' },
  ];

  statusChips = [
    { label: 'En Mora', value: 'EN_MORA' },
    { label: 'Sin Aplicar', value: 'SIN_APLICAR' },
    { label: 'Aplicada', value: 'APLICADA' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private data: MockDataService,
    private msg: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga las estadísticas de morosidad desde el servicio. Establece el estado de carga mientras se realiza la petición y actualiza las estadísticas al recibir la respuesta. En caso de error, simplemente desactiva el estado de carga.
   */
  private loadStats(): void {
    this.data
      .getDelinquencyStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => {
        this.stats = stats;
        this.loadingStats = false;
      });
  }

  /**
   * Carga la lista de clientes morosos desde el servicio. Establece el estado de carga mientras se realiza la petición y actualiza la lista de clientes al recibir la respuesta. En caso de error, simplemente desactiva el estado de carga.
   */
  private loadClients(): void {
    this.data
      .getDelinquencyClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe((clients) => {
        this.clients = clients;
        this.filteredClients = clients;
        this.loadingClients = false;
      });
  }

  /**
   * Establece el filtro de estado activo y aplica los filtros a la lista de clientes. Si el filtro seleccionado ya está activo, se desactiva el filtro.
   * @param value
   */
  setStatusFilter(value: string): void {
    this.activeStatusFilter = this.activeStatusFilter === value ? null : value;
    this.applyFilters();
  }

  /**
   * Aplica los filtros de búsqueda, estado y días de mora a la lista de clientes. Filtra la lista de clientes en función del término de búsqueda (que se aplica al nombre del cliente y al DNI), el estado seleccionado y el rango de días de mora seleccionado. Actualiza la lista de clientes filtrada que se muestra en la tabla.
   */
  applyFilters(): void {
    let result = [...this.clients];

    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter(
        (c) =>
          c.clientName.toLowerCase().includes(term) || c.dni.includes(term),
      );
    }

    const status = this.activeStatusFilter ?? this.filterEstado;
    if (status) {
      result = result.filter((c) => c.status === status);
    }

    if (this.filterDias) {
      result = result.filter((c) => {
        if (this.filterDias === '1-15')
          return c.daysOverdue >= 1 && c.daysOverdue <= 15;
        if (this.filterDias === '16-30')
          return c.daysOverdue >= 16 && c.daysOverdue <= 30;
        if (this.filterDias === '30+') return c.daysOverdue > 30;
        return true;
      });
    }

    this.filteredClients = result;
  }

  /**
   *  Simula el envío de un aviso al cliente. Establece un ID de procesamiento para bloquear la acción mientras se simula el envío y luego muestra un mensaje de información indicando que el aviso ha sido enviado.
   * @param row
   * @returns
   */
  onNotify(row: DelinquencyClient): void {
    if (this.processingId) return;
    this.processingId = `${row.id}_notify`;
    setTimeout(() => {
      this.processingId = null;
      this.msg.add({
        severity: 'info',
        summary: 'Aviso enviado',
        detail: row.clientName,
        life: 3000,
      });
    }, 800);
  }

  /**
   * Simula la aplicación de mora a un cliente. Establece un ID de procesamiento para bloquear la acción mientras se simula la aplicación y luego actualiza el estado del cliente a "En Mora" y muestra un mensaje de advertencia indicando que la mora ha sido aplicada.
   * @param row
   * @returns
   */
  onApply(row: DelinquencyClient): void {
    if (this.processingId) return;
    this.processingId = `${row.id}_apply`;
    this.data
      .applyDelinquency(row.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateClientStatus(row.id, 'EN_MORA');
        this.processingId = null;
        this.msg.add({
          severity: 'warning',
          summary: 'Mora aplicada',
          detail: row.clientName,
          life: 3000,
        });
      });
  }

  /**
   * Simula la condonación de mora para un cliente. Establece un ID de procesamiento para bloquear la acción mientras se simula la condonación y luego actualiza el estado del cliente a "Aplicada" y muestra un mensaje de éxito indicando que la mora ha sido condonada.
   * @param row
   * @returns
   */
  onCondone(row: DelinquencyClient): void {
    if (this.processingId) return;
    this.processingId = `${row.id}_condone`;
    this.data
      .condoneDelinquency(row.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateClientStatus(row.id, 'APLICADA');
        this.processingId = null;
        this.msg.add({
          severity: 'success',
          summary: 'Mora condonada',
          detail: row.clientName,
          life: 3000,
        });
      });
  }

  /**
   * Actualiza el estado de un cliente en la lista de clientes y aplica los filtros.
   * @param id
   * @param status
   */
  private updateClientStatus(
    id: string,
    status: DelinquencyClient['status'],
  ): void {
    const idx = this.clients.findIndex((c) => c.id === id);
    if (idx > -1) {
      this.clients[idx] = { ...this.clients[idx], status };
      this.applyFilters();
    }
  }

  /**
   * Devuelve la etiqueta legible para un estado dado.
   * @param status
   * @returns
   */
  statusLabel(status: string): string {
    const map: Record<string, string> = {
      EN_MORA: 'En mora',
      SIN_APLICAR: 'Sin aplicar',
      APLICADA: 'Aplicada',
    };
    return map[status] ?? status;
  }

  /**
   * Devuelve el severidad para un estado dado.
   * @param status
   * @returns
   */
  statusSeverity(
    status: string,
  ):
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | undefined {
    const map: Record<
      string,
      'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast'
    > = {
      EN_MORA: 'danger',
      SIN_APLICAR: 'secondary',
      APLICADA: 'success',
    };
    return map[status];
  }
}

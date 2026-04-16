import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import {
  DelinquencyClient,
  DelinquencyStats,
  MockDataService,
} from '../../../mocks/mock-data.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-delinquency',
  standalone: true,
  imports: [
    CurrencyPipe,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    SkeletonModule,
    InputTextModule,
    CardModule,
    TableModule,
  ],
  providers: [MessageService],
  templateUrl: './delinquency.component.html',
  styleUrl: './delinquency.component.scss',
})
export class DelinquencyComponent {
  stats: DelinquencyStats = { enMora: 0, sinAplicar: 0, aplicada: 0 };
  clients: DelinquencyClient[] = [];
  filteredClients: DelinquencyClient[] = [];
  loadingStats = true;
  loadingClients = true;
  processingId: string | null = null;

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
   * Carga las estadísticas de morosidad desde el servicio y actualiza el estado del componente.
   * Utiliza el operador takeUntil para cancelar la suscripción cuando el componente se destruya.
   * Al recibir los datos, actualiza la propiedad stats y cambia loadingStats a false.
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
   * Carga la lista de clientes en mora desde el servicio y actualiza el estado del componente.
   * Utiliza el operador takeUntil para cancelar la suscripción cuando el componente se destruya.
   * Al recibir los datos, actualiza las propiedades clients y filteredClients, y cambia loadingClients a false.
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
   *  Filtra la lista de clientes en función del término de búsqueda ingresado por el usuario.
   *  El término de búsqueda se obtiene del evento de entrada y se convierte a minúsculas para una comparación insensible a mayúsculas.
   *  La lista filteredClients se actualiza con los clientes cuyo nombre o DNI incluyen el término de búsqueda.
   * @param event
   */
  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredClients = this.clients.filter(
      (client) =>
        client.clientName.toLowerCase().includes(term) ||
        client.dni.includes(term),
    );
  }

  /**
   * Aplica la mora a un cliente específico. Si ya hay una operación en proceso, la función retorna sin hacer nada.
   * Si no, establece processingId para indicar que se está procesando una acción para ese cliente.
   * Luego, llama al método applyDelinquency del servicio de datos con el ID del cliente.
   * Utiliza el operador takeUntil para cancelar la suscripción cuando el componente se destruya.
   * Al completar la operación, actualiza el estado del cliente a "EN_MORA", restablece processingId a null y muestra un mensaje de éxito.
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
   * Condona la mora de un cliente específico. Si ya hay una operación en proceso, la función retorna sin hacer nada.
   * Si no, establece processingId para indicar que se está procesando una acción para ese cliente.
   * Luego, llama al método condoneDelinquency del servicio de datos con el ID del cliente.
   * Utiliza el operador takeUntil para cancelar la suscripción cuando el componente se destruya.
   * Al completar la operación, actualiza el estado del cliente a "APLICADA", restablece processingId a null y muestra un mensaje de éxito.
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
   * Actualiza el estado de un cliente específico en la lista de clientes. Busca el índice del cliente por su ID y, si lo encuentra, actualiza su estado.
   * Luego, actualiza la lista filteredClients para reflejar el cambio en la interfaz de usuario.
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
      this.filteredClients = [...this.clients];
    }
  }

  /**
   * Devuelve una etiqueta legible para el estado de morosidad de un cliente. Utiliza un mapa para traducir los estados internos a etiquetas más amigables.
   * Si el estado no se encuentra en el mapa, devuelve el estado original.
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
}

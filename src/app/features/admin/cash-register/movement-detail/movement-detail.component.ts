import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

export interface CashMovementDetail {
  id: string;
  date: string;
  time: string;
  type: 'INGRESO' | 'EGRESO';
  concept: string;
  amount: number;
  paymentMethod: string;
  paymentMethodIcon: string;
  createdBy: string;
  status: 'Aplicado' | 'Pendiente' | 'Anulado';
  creditId?: string;
  clientName?: string;
  installment?: string;
  // Egreso fields
  category?: string;
  authorizedBy?: string;
  receiptNumber?: string;
  observations?: string;
}

@Component({
  selector: 'app-movement-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgIf, DialogModule],
  templateUrl: './movement-detail.component.html',
  styleUrl: './movement-detail.component.scss',
})
export class MovementDetailComponent {
  @Input() visible = false;
  @Input() movement!: CashMovementDetail;
  @Output() visibleChange = new EventEmitter<boolean>();

  /**
   * Calcula la diferencia entre el efectivo contado y el balance esperado, y determina si el conteo es exacto o no. Si la diferencia es cero, se considera un conteo exacto; de lo contrario, se muestra la cantidad de diferencia, ya sea un sobrante (positivo) o un faltante (negativo).
   */
  get statusSeverity(): 'success' | 'warning' | 'danger' {
    switch (this.movement?.status) {
      case 'Aplicado':
        return 'success';
      case 'Pendiente':
        return 'warning';
      case 'Anulado':
        return 'danger';
    }
  }

  /**
   * Cierra el modal de detalle de movimiento, emitiendo un evento para notificar al componente padre que el modal ha sido cerrado. Esto permite que el usuario cierre la vista de detalles del movimiento y regrese a la lista de movimientos o a la vista principal del registro de caja.
   */
  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CurrencyArsPipe } from '../../core/pipes/currency-ars.pipe';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'operations',
  standalone: true,
  imports: [
    CurrencyArsPipe,
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    DialogModule,
  ],
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.scss',
})
export class OperationsComponent {
  operations = [
    {
      date: '15-04',
      client: 'Juan Pérez García',
      type: 'VENTA',
      amount: 35000,
      installments: 12,
      status: 'PEND. APROBACIÓN',
    },
    {
      date: '14-04',
      client: 'María López',
      type: 'PRÉSTAMO',
      amount: 15000,
      installments: 6,
      status: 'APROBADO',
    },
    {
      date: '13-04',
      client: 'Carlos Ruiz',
      type: 'VENTA',
      amount: 22000,
      installments: 8,
      status: 'ACTIVO',
    },
    {
      date: '12-04',
      client: 'Ana García',
      type: 'PRÉSTAMO',
      amount: 8000,
      installments: 4,
      status: 'RECHAZADO',
    },
  ];

  statusOptions = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'PEND. APROBACIÓN' },
    { label: 'Aprobado', value: 'APROBADO' },
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Rechazado', value: 'RECHAZADO' },
  ];

  selectedStatus: any;
  searchTerm: string = '';

  showNewOperationModal: boolean = false;

  /**
   *  Devuelve una clase de severidad basada en el estado de la operación para mostrar diferentes colores en la interfaz de usuario. Por ejemplo, 'PEND. APROBACIÓN' devuelve 'warning', 'APROBADO' devuelve 'success', etc. Esto se utiliza para resaltar visualmente el estado de cada operación en la tabla.
   * @param status
   * @returns
   */
  getStatusSeverity(status: string) {
    switch (status) {
      case 'PEND. APROBACIÓN':
        return 'warning';
      case 'APROBADO':
        return 'success';
      case 'ACTIVO':
        return 'info';
      case 'RECHAZADO':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  loadOperations() {}

  /**
   *  Abre el modal de nueva operación estableciendo la variable `showNewOperationModal` a `true`, lo que hace que el componente `NewOperationComponent` se muestre en la interfaz de usuario. Esta función se puede llamar desde un botón o enlace en la plantilla para iniciar el proceso de creación de una nueva operación.
   */
  openNewOperation() {
    this.showNewOperationModal = true;
  }

  /**
   *  Cierra el modal de nueva operación estableciendo la variable `showNewOperationModal` a `false`, lo que oculta el componente `NewOperationComponent` en la interfaz de usuario.
   *  Esta función se puede llamar desde el componente hijo `NewOperationComponent` para cerrar el modal una vez que se haya completado la creación de la nueva operación o si el usuario decide cancelar el proceso.
   */
  closeNewOperation() {
    this.showNewOperationModal = false;
  }
}

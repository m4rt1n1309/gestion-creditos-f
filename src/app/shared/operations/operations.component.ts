import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
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
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
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
}

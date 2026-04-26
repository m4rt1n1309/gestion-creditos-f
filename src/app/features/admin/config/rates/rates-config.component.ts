import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { RateFormModalComponent, TasaRecord } from './rate-form-modal/rate-form-modal.component';

@Component({
  selector: 'app-rates-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule, InputTextModule, RateFormModalComponent],
  templateUrl: './rates-config.component.html',
})
export class RatesConfigComponent {
  searchTerm = '';
  showModal = false;
  editRecord: TasaRecord | null = null;

  tasas: TasaRecord[] = [
    { producto: 'Préstamo Express',     tasaMensual: 2.5, tasaAnual: 30.0, mora: 5.0, vigenciaDesde: '01/01', vigenciaHasta: '31/12/2025', activa: true },
    { producto: 'Crédito Plus',         tasaMensual: 1.8, tasaAnual: 21.6, mora: 3.5, vigenciaDesde: '01/01', vigenciaHasta: '31/12/2025', activa: true },
    { producto: 'Crédito Hipotecario',  tasaMensual: 0.9, tasaAnual: 10.8, mora: 2.0, vigenciaDesde: '01/03', vigenciaHasta: '28/02/2026', activa: true },
    { producto: 'Microcrédito Rural',   tasaMensual: 3.2, tasaAnual: 38.4, mora: 6.0, vigenciaDesde: '01/01', vigenciaHasta: '31/12/2025', activa: false },
    { producto: 'Línea de Consumo',     tasaMensual: 2.1, tasaAnual: 25.2, mora: 4.0, vigenciaDesde: '01/06', vigenciaHasta: '31/05/2026', activa: true },
  ];

  get filtered(): TasaRecord[] {
    if (!this.searchTerm.trim()) return this.tasas;
    const q = this.searchTerm.toLowerCase();
    return this.tasas.filter(t => t.producto.toLowerCase().includes(q));
  }

  openNew(): void {
    this.editRecord = null;
    this.showModal = true;
  }

  openEdit(tasa: TasaRecord): void {
    this.editRecord = tasa;
    this.showModal = true;
  }
}

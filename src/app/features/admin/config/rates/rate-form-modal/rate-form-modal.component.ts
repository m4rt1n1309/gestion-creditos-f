import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';

export interface TasaForm {
  producto: string;
  tipoCredito: string | null;
  tasaMensual: number | null;
  tasaMora: number | null;
  plazoMax: number | null;
  vigenciaDesde: Date | null;
  vigenciaHasta: Date | null;
  activa: boolean;
  notas: string;
}

export interface TasaRecord {
  producto: string;
  tasaMensual: number;
  tasaAnual: number;
  mora: number;
  vigenciaDesde: string;
  vigenciaHasta: string;
  activa: boolean;
}

@Component({
  selector: 'app-rate-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    InputTextareaModule,
  ],
  templateUrl: './rate-form-modal.component.html',
})
export class RateFormModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() editRecord: TasaRecord | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<TasaForm>();

  tiposCredito = [
    { label: 'Préstamo Express', value: 'prestamo_express' },
    { label: 'Crédito Plus', value: 'credito_plus' },
    { label: 'Crédito Hipotecario', value: 'credito_hipotecario' },
    { label: 'Microcrédito Rural', value: 'microcredito_rural' },
    { label: 'Línea de Consumo', value: 'linea_consumo' },
  ];

  estadoOpciones = [
    { label: 'Activa', value: true },
    { label: 'Inactiva', value: false },
  ];

  form: TasaForm = this.emptyForm();

  get tasaAnual(): number {
    return this.form.tasaMensual ? parseFloat((this.form.tasaMensual * 12).toFixed(2)) : 0;
  }

  get isEdit(): boolean {
    return this.editRecord !== null;
  }

  ngOnChanges(): void {
    if (this.visible && this.editRecord) {
      this.form = {
        producto: this.editRecord.producto,
        tipoCredito: null,
        tasaMensual: this.editRecord.tasaMensual,
        tasaMora: this.editRecord.mora,
        plazoMax: null,
        vigenciaDesde: this.parseDate(this.editRecord.vigenciaDesde),
        vigenciaHasta: this.parseDate(this.editRecord.vigenciaHasta),
        activa: this.editRecord.activa,
        notas: '',
      };
    } else if (this.visible) {
      this.form = this.emptyForm();
    }
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  guardar(): void {
    this.saved.emit({ ...this.form });
    this.close();
  }

  private emptyForm(): TasaForm {
    return {
      producto: '',
      tipoCredito: null,
      tasaMensual: null,
      tasaMora: null,
      plazoMax: null,
      vigenciaDesde: new Date(),
      vigenciaHasta: null,
      activa: true,
      notas: '',
    };
  }

  private parseDate(str: string): Date | null {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length === 2) return new Date(new Date().getFullYear(), +parts[1] - 1, +parts[0]);
    if (parts.length === 3) return new Date(+parts[2], +parts[1] - 1, +parts[0]);
    return null;
  }
}

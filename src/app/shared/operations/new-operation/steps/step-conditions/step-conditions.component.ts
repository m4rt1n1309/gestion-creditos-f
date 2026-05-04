import { Component, inject } from '@angular/core';
import { CurrencyArsPipe } from '../../../../../core/pipes/currency-ars.pipe';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { OperationFormService } from '../../operation-form.service';

@Component({
  selector: 'app-step-conditions',
  standalone: true,
  imports: [
    CurrencyArsPipe,
    FormsModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
  ],
  templateUrl: './step-conditions.component.html',
})
export class StepConditionsComponent {
  form = inject(OperationFormService);

  /**
   * Fecha mínima permitida para el primer pago (hoy en zona horaria local).
   * @returns {Date} Fecha mínima para el calendario.
   */
  get minFirstDueDate(): Date {
    return this.form.getTodayStart();
  }

  /**
   * Informa si la fecha seleccionada quedó en estado inválido.
   * @returns {boolean} true si existe fecha y es anterior a hoy.
   */
  get hasInvalidFirstDueDate(): boolean {
    const selectedDate = this.form.firstDueDate();
    if (!selectedDate) return false;
    return !this.form.isFirstDueDateValid();
  }

  get firstDueDate(): Date | undefined {
    return this.form.firstDueDate();
  }
  set firstDueDate(val: Date | undefined) {
    this.form.firstDueDate.set(val);
  }
}

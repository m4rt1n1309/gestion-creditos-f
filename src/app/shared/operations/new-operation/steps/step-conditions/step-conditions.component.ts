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

  get firstDueDate(): Date | undefined {
    return this.form.firstDueDate();
  }
  set firstDueDate(val: Date | undefined) {
    this.form.firstDueDate.set(val);
  }
}

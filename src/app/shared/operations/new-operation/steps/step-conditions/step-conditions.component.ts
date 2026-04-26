import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { OperationFormService } from '../../operation-form.service';

@Component({
  selector: 'app-step-conditions',
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe,
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

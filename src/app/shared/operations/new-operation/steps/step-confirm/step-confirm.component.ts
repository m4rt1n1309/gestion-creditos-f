import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { CurrencyArsPipe } from '../../../../../core/pipes/currency-ars.pipe';
import { OperationFormService } from '../../operation-form.service';

@Component({
  selector: 'app-step-confirm',
  standalone: true,
  imports: [CurrencyArsPipe, FormsModule, CheckboxModule],
  templateUrl: './step-confirm.component.html',
})
export class StepConfirmComponent {
  form = inject(OperationFormService);

  initials(name: string | undefined): string {
    if (!name) return '';
    const parts = name.split(' ');
    return (parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '');
  }

  updateCheck(
    key: 'identity' | 'conditions' | 'disbursement' | 'capacity',
    value: boolean,
  ) {
    this.form.updateCheck(key, value);
  }
}

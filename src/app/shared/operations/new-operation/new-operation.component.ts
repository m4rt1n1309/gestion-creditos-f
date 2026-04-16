import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps';
import { TooltipModule } from 'primeng/tooltip';
import { OperationFormService } from './operation-form.service';
import { StepClientComponent } from './steps/step-client/step-client.component';
import { StepConditionsComponent } from './steps/step-conditions/step-conditions.component';
import { StepConfirmComponent } from './steps/step-confirm/step-confirm.component';
import { StepProductsComponent } from './steps/step-products/step-products.component';

@Component({
  selector: 'app-new-operation',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    StepsModule,
    ButtonModule,
    TooltipModule,
    StepClientComponent,
    StepProductsComponent,
    StepConditionsComponent,
    StepConfirmComponent,
  ],
  providers: [OperationFormService],
  templateUrl: './new-operation.component.html',
  styleUrl: './new-operation.component.scss',
})
export class NewOperationComponent implements OnInit {
  @Output() onComplete = new EventEmitter<void>();

  activeIndex = 0;
  steps: MenuItem[] | undefined;

  constructor(private form: OperationFormService) {}

  ngOnInit() {
    this.steps = [
      { label: 'Cliente' },
      { label: 'Tipo y Producto' },
      { label: 'Condiciones' },
      { label: 'Confirmación' },
    ];
  }

  nextStep() {
    if (this.activeIndex < 3) this.activeIndex++;
  }
  prevStep() {
    if (this.activeIndex > 0) this.activeIndex--;
  }

  get canNext(): boolean {
    if (this.activeIndex === 0) return !!this.form.selectedClient();
    return true;
  }

  get isConfirmed(): boolean {
    return this.form.isConfirmed();
  }

  finish() {
    console.log('Operación guardada con éxito');
    this.onComplete.emit();
  }
}

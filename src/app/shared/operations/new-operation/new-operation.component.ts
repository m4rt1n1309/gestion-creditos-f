import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
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
    ToastModule,
    StepClientComponent,
    StepProductsComponent,
    StepConditionsComponent,
    StepConfirmComponent,
  ],
  providers: [OperationFormService, MessageService],
  templateUrl: './new-operation.component.html',
  styleUrl: './new-operation.component.scss',
})
export class NewOperationComponent implements OnInit {
  @Output() onComplete = new EventEmitter<void>();

  activeIndex = 0;
  submitting = false;
  steps: MenuItem[] | undefined;

  constructor(
    private form: OperationFormService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    const clientDni = this.route.snapshot.queryParamMap.get('clientDni');
    if (clientDni) {
      const match = this.form.clients.find((c) => c.dni === clientDni);
      if (match) {
        this.form.selectedClient.set(match);
        this.activeIndex = 1;
      }
    }

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
    this.submitting = true;
    // TODO: replace with real API call
    setTimeout(() => {
      this.submitting = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Operación enviada',
        detail: 'La operación fue enviada para aprobación correctamente.',
        life: 3000,
      });
      this.onComplete.emit();
      const base = this.router.url.split('/operations')[0];
      setTimeout(() => this.router.navigate([base, 'operations']), 1500);
    }, 1000);
  }
}

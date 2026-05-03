import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CreditsService } from '../../../features/seller/operations/credits.service';
import {
  CreditCreatePayload,
  LoanCreditPayload,
  PaymentFrequency,
  SaleCreditPayload,
} from '../../../features/seller/models/credit.model';
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
    private creditsService: CreditsService,
  ) {}

  ngOnInit() {
    this.steps = [
      { label: 'Cliente' },
      { label: 'Tipo y Producto' },
      { label: 'Condiciones' },
      { label: 'Confirmación' },
    ];

    const clientDni = this.route.snapshot.queryParamMap.get('clientDni');
    this.form.loadData().subscribe(() => {
      if (clientDni) {
        const match = this.form.clients.find((c) => c.dni === clientDni);
        if (match) {
          this.form.selectedClient.set(match);
          this.activeIndex = 1;
        }
      }
    });
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

  /** Mensaje de error inline para ventas sin unidades seleccionadas. */
  unitsError: string | null = null;

  /**
   * Finaliza la creación de la operación.
   * Valida que las ventas (SALE) tengan al menos una unidad seleccionada
   * antes de enviar el payload al backend.
   * @returns
   */
  finish() {
    const client = this.form.selectedClient();
    if (!client) return;

    const type = this.form.selectedType() === 'VENTA' ? 'SALE' : 'LOAN';
    const selectedUnits = this.form.selectedProducts();

    if (type === 'SALE' && selectedUnits.length === 0) {
      this.unitsError = 'Agregá al menos una unidad al carrito.';
      return;
    }
    this.unitsError = null;

    this.submitting = true;
    const freq = this.form.selectedFrequency().value as PaymentFrequency;

    let payload: CreditCreatePayload;
    if (type === 'SALE') {
      const salePayload: SaleCreditPayload = {
        customerId: client.id,
        type: 'SALE',
        installmentsCount: this.form.selectedInstallments(),
        paymentFrequency: freq,
        units: selectedUnits.map((p) => ({ unitId: p.id })),
      };
      payload = salePayload;
    } else {
      const loanPayload: LoanCreditPayload = {
        customerId: client.id,
        type: 'LOAN',
        totalAmount: this.form.loanCapital(),
        installmentsCount: this.form.installmentsCount(),
        paymentFrequency: freq,
      };
      payload = loanPayload;
    }

    this.creditsService.create(payload).subscribe({
      next: () => {
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
      },
      error: (err) => {
        this.submitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.message ?? 'No se pudo registrar la operación.',
          life: 5000,
        });
      },
    });
  }
}

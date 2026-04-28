import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CurrencyArsPipe } from '../../../../core/pipes/currency-ars.pipe';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { AppError } from '../../../../core/models/app-error';
import { HeaderService } from '../../../../core/services/header.service';
import { CustomersService } from '../../clients/customers.service';
import {
  CreditCreatePayload,
  PaymentFrequency,
  SimulateResult,
} from '../../models/credit.model';
import { Customer } from '../../models/customer.model';
import { Product } from '../../models/product.model';
import { ProductsService } from '../../products/products.service';
import { CreditsService } from '../credits.service';

@Component({
  selector: 'app-credit-create',
  standalone: true,
  providers: [MessageService],
  imports: [
    CurrencyArsPipe,
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    RadioButtonModule,
    InputTextareaModule,
    ToastModule,
  ],
  templateUrl: './credit-create.component.html',
})
export class CreditCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly creditsService = inject(CreditsService);
  private readonly customersService = inject(CustomersService);
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly header = inject(HeaderService);
  private readonly messageService = inject(MessageService);

  form!: FormGroup;
  customers: Customer[] = [];
  products: Product[] = [];
  submitting = false;
  simulating = false;
  simulateResult: SimulateResult | null = null;
  simulateError: string | null = null;
  submitError: string | null = null;
  productsError: string | null = null;
  showExtraSection = false;

  readonly frequencyOptions = [
    { label: 'Semanal', value: 'WEEKLY' },
    { label: 'Quincenal', value: 'BIWEEKLY' },
    { label: 'Mensual', value: 'MONTHLY' },
  ];

  readonly paymentMethodOptions = [
    { label: 'Efectivo', value: 'CASH' },
    { label: 'Transferencia', value: 'TRANSFER' },
  ];

  /**
   * Obtiene el tipo de crédito seleccionado en el formulario (SALE o LOAN). Se utiliza para mostrar/ocultar campos específicos de cada tipo.
   */
  get creditType(): string {
    return this.form.get('type')?.value ?? 'SALE';
  }

  /**
   * Indica si el crédito es de tipo "SALE". Se utiliza para mostrar/ocultar campos específicos de este tipo.
   */
  get isSale(): boolean {
    return this.creditType === 'SALE';
  }

  /**
   * Obtiene el FormArray que contiene las filas de productos en el formulario. Solo se utiliza para créditos de tipo "SALE". Cada fila representa un producto seleccionado y su cantidad.
   */
  get productRows(): FormArray {
    return this.form.get('products') as FormArray;
  }

  /**
   * Obtiene las opciones de clientes para mostrar en el dropdown de selección de cliente. Convierte la lista de clientes cargada desde el servicio a un formato adecuado para el componente de dropdown, mostrando el nombre completo y DNI de cada cliente.
   */
  get customerOptions(): { label: string; value: string }[] {
    return this.customers.map((c) => ({
      label: `${c.fullName} (${c.dni})`,
      value: c.id,
    }));
  }

  /**
   * Obtiene las opciones de productos para mostrar en el dropdown de selección de productos (solo para créditos de tipo "SALE"). Convierte la lista de productos cargada desde el servicio a un formato adecuado para el componente de dropdown, mostrando el nombre del producto y su stock disponible.
   */
  get productOptions(): { label: string; value: string }[] {
    return this.products.map((p) => ({
      label: `${p.name} — Stock: ${p.availableStock}`,
      value: p.id,
    }));
  }

  get downPaymentValue(): number {
    return this.form.get('downPayment')?.value ?? 0;
  }

  get prepaidInstallmentsValue(): number {
    return this.form.get('prepaidInstallments')?.value ?? 0;
  }

  get downPaymentMethod(): string {
    return this.form.get('downPaymentMethod')?.value ?? 'CASH';
  }

  get prepaidInstallmentsMethod(): string {
    return this.form.get('prepaidInstallmentsMethod')?.value ?? 'CASH';
  }

  get saleTotal(): number {
    if (!this.isSale) return 0;
    return this.productRows.controls.reduce((sum, row) => {
      const productId = row.get('productId')?.value;
      const quantity = row.get('quantity')?.value ?? 0;
      const product = this.products.find((p) => p.id === productId);
      return sum + (product ? product.currentPrice * quantity : 0);
    }, 0);
  }

  ngOnInit(): void {
    this.header.set([
      { label: 'Operaciones', route: '/seller/operations' },
      { label: 'Nueva operación' },
    ]);
    this.buildForm();
    this.loadCustomers();
    this.loadProducts();
  }

  /**
   * Convierte el payload de simulación a la estructura esperada por la API.
   */
  onTypeChange(): void {
    this.simulateResult = null;
    this.simulateError = null;
    this.submitError = null;
    this.productsError = null;
    this.showExtraSection = false;
  }

  /**
   * Agrega una nueva fila para seleccionar un producto y su cantidad. Solo se muestra para créditos de tipo "SALE".
   */
  addProductRow(): void {
    this.productRows.push(
      this.fb.group({
        productId: ['', Validators.required],
        quantity: [
          1,
          [Validators.required, Validators.min(1), Validators.max(9999)],
        ],
      }),
    );
  }

  /**
   * Elimina una fila de producto.
   * @param index
   */
  removeProductRow(index: number): void {
    this.productRows.removeAt(index);
  }

  /**
   * Simula un crédito según los parámetros proporcionados.
   * @returns
   */
  simulate(): void {
    const v = this.form.getRawValue();
    if (!v.installmentsCount || !v.paymentFrequency) return;

    this.simulating = true;
    this.simulateResult = null;
    this.simulateError = null;

    const payload =
      v.type === 'SALE'
        ? {
            type: 'SALE' as const,
            installmentsCount: v.installmentsCount,
            paymentFrequency: v.paymentFrequency as PaymentFrequency,
            products: (v.products as { productId: string; quantity: number }[])
              .filter((p) => p.productId && p.quantity)
              .map((p) => ({ productId: p.productId, quantity: p.quantity })),
            ...(v.downPayment > 0 ? { downPayment: v.downPayment } : {}),
          }
        : {
            type: 'LOAN' as const,
            totalAmount: v.totalAmount,
            installmentsCount: v.installmentsCount,
            paymentFrequency: v.paymentFrequency as PaymentFrequency,
          };

    this.creditsService.simulate(payload).subscribe({
      next: (result) => {
        this.simulateResult = result;
        this.simulating = false;
      },
      error: (err: AppError) => {
        this.simulateError = err.message;
        this.simulating = false;
      },
    });
  }

  /**
   * Envía el formulario para crear un nuevo crédito.
   * @returns
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    let payload: CreditCreatePayload;

    if (v.type === 'SALE') {
      const salePayload: CreditCreatePayload = {
        customerId: v.customerId,
        type: 'SALE',
        installmentsCount: v.installmentsCount,
        paymentFrequency: v.paymentFrequency,
        products: (v.products as { productId: string; quantity: number }[]).map(
          (p) => ({ productId: p.productId, quantity: p.quantity }),
        ),
        notes: v.notes || undefined,
      };
      if (v.downPayment > 0) {
        (salePayload as any).downPayment = v.downPayment;
        (salePayload as any).downPaymentMethod = v.downPaymentMethod;
        if (
          v.downPaymentMethod === 'TRANSFER' &&
          v.downPaymentTransferReference
        ) {
          (salePayload as any).downPaymentTransferReference =
            v.downPaymentTransferReference;
        }
      }
      if (v.prepaidInstallments > 0) {
        (salePayload as any).prepaidInstallments = v.prepaidInstallments;
        (salePayload as any).prepaidInstallmentsMethod =
          v.prepaidInstallmentsMethod;
        if (
          v.prepaidInstallmentsMethod === 'TRANSFER' &&
          v.prepaidInstallmentsTransferReference
        ) {
          (salePayload as any).prepaidInstallmentsTransferReference =
            v.prepaidInstallmentsTransferReference;
        }
      }
      payload = salePayload;
    } else {
      payload = {
        customerId: v.customerId,
        type: 'LOAN',
        totalAmount: v.totalAmount,
        installmentsCount: v.installmentsCount,
        paymentFrequency: v.paymentFrequency,
        notes: v.notes || undefined,
      };
    }

    this.submitting = true;
    this.submitError = null;
    this.productsError = null;

    this.creditsService.create(payload).subscribe({
      next: (result) => {
        this.submitting = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Operación registrada',
          detail: 'Pre-operación registrada. Pendiente de aprobación.',
        });
        setTimeout(
          () => this.router.navigate(['/seller/operations', result.id]),
          1500,
        );
      },
      error: (err: AppError) => {
        this.submitting = false;
        if (err.status === 409 || (err.status === 400 && this.isSale)) {
          this.productsError = err.message;
        } else if (err.status === 404) {
          this.submitError = err.message;
        } else {
          this.submitError = err.message;
        }
      },
    });
  }

  /**
   * Navega hacia atrás en el historial del navegador.
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Verifica si un campo del formulario es inválido.
   * @param field
   * @returns
   */
  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  /**
   * Verifica si una fila de productos es inválida.
   * @param rowIndex
   * @param field
   * @returns
   */
  isRowInvalid(rowIndex: number, field: string): boolean {
    const c = this.productRows.at(rowIndex)?.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  /**
   * Convierte un SimulatePayload (formato usado en la app) a un objeto para el cuerpo de la solicitud.
   */
  private buildForm(): void {
    this.form = this.fb.group({
      type: ['SALE'],
      customerId: ['', Validators.required],
      paymentFrequency: ['', Validators.required],
      installmentsCount: [
        1,
        [Validators.required, Validators.min(1), Validators.max(120)],
      ],
      notes: ['', Validators.maxLength(500)],
      totalAmount: [null],
      products: this.fb.array([]),
      downPayment: [0, [Validators.min(0)]],
      downPaymentMethod: ['CASH'],
      downPaymentTransferReference: ['', Validators.maxLength(100)],
      prepaidInstallments: [0, [Validators.min(0)]],
      prepaidInstallmentsMethod: ['CASH'],
      prepaidInstallmentsTransferReference: ['', Validators.maxLength(100)],
    });
    this.addProductRow();
  }

  /**
   * Carga la lista de clientes activos para mostrar en el dropdown de selección de cliente.
   */
  private loadCustomers(): void {
    this.customersService.list({ status: 'ACTIVE' }).subscribe({
      next: (data) => (this.customers = data),
      error: () => {},
    });
  }

  /**
   * Carga la lista de productos activos para mostrar en el dropdown de selección de productos (solo para créditos de tipo "SALE").
   */
  private loadProducts(): void {
    this.productsService.list({ status: 'ACTIVE' }).subscribe({
      next: (data) => (this.products = data),
      error: () => {},
    });
  }
}

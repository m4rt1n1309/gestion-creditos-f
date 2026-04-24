import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { AppError } from '../../../../core/models/app-error';
import { HeaderService } from '../../../../core/services/header.service';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    ToastModule,
  ],
  templateUrl: './product-create.component.html',
})
export class ProductCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);
  private readonly header = inject(HeaderService);
  private readonly messageService = inject(MessageService);

  form!: FormGroup;
  submitting = false;

  ngOnInit(): void {
    this.header.set([
      { label: 'Productos', route: '/seller/products' },
      { label: 'Nuevo producto' },
    ]);

    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(150),
        ],
      ],
      description: ['', [Validators.maxLength(1000)]],
      currentPrice: [
        null,
        [Validators.required, Validators.min(0.01), Validators.max(99999999)],
      ],
      availableStock: [
        null,
        [Validators.required, Validators.min(0), Validators.max(999999)],
      ],
    });
  }

  /**
   * Verifica si un campo es inválido.
   * @param field
   * @returns
   */
  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico.
   * @param field
   * @returns
   */
  getError(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors) return '';
    if (c.errors['serverError']) return c.errors['serverError'];
    if (c.errors['required']) return 'Este campo es requerido.';
    if (c.errors['minlength'])
      return `Mínimo ${c.errors['minlength'].requiredLength} caracteres.`;
    if (c.errors['maxlength'])
      return `Máximo ${c.errors['maxlength'].requiredLength} caracteres.`;
    if (c.errors['min']) return `El valor mínimo es ${c.errors['min'].min}.`;
    if (c.errors['max']) return `El valor máximo es ${c.errors['max'].max}.`;
    return 'Campo inválido.';
  }

  /**
   * Maneja el envío del formulario.
   * @returns
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const raw = this.form.getRawValue();

    this.productsService
      .create({
        name: raw.name,
        description: raw.description || undefined,
        currentPrice: raw.currentPrice,
        availableStock: raw.availableStock,
      })
      .subscribe({
        next: (product) => {
          this.submitting = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto registrado correctamente.',
          });
          setTimeout(
            () => this.router.navigate(['/seller/products', product.id]),
            1000,
          );
        },
        error: (err: AppError) => {
          this.submitting = false;
          if (err.status === 409) {
            this.form.get('name')!.setErrors({ serverError: err.message });
            this.form.get('name')!.markAsDirty();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message || 'Error al registrar el producto.',
            });
          }
        },
      });
  }

  /**
   * Navega de regreso a la lista de productos sin guardar los cambios.
   */
  cancel(): void {
    this.router.navigate(['/seller/products']);
  }
}

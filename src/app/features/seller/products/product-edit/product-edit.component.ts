import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AppError } from '../../../../core/models/app-error';
import { HeaderService } from '../../../../core/services/header.service';
import { ErrorStateComponent } from '../../../../shared/states/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/states/loading-state/loading-state.component';
import { ProductDetail } from '../../models/product.model';
import { ProductsService } from '../products.service';
import { AppRoutes } from '../../../../shared/models/enums/routes.enum';

@Component({
  selector: 'app-product-edit',
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
    TooltipModule,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './product-edit.component.html',
})
export class ProductEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);
  private readonly header = inject(HeaderService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  product: ProductDetail | null = null;
  loading = false;
  error: AppError | null = null;
  submitting = false;
  form!: FormGroup;

  private get productId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.header.set([
      { label: 'Productos', route: AppRoutes.SELLER_PRODUCTS },
      { label: 'Editar producto' },
    ]);
    this.load();
  }

  /**
   * Verifica si un campo del formulario es inválido.
   * @param field
   * @returns
   */
  isInvalid(field: string): boolean {
    const camp = this.form?.get(field);
    return !!(camp && camp.invalid && (camp.dirty || camp.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico.
   * @param field
   * @returns
   */
  getError(field: string): string {
    const camp = this.form?.get(field);
    if (!camp?.errors) return '';
    if (camp.errors['serverError']) return camp.errors['serverError'];
    if (camp.errors['required']) return 'Este campo es requerido.';
    if (camp.errors['minlength'])
      return `Mínimo ${camp.errors['minlength'].requiredLength} caracteres.`;
    if (camp.errors['maxlength'])
      return `Máximo ${camp.errors['maxlength'].requiredLength} caracteres.`;
    if (camp.errors['min'])
      return `El valor mínimo es ${camp.errors['min'].min}.`;
    if (camp.errors['max'])
      return `El valor máximo es ${camp.errors['max'].max}.`;
    return 'Campo inválido.';
  }

  /**
   * Maneja el envío del formulario. Si el formulario es inválido, marca todos los campos como tocados para mostrar los errores. Si es válido, llama al servicio para actualizar el producto y maneja las respuestas exitosas y de error.
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
      .update(this.productId, {
        name: raw.name,
        description: raw.description || undefined,
        currentPrice: raw.currentPrice,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto actualizado correctamente.',
          });
          setTimeout(
            () =>
              this.router.navigate([AppRoutes.SELLER_PRODUCTS, this.productId]),
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
              detail: err.message || 'Error al actualizar el producto.',
            });
          }
        },
      });
  }

  /**
   * Navega de regreso a la página de detalle del producto sin guardar los cambios realizados en el formulario. Se utiliza como acción para cancelar la edición del producto.
   */
  cancel(): void {
    this.router.navigate([AppRoutes.SELLER_PRODUCTS, this.productId]);
  }

  /**
   * Carga los detalles del producto actual desde el backend. Actualiza los estados de carga y error según corresponda. Si la carga es exitosa, también inicializa el formulario con los datos del producto y actualiza el encabezado de la página con el nombre del producto.
   */
  private load(): void {
    this.loading = true;
    this.error = null;
    this.productsService.getById(this.productId).subscribe({
      next: (data) => {
        this.product = data;
        this.form = this.fb.group({
          name: [
            data.name,
            [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(150),
            ],
          ],
          description: [data.description ?? '', [Validators.maxLength(1000)]],
          currentPrice: [
            data.currentPrice,
            [
              Validators.required,
              Validators.min(0.01),
              Validators.max(99999999),
            ],
          ],
        });
        this.header.set([
          { label: 'Productos', route: AppRoutes.SELLER_PRODUCTS },
          { label: `Editar: ${data.name}` },
        ]);
        this.loading = false;
      },
      error: (err: AppError) => {
        this.error = err;
        this.loading = false;
      },
    });
  }
}

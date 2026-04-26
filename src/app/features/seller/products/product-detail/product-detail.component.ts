import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CurrencyArsPipe } from '../../../../core/pipes/currency-ars.pipe';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MockAuthService } from '../../../../core/auth/mock-auth.service';
import { AppError } from '../../../../core/models/app-error';
import { UserRoleEnum } from '../../../../core/models/types/user-role';
import { HeaderService } from '../../../../core/services/header.service';
import { ErrorStateComponent } from '../../../../shared/states/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/states/loading-state/loading-state.component';
import { ProductDetail, StockAdjustPayload } from '../../models/product.model';
import { ProductsService } from '../products.service';
import { AppRoutes } from '../../../../shared/models/enums/routes.enum';

const LOW_STOCK_THRESHOLD = 5;

@Component({
  selector: 'app-product-detail',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CurrencyArsPipe,
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    DropdownModule,
    TooltipModule,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly auth = inject(MockAuthService);
  private readonly location = inject(Location);
  private readonly header = inject(HeaderService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  product: ProductDetail | null = null;
  loading = false;
  error: AppError | null = null;

  readonly LOW_STOCK_THRESHOLD = LOW_STOCK_THRESHOLD;

  showStockDialog = false;
  stockForm!: FormGroup;
  adjustingStock = false;
  stockDialogError: string | null = null;

  readonly movementOptions = [
    { label: 'Entrada (IN)', value: 'IN' },
    { label: 'Salida (OUT)', value: 'OUT' },
  ];

  /**
   * Indica si el usuario actual tiene rol de admin para mostrar/ocultar acciones sensibles.
   */
  get isAdmin(): boolean {
    return this.auth.hasRole(UserRoleEnum.ADMIN);
  }

  /**
   * Obtiene el ID del producto desde la ruta activa.
   */
  private get productId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  /**
   * Obtiene la etiqueta de estado según el estado del producto.
   */
  get stockDialogConfirmLabel(): string {
    return this.stockForm?.get('movement')?.value === 'OUT'
      ? 'Registrar salida'
      : 'Registrar entrada';
  }

  ngOnInit(): void {
    this.header.set([
      { label: 'Productos', route: AppRoutes.SELLER_PRODUCTS },
      { label: 'Detalle' },
    ]);
    this.load();
  }

  /**
   * Navega hacia la página anterior en el historial del navegador.
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Navega hacia la página de edición del producto actual.
   */
  navigateToEdit(): void {
    this.router.navigate([
      AppRoutes.SELLER_PRODUCTS_EDIT.replace(':id', this.productId),
    ]);
  }

  /**
   * Abre el diálogo para ajustar el stock del producto. Inicializa el formulario y resetea los errores.
   */
  openStockDialog(): void {
    this.stockForm = this.fb.group({
      movement: ['IN', Validators.required],
      quantity: [
        null,
        [Validators.required, Validators.min(1), Validators.max(99999)],
      ],
      reason: ['', [Validators.required, Validators.maxLength(255)]],
    });
    this.stockDialogError = null;
    this.showStockDialog = true;
  }

  /**
   * Cierra el diálogo de ajuste de stock y resetea los estados relacionados. No realiza ninguna acción adicional.
   */
  closeStockDialog(): void {
    this.showStockDialog = false;
    this.adjustingStock = false;
    this.stockDialogError = null;
  }

  /**
   * Maneja el envío del formulario de ajuste de stock.
   * @returns
   */
  onStockSubmit(): void {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    this.adjustingStock = true;
    this.stockDialogError = null;
    const raw = this.stockForm.getRawValue();
    const payload: StockAdjustPayload = {
      movement: raw.movement,
      quantity: raw.quantity,
      reason: raw.reason,
    };

    this.productsService.adjustStock(this.productId, payload).subscribe({
      next: (result) => {
        this.product!.availableStock = result.availableStock;
        this.adjustingStock = false;
        this.showStockDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Stock actualizado',
          detail:
            payload.movement === 'IN'
              ? 'Entrada de stock registrada correctamente.'
              : 'Salida de stock registrada correctamente.',
        });
      },
      error: (err: AppError) => {
        this.adjustingStock = false;
        if (err.status === 409) {
          this.stockDialogError = err.message;
        } else {
          this.showStockDialog = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message,
          });
        }
      },
    });
  }

  /**
   * Verifica si un campo del formulario de ajuste de stock es inválido.
   * @param field
   * @returns
   */
  isStockInvalid(field: string): boolean {
    const camp = this.stockForm?.get(field);
    return !!(camp && camp.invalid && (camp.dirty || camp.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico del formulario de ajuste de stock.
   * @param field
   * @returns
   */
  getStockError(field: string): string {
    const camp = this.stockForm?.get(field);
    if (!camp?.errors) return '';
    if (camp.errors['required']) return 'Este campo es requerido.';
    if (camp.errors['min'])
      return `El valor mínimo es ${camp.errors['min'].min}.`;
    if (camp.errors['max'])
      return `El valor máximo es ${camp.errors['max'].max}.`;
    if (camp.errors['maxlength'])
      return `Máximo ${camp.errors['maxlength'].requiredLength} caracteres.`;
    return 'Campo inválido.';
  }

  /**
   * Confirma la desactivación del producto actual mediante un diálogo de confirmación. Si el usuario acepta, se llama al servicio para desactivar el producto y se manejan las respuestas exitosas y de error.
   */
  confirmDeactivate(): void {
    this.confirmationService.confirm({
      header: 'Desactivar producto',
      message: `¿Desactivar <strong>${this.product?.name}</strong>?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () =>
        this.productsService.deactivate(this.productId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Producto desactivado',
              detail: '',
            });
            this.refresh();
          },
          error: (err: AppError) => this.handleActionError(err),
        }),
    });
  }

  /**
   * Confirma la activación del producto actual mediante un diálogo de confirmación. Si el usuario acepta, se llama al servicio para activar el producto y se manejan las respuestas exitosas y de error.
   */
  confirmActivate(): void {
    this.confirmationService.confirm({
      header: 'Activar producto',
      message: `¿Activar <strong>${this.product?.name}</strong>?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Activar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.productsService.activate(this.productId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Producto activado',
              detail: '',
            });
            this.refresh();
          },
          error: (err: AppError) => this.handleActionError(err),
        }),
    });
  }

  /**
   * Carga los detalles del producto actual desde el backend. Actualiza los estados de carga y error según corresponda. Si la carga es exitosa, también actualiza el encabezado de la página con el nombre del producto.
   */
  private load(): void {
    this.loading = true;
    this.error = null;
    this.productsService.getById(this.productId).subscribe({
      next: (data) => {
        this.product = data;
        this.header.set([
          { label: 'Productos', route: '/seller/products' },
          { label: data.name },
        ]);
        this.loading = false;
      },
      error: (err: AppError) => {
        this.error = err;
        this.loading = false;
      },
    });
  }

  /**
   * Recarga los detalles del producto actual desde el backend. Similar a load(), pero sin actualizar los estados de carga ni error, y asumiendo que el producto ya está cargado previamente. Se utiliza principalmente para refrescar los datos después de realizar acciones como activar/desactivar o ajustar stock.
   */
  private refresh(): void {
    this.productsService.getById(this.productId).subscribe({
      next: (data) => {
        this.product = data;
        this.header.set([
          { label: 'Productos', route: '/seller/products' },
          { label: data.name },
        ]);
      },
      error: () => {},
    });
  }

  /**
   * Maneja los errores de las acciones del producto.
   * @param err
   */
  private handleActionError(err: AppError): void {
    this.messageService.add({
      severity: err.status === 409 ? 'warn' : 'error',
      summary: err.status === 409 ? 'Conflicto' : 'Error',
      detail: err.message,
    });
  }
}

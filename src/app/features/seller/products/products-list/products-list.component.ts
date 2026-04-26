import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CurrencyArsPipe } from '../../../../core/pipes/currency-ars.pipe';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MockAuthService } from '../../../../core/auth/mock-auth.service';
import { AppError } from '../../../../core/models/app-error';
import { UserRoleEnum } from '../../../../core/models/types/user-role';
import { HeaderService } from '../../../../core/services/header.service';
import { EmptyStateComponent } from '../../../../shared/states/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/states/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/states/loading-state/loading-state.component';
import {
  Product,
  ProductListFilters,
  ProductStatus,
} from '../../models/product.model';
import { ProductsService } from '../products.service';
import { AppRoutes } from '../../../../shared/models/enums/routes.enum';

const LOW_STOCK_THRESHOLD = 5;

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CurrencyArsPipe,
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    TooltipModule,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit, OnDestroy {
  private readonly productsService = inject(ProductsService);
  private readonly auth = inject(MockAuthService);
  private readonly router = inject(Router);
  private readonly header = inject(HeaderService);

  products: Product[] = [];
  loading = false;
  error: AppError | null = null;

  searchTerm = '';
  selectedStatus: ProductStatus | null = null;

  readonly LOW_STOCK_THRESHOLD = LOW_STOCK_THRESHOLD;

  readonly statusOptions = [
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Inactivo', value: 'INACTIVE' },
  ];

  /**
   * Indica si el usuario actual tiene permisos para crear nuevos productos. Solo los usuarios con el rol ADMIN pueden crear productos.
   * @returns true si el usuario tiene permisos para crear productos, false en caso contrario.
   */
  get canCreate(): boolean {
    return this.auth.hasRole(UserRoleEnum.ADMIN);
  }

  private readonly searchSubject = new Subject<string>();
  private sub?: Subscription;

  ngOnInit(): void {
    this.header.set([{ label: 'Productos' }]);
    this.loadProducts();

    this.sub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadProducts());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /**
   * Maneja el cambio en el campo de búsqueda. Emite el nuevo valor de búsqueda a través del Subject para que se apliquen los filtros después de un debounce.
   * @param value
   */
  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  /**
   * Aplica los filtros seleccionados (estado y término de búsqueda) y recarga la lista de productos. Si no se ha seleccionado ningún filtro, se cargarán todos los productos.
   */
  applyFilters(): void {
    this.loadProducts();
  }

  /**
   * Navega a la página de detalle del producto.
   * @param id
   */
  navigateToDetail(id: string): void {
    this.router.navigate([AppRoutes.SELLER_PRODUCTS, id]);
  }

  /**
   * Convierte un objeto ProductCreatePayload a un objeto para ser enviado en la solicitud de creación de producto.
   */
  navigateToCreate(): void {
    this.router.navigate([AppRoutes.SELLER_PRODUCTS_NEW]);
  }

  /**
   * Trunca la descripción de un producto si excede la longitud máxima. Si la descripción es nula, devuelve un guion.
   * @param description
   * @returns
   */
  truncateDescription(description: string | null): string {
    if (!description) return '—';
    return description.length > 60
      ? description.slice(0, 60) + '...'
      : description;
  }

  /**
   * Carga los productos desde el backend aplicando los filtros seleccionados. Actualiza los estados de carga y error según corresponda. Si la carga es exitosa, actualiza la lista de productos que se muestra en la tabla.
   */
  private loadProducts(): void {
    const filters: ProductListFilters = {};
    if (this.selectedStatus) filters.status = this.selectedStatus;
    if (this.searchTerm.trim()) filters.search = this.searchTerm.trim();

    this.loading = true;
    this.error = null;
    this.productsService.list(filters).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err: AppError) => {
        this.error = err;
        this.loading = false;
      },
    });
  }
}

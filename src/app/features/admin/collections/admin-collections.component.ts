import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AppError } from '../../../core/models/app-error';
import { HeaderService } from '../../../core/services/header.service';
import { ErrorStateComponent } from '../../../shared/states/error-state/error-state.component';
import { LoadingStateComponent } from '../../../shared/states/loading-state/loading-state.component';
import { CollectionsService } from '../../collector/collections.service';
import {
  COLLECTION_FILTER_LABELS,
  CollectionFilter,
  CollectionSheet,
} from '../../collector/models/collection.model';
import { User } from '../users/user.model';
import { UsersService } from '../users/users.service';

@Component({
  selector: 'app-admin-collections',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    DropdownModule,
    InputTextModule,
    SkeletonModule,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './admin-collections.component.html',
})
export class AdminCollectionsComponent implements OnInit {
  private readonly collectionsService = inject(CollectionsService);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly header = inject(HeaderService);

  sheets: CollectionSheet[] = [];
  collectors: User[] = [];
  loading = true;
  error: AppError | null = null;

  filterCollectorId: string | null = null;
  filterDate = '';

  /**
   * Devuelve las opciones de cobradores para el filtro, formateando cada cobrador como un objeto con propiedades `label` (nombre completo del cobrador) y `value` (ID del cobrador).
   * @returns Un array de objetos con las opciones de cobradores para el filtro.
   */
  get collectorOptions(): { label: string; value: string }[] {
    return this.collectors.map((c) => ({ label: c.fullName, value: c.id }));
  }

  ngOnInit(): void {
    this.header.set([{ label: 'Planillas de cobro' }]);
    this.usersService.listCollectors().subscribe((c) => (this.collectors = c));
    this.load();
  }

  /**
   * Devuelve la etiqueta correspondiente al filtro.
   * @param f
   * @returns
   */
  filterLabel(f: CollectionFilter): string {
    return COLLECTION_FILTER_LABELS[f];
  }

  /**
   * Aplica los filtros seleccionados y recarga la lista de planillas de cobro. Si se ha seleccionado un cobrador o una fecha, se incluyen como parámetros en la solicitud para obtener solo las planillas que coincidan con esos criterios. Si no se han seleccionado filtros, se cargan todas las planillas de cobro.
   */
  applyFilters(): void {
    this.load();
  }

  /**
   * Limpia los filtros seleccionados y recarga la lista de planillas de cobro sin aplicar ningún filtro, mostrando todas las planillas disponibles.
   */
  clearFilters(): void {
    this.filterCollectorId = null;
    this.filterDate = '';
    this.load();
  }

  /**
   * Navega a la página de detalle de la planilla de cobro. Recibe como parámetro el ID de la planilla y utiliza el enrutador para redirigir al usuario a la ruta correspondiente, donde se mostrarán los detalles de la planilla seleccionada.
   */
  goToNew(): void {
    this.router.navigate(['/admin/collections/new']);
  }

  /**
   * Navega a la página de detalle de la planilla de cobro.
   * @param sheet
   */
  goToDetail(sheet: CollectionSheet): void {
    this.router.navigate(['/admin/collections', sheet.id]);
  }

  /**
   * Navega a la página de detalle del crédito asociado a una cuota. Recibe como parámetro el ID del crédito y utiliza el enrutador para redirigir al usuario a la ruta correspondiente, donde se mostrarán los detalles del crédito seleccionado.
   */
  private load(): void {
    this.loading = true;
    this.error = null;
    const filters: { collectorId?: string; date?: string } = {};
    if (this.filterCollectorId) filters.collectorId = this.filterCollectorId;
    if (this.filterDate) filters.date = this.filterDate;
    this.collectionsService.list(filters).subscribe({
      next: (data) => {
        this.sheets = data;
        this.loading = false;
      },
      error: (err: AppError) => {
        this.error = err;
        this.loading = false;
      },
    });
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { AppError } from '../../../core/models/app-error';
import { HeaderService } from '../../../core/services/header.service';
import {
  CollectionGeneratePayload,
  CollectionsService,
} from '../../collector/collections.service';
import {
  COLLECTION_FILTER_LABELS,
  CollectionFilter,
} from '../../collector/models/collection.model';
import { User } from '../users/user.model';
import { UsersService } from '../users/users.service';

@Component({
  selector: 'app-collection-generate',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    MessageModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './collection-generate.component.html',
})
export class CollectionGenerateComponent implements OnInit {
  private readonly collectionsService = inject(CollectionsService);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly header = inject(HeaderService);
  private readonly msg = inject(MessageService);

  collectors: User[] = [];
  selectedCollectorId = '';
  selectedDate = new Date().toISOString().split('T')[0];
  selectedFilter: CollectionFilter = 'TODAY';
  processing = false;

  readonly FILTER_OPTIONS = (
    Object.keys(COLLECTION_FILTER_LABELS) as CollectionFilter[]
  ).map((k) => ({ label: COLLECTION_FILTER_LABELS[k], value: k }));

  /**
   * Devuelve las opciones de cobradores para el filtro, formateando cada cobrador como un objeto con propiedades `label` (nombre completo del cobrador) y `value` (ID del cobrador).
   */
  get collectorOptions(): { label: string; value: string }[] {
    return this.collectors.map((c) => ({ label: c.fullName, value: c.id }));
  }

  /**
   * Indica si los datos seleccionados para generar la planilla de cobro son válidos. Para que los datos sean considerados válidos, se requiere que se haya seleccionado un cobrador, una fecha y un filtro. Si alguno de estos campos no tiene un valor válido, esta propiedad devolverá `false`, lo que puede ser utilizado para deshabilitar el botón de generación de la planilla hasta que se completen todos los campos requeridos.
   */
  get isValid(): boolean {
    return (
      !!this.selectedCollectorId && !!this.selectedDate && !!this.selectedFilter
    );
  }

  ngOnInit(): void {
    this.header.set([
      { label: 'Planillas de cobro', route: '/admin/collections' },
      { label: 'Generar planilla' },
    ]);
    this.usersService.listCollectors().subscribe((c) => (this.collectors = c));
  }

  /**
   * Cancela la generación de la planilla de cobro y navega de regreso a la lista de planillas. Esta función se ejecuta cuando el usuario decide no continuar con la generación de la planilla y desea volver a la vista anterior sin realizar ningún cambio.
   */
  cancel(): void {
    this.router.navigate(['/admin/collections']);
  }

  /**
   * Confirma la generación de la planilla de cobro. Esta función se ejecuta cuando el usuario hace clic en el botón de generación y los datos son válidos.
   * @returns
   */
  confirm(): void {
    if (!this.isValid) return;
    this.processing = true;
    const payload: CollectionGeneratePayload = {
      collectorId: this.selectedCollectorId,
      date: this.selectedDate,
      filter: this.selectedFilter,
    };
    this.collectionsService.generate(payload).subscribe({
      next: (sheet) => {
        this.processing = false;
        this.msg.add({
          severity: 'success',
          summary: 'Planilla generada',
          detail: `Planilla generada con ${sheet.totalItems} cuota${sheet.totalItems !== 1 ? 's' : ''}.`,
          life: 4000,
        });
        this.router.navigate(['/admin/collections', sheet.id]);
      },
      error: (err: AppError) => {
        this.processing = false;
        const is409 = err.status === 409;
        const is404 = err.status === 404;
        this.msg.add({
          severity: is409 ? 'warn' : 'error',
          summary: is404 ? 'Cobrador inactivo' : is409 ? 'Sin cuotas' : 'Error',
          detail: err.message ?? 'No se pudo generar la planilla.',
          life: 6000,
        });
      },
    });
  }
}

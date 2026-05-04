import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CurrencyArsPipe } from '../../../../../core/pipes/currency-ars.pipe';
import { ProductOperation } from '../../../../models/interface/product';
import { OperationFormService } from '../../operation-form.service';

@Component({
  selector: 'app-step-products',
  standalone: true,
  imports: [
    CurrencyArsPipe,
    FormsModule,
    DecimalPipe,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    DropdownModule,
    TagModule,
  ],
  templateUrl: './step-products.component.html',
})
export class StepProductsComponent {
  form = inject(OperationFormService);

  /**
   * Devuelve si la operación actual usa productos (solo venta a crédito).
   * @returns {boolean} true cuando corresponde mostrar y habilitar productos.
   */
  get usesProducts(): boolean {
    return this.form.selectedType() === 'VENTA';
  }

  /**
   * Cambia el tipo de operación delegando la limpieza de estado al servicio.
   * @param {'VENTA' | 'PRESTAMO'} type - Tipo elegido por el usuario.
   */
  changeOperationType(type: 'VENTA' | 'PRESTAMO') {
    this.form.setOperationType(type);
  }

  /**
   * Agrega un producto al listado seleccionado del flujo de venta.
   * @param {ProductOperation} prod - Producto elegido.
   */
  addProduct(prod: ProductOperation) {
    this.form.addProduct(prod);
  }

  /**
   * Quita un producto del listado seleccionado del flujo de venta.
   * @param {ProductOperation} prod - Producto a remover.
   */
  removeProduct(prod: ProductOperation) {
    this.form.removeProduct(prod);
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { FormatService } from '../../core/services/format.service';

export interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    InputTextareaModule,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent {
  products: Product[] = [
    {
      id: 1,
      code: 'PROD-001',
      name: 'Notebook Samsung',
      price: 35000,
      stock: 5,
      category: 'Electrónica',
      icon: 'pi-desktop',
      iconColor: '#6366f1',
    },
    {
      id: 2,
      code: 'PROD-002',
      name: 'Tablet Samsung',
      price: 12000,
      stock: 12,
      category: 'Electrónica',
      icon: 'pi-tablet',
      iconColor: '#10b981',
    },
    {
      id: 3,
      code: 'PROD-003',
      name: 'Aire Acondicionado Split',
      price: 25000,
      stock: 3,
      category: 'Electrodomésticos',
      icon: 'pi-sun',
      iconColor: '#f59e0b',
    },
    {
      id: 4,
      code: 'PROD-004',
      name: 'Monitor LG 27"',
      price: 8500,
      stock: 0,
      category: 'Electrónica',
      icon: 'pi-desktop',
      iconColor: '#ef4444',
    },
  ];

  categoryOptions = [
    { label: 'Electrónica', value: 'Electrónica' },
    { label: 'Electrodomésticos', value: 'Electrodomésticos' },
    { label: 'Ropa', value: 'Ropa' },
    { label: 'Hogar', value: 'Hogar' },
    { label: 'Otros', value: 'Otros' },
  ];

  estadoOptions = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' },
  ];

  searchTerm = '';
  showCreateModal = false;
  submitted = false;
  form: FormGroup;

  constructor(private fb: FormBuilder, private fmt: FormatService) {
    this.form = this.buildForm();
  }

  /**
   * Devuelve la lista de productos filtrada por el término de búsqueda.
   * El filtro se aplica sobre el nombre y la categoría del producto.
   * Si el término de búsqueda está vacío, se devuelve la lista completa.
   */
  get filteredProducts(): Product[] {
    if (!this.searchTerm) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term),
    );
  }

  /**
   * Calcula el margen de ganancia en porcentaje entre el precio de compra y el precio de venta.
   * Si el precio de compra es cero o no está definido, devuelve '--%'.
   * De lo contrario, calcula el porcentaje y lo formatea con un decimal seguido de '%'.
   */
  get margen(): string {
    const compra = this.form.get('precioCompra')?.value ?? 0;
    const venta = this.form.get('precioVenta')?.value ?? 0;
    if (!compra || compra === 0) return '--%';
    return this.fmt.percent((venta - compra) / compra, 1);
  }

  /**
   *  Determina el estado del stock de un producto basado en la cantidad disponible.
   * @param stock
   * @returns
   */
  getStockStatus(stock: number): 'activo' | 'stock-bajo' | 'sin-stock' {
    if (stock === 0) return 'sin-stock';
    if (stock <= 3) return 'stock-bajo';
    return 'activo';
  }

  /**
   *  Devuelve la clase CSS correspondiente al estado del stock de un producto.
   * @param stock
   * @returns
   */
  getRowClass(stock: number): string {
    const status = this.getStockStatus(stock);
    if (status === 'sin-stock') return 'row-sin-stock';
    if (status === 'stock-bajo') return 'row-stock-bajo';
    return '';
  }

  /**
   *  Formatea un número como precio en formato local con el símbolo de dólar.
   * @param price
   * @returns
   */
  formatPrice(price: number): string {
    return this.fmt.currency(price);
  }

  /**
   *  Determina si un campo del formulario es inválido y ha sido tocado o el formulario ha sido enviado.
   * @param field
   * @returns
   */
  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted);
  }

  /**
   *  Abre el modal para crear un nuevo producto.
   */
  cancelCreate(): void {
    this.showCreateModal = false;
    this.submitted = false;
    this.form = this.buildForm();
  }

  /**
   *  Guarda un nuevo producto basado en los datos del formulario. Si el formulario es inválido, no hace nada.
   * @returns
   */
  saveProduct(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    // TODO: integrate with API
    this.showCreateModal = false;
    this.submitted = false;
    this.form = this.buildForm();
  }

  /**
   *  Construye y devuelve un nuevo FormGroup con los controles necesarios para el formulario de producto, incluyendo validaciones.
   * @returns
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      codigo: ['', Validators.required],
      categoria: [null, Validators.required],
      descripcion: [''],
      marca: [''],
      modelo: [''],
      precioCompra: [null, [Validators.required, Validators.min(0)]],
      precioVenta: [null, [Validators.required, Validators.min(0)]],
      stockInicial: [0, [Validators.required, Validators.min(0)]],
      estado: ['activo', Validators.required],
    });
  }
}

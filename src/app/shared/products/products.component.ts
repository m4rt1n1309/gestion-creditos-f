import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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

import { ProductsService } from '../../features/seller/products/products.service';
import { Product as ApiProduct } from '../../features/seller/models/product.model';
import { FormatService } from '../../core/services/format.service';
import { Product } from '../models/interface/product';


function toProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    code: p.id.slice(0, 8).toUpperCase(),
    name: p.title,
    price: p.variants[0]?.currentPrice ?? 0,
    stock: p.availableCount,
    category: '',
    icon: 'pi-box',
    iconColor: '#6366f1',
  };
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
export class ProductsComponent implements OnInit {
  private readonly productsService = inject(ProductsService);

  products: Product[] = [];
  loading = false;

  // TODO: reemplazar hardcodeo por categorias propias del backend
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

  constructor(
    private fb: FormBuilder,
    private fmt: FormatService,
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    this.loadProducts();
  }

    // TODO: agregar documentacion de las funciones

  private loadProducts(): void {
    this.loading = true;
    this.productsService.list({ status: 'ACTIVE' }).subscribe({
      next: (items) => {
        this.products = items.map(toProduct);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get filteredProducts(): Product[] {
    if (!this.searchTerm) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term),
    );
  }

  get margen(): string {
    const compra = this.form.get('precioCompra')?.value ?? 0;
    const venta = this.form.get('precioVenta')?.value ?? 0;
    if (!compra || compra === 0) return '--%';
    return this.fmt.percent((venta - compra) / compra, 1);
  }

  getStockStatus(stock: number): 'activo' | 'stock-bajo' | 'sin-stock' {
    if (stock === 0) return 'sin-stock';
    if (stock <= 3) return 'stock-bajo';
    return 'activo';
  }

  getRowClass(stock: number): string {
    const status = this.getStockStatus(stock);
    if (status === 'sin-stock') return 'row-sin-stock';
    if (status === 'stock-bajo') return 'row-stock-bajo';
    return '';
  }

  formatPrice(price: number): string {
    return this.fmt.currency(price);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted);
  }

  cancelCreate(): void {
    this.showCreateModal = false;
    this.submitted = false;
    this.form = this.buildForm();
  }

  saveProduct(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    const { codigo, descripcion, marca, modelo, precioVenta, stockInicial } =
      this.form.value;
    const nameParts = [codigo, marca, modelo].filter(Boolean);
    const name = nameParts.join(' ') || descripcion || codigo;
    const description = descripcion || name;

    this.productsService
      .create({
        title: name,
        description,
      })
      .subscribe({
        next: () => {
          this.showCreateModal = false;
          this.submitted = false;
          this.form = this.buildForm();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error al crear producto', err);
        },
      });
  }

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

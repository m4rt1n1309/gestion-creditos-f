import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { FormatService } from '../../core/services/format.service';
import { ProductsService } from '../../features/seller/products/products.service';
import { ProductsComponent } from './products.component';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;

  const productsServiceMock = {
    list: jasmine.createSpy('list').and.returnValue(of([])),
    create: jasmine.createSpy('create').and.returnValue(
      of({
        id: 'prod-1',
        title: 'Producto',
        description: 'Desc',
        model: null,
        status: 'ACTIVE',
        createdAt: '',
        updatedAt: '',
        categoryId: null,
        categoryName: null,
        brandId: null,
        brandName: null,
        availableCount: 0,
        reservedCount: 0,
        soldCount: 0,
        variants: [],
      }),
    ),
  };

  const formatServiceMock = {
    currency: jasmine.createSpy('currency').and.returnValue('$0'),
    percent: jasmine.createSpy('percent').and.returnValue('0%'),
  };

  beforeEach(async () => {
    productsServiceMock.list.calls.reset();
    productsServiceMock.create.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ProductsComponent],
      providers: [
        { provide: ProductsService, useValue: productsServiceMock },
        { provide: FormatService, useValue: formatServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    component.showCreateModal = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deshabilita Guardar Producto mientras el formulario es inválido', () => {
    const button = fixture.debugElement.query(By.css('p-button')).componentInstance;

    expect(component.form.invalid).toBeTrue();
    expect(component.isCreateDisabled).toBeTrue();
    expect(button.disabled).toBeTrue();
  });

  it('habilita Guardar Producto cuando se completan los campos requeridos', () => {
    component.form.patchValue({
      codigo: 'PRD-001',
      categoria: 'Electrónica',
      precioCompra: 1000,
      precioVenta: 1500,
      stockInicial: 3,
      estado: 'activo',
    });
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('p-button')).componentInstance;

    expect(component.form.valid).toBeTrue();
    expect(component.isCreateDisabled).toBeFalse();
    expect(button.disabled).toBeFalse();
  });
});

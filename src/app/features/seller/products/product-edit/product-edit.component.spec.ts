import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { HeaderService } from '../../../../core/services/header.service';
import { ProductBrandsService } from '../../../admin/config/services/product-brands.service';
import { ProductCategoriesService } from '../../../admin/config/services/product-categories.service';
import { ProductsService } from '../products.service';
import { ProductEditComponent } from './product-edit.component';

/** Producto mínimo para que load() inicialice el formulario */
const mockProduct = {
  id: 'prod-1',
  title: 'Producto existente',
  description: '',
  model: '',
  brandId: null,
  categoryId: null,
  status: 'ACTIVE' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  availableCount: 0,
  reservedCount: 0,
  soldCount: 0,
  variants: [],
};

describe('ProductEditComponent — validadores de formulario', () => {
  let component: ProductEditComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductEditComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'prod-1' } } },
        },
        {
          provide: ProductsService,
          useValue: {
            getById: () => of(mockProduct),
            update: jasmine.createSpy(),
          },
        },
        {
          provide: ProductCategoriesService,
          useValue: { getAll: () => of([]) },
        },
        {
          provide: ProductBrandsService,
          useValue: { getAll: () => of([]) },
        },
        {
          provide: HeaderService,
          useValue: { set: jasmine.createSpy() },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('descripción con 501 caracteres → formulario inválido con error maxlength', () => {
    component.form.get('title')!.setValue('Producto existente');
    component.form.get('description')!.setValue('a'.repeat(501));

    expect(component.form.invalid).toBeTrue();
    expect(component.form.get('description')!.hasError('maxlength')).toBeTrue();
  });

  it('modelo con 101 caracteres → formulario inválido con error maxlength', () => {
    component.form.get('title')!.setValue('Producto existente');
    component.form.get('model')!.setValue('m'.repeat(101));

    expect(component.form.invalid).toBeTrue();
    expect(component.form.get('model')!.hasError('maxlength')).toBeTrue();
  });

  it('datos válidos (title + description=500 + model=100) → formulario válido', () => {
    component.form.get('title')!.setValue('Producto existente');
    component.form.get('description')!.setValue('a'.repeat(500));
    component.form.get('model')!.setValue('m'.repeat(100));

    expect(component.form.valid).toBeTrue();
  });
});

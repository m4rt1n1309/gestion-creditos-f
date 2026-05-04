import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { HeaderService } from '../../../../core/services/header.service';
import { ProductBrandsService } from '../../../admin/config/services/product-brands.service';
import { ProductCategoriesService } from '../../../admin/config/services/product-categories.service';
import { ProductsService } from '../products.service';
import { ProductCreateComponent } from './product-create.component';

describe('ProductCreateComponent — validadores de formulario', () => {
  let component: ProductCreateComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCreateComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        MessageService,
        {
          provide: ProductsService,
          useValue: { create: jasmine.createSpy() },
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

    const fixture = TestBed.createComponent(ProductCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('descripción con 501 caracteres → formulario inválido con error maxlength', () => {
    // El campo title es requerido — se lo completamos para aislar la validación de description
    component.form.get('title')!.setValue('Producto de prueba');
    component.form.get('description')!.setValue('a'.repeat(501));

    expect(component.form.invalid).toBeTrue();
    expect(component.form.get('description')!.hasError('maxlength')).toBeTrue();
  });

  it('modelo con 101 caracteres → formulario inválido con error maxlength', () => {
    component.form.get('title')!.setValue('Producto de prueba');
    component.form.get('model')!.setValue('m'.repeat(101));

    expect(component.form.invalid).toBeTrue();
    expect(component.form.get('model')!.hasError('maxlength')).toBeTrue();
  });

  it('datos válidos (title + description=500 + model=100) → formulario válido', () => {
    component.form.get('title')!.setValue('Producto de prueba');
    component.form.get('description')!.setValue('a'.repeat(500));
    component.form.get('model')!.setValue('m'.repeat(100));

    expect(component.form.valid).toBeTrue();
  });
});

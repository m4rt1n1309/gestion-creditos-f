import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OperationsComponent } from './operations.component';

describe('OperationsComponent', () => {
  let component: OperationsComponent;
  let fixture: ComponentFixture<OperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('CR-07: filtra por estado "Activo"', () => {
    component.selectedStatus = 'ACTIVO';

    const result = component.filteredOperations;

    expect(result.length).toBe(1);
    expect(result[0].status).toBe('ACTIVO');
  });

  it('CR-08: filtra por cliente ignorando tildes', () => {
    component.searchTerm = 'Perez';

    const result = component.filteredOperations;

    expect(result.length).toBe(1);
    expect(result[0].client).toContain('Pérez');
  });

  it('combina filtro de estado y búsqueda de cliente', () => {
    component.selectedStatus = 'ACTIVO';
    component.searchTerm = 'ruiz';

    const result = component.filteredOperations;

    expect(result.length).toBe(1);
    expect(result[0].client).toContain('Carlos Ruiz');
    expect(result[0].status).toBe('ACTIVO');
  });
});

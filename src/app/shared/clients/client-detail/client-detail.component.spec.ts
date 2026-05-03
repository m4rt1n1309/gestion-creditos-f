import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { ClientDetailComponent } from './client-detail.component';
import { HeaderService } from '../../../core/services/header.service';

function buildActivatedRoute(params: Record<string, string>) {
  return {
    snapshot: {
      paramMap: convertToParamMap(params),
    },
  };
}

describe('ClientDetailComponent (shared/clients)', () => {
  let component: ClientDetailComponent;
  let fixture: ComponentFixture<ClientDetailComponent>;

  async function setup(routeParams: Record<string, string>) {
    const headerServiceSpy = jasmine.createSpyObj('HeaderService', [], {
      breadcrumbs: { set: jasmine.createSpy() },
      actions: { set: jasmine.createSpy() },
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/admin/clients/mock-client-1' });

    await TestBed.configureTestingModule({
      imports: [ClientDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: buildActivatedRoute(routeParams) },
        { provide: Router, useValue: routerSpy },
        { provide: HeaderService, useValue: headerServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('debería cargar el cliente correcto cuando el parámetro de ruta es un ID válido', async () => {
    await setup({ id: 'mock-client-1' });

    expect(component.client).not.toBeNull();
    expect(component.client?.dni).toBe('27.123.456');
  });

  it('debería devolver null cuando el ID de ruta no coincide con ningún cliente', async () => {
    await setup({ id: 'id-inexistente' });

    expect(component.client).toBeNull();
  });

  it('NO debería leer el parámetro "dni" de la ruta — solo acepta "id"', async () => {
    // Si la ruta pasara "dni" en lugar de "id", el componente no debería encontrar el cliente
    await setup({ dni: '27.123.456' });

    expect(component.client).toBeNull();
  });
});

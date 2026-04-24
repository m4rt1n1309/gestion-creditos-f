import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { ProductsService } from './products.service';

const BASE = `${environment.apiBaseUrl}/products`;

const rawProduct = {
  id: 'prod-uuid-1',
  name: 'Notebook Samsung',
  description: 'Descripción de prueba',
  current_price: 35000,
  available_stock: 5,
  status: 'ACTIVE' as const,
  created_at: '2024-01-01T00:00:00.000Z',
};

const rawProductDetail = {
  ...rawProduct,
  updated_at: '2024-06-01T00:00:00.000Z',
};

describe('ProductsService', () => {
  let service: ProductsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProductsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list() sin filtros — no envía query params', (done) => {
    service.list().subscribe((products) => {
      expect(products.length).toBe(1);
      expect(products[0].name).toBe('Notebook Samsung');
      expect(products[0].currentPrice).toBe(35000);
      expect(products[0].availableStock).toBe(5);
      done();
    });

    const req = http.expectOne(BASE);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ ok: true, message: 'ok', data: [rawProduct] });
  });

  it('list() con filtros — envía solo params con valor', (done) => {
    service
      .list({ status: 'ACTIVE', search: 'Notebook' })
      .subscribe(() => done());

    const req = http.expectOne((r) => r.url === BASE);
    expect(req.request.params.get('status')).toBe('ACTIVE');
    expect(req.request.params.get('search')).toBe('Notebook');
    req.flush({ ok: true, message: 'ok', data: [rawProduct] });
  });

  it('create() — mapea camelCase a snake_case en body y respuesta a camelCase', (done) => {
    service
      .create({
        name: 'Nuevo Producto',
        description: 'Una descripción',
        currentPrice: 10000,
        availableStock: 20,
      })
      .subscribe((detail) => {
        expect(detail.name).toBe('Notebook Samsung');
        expect(detail.currentPrice).toBe(35000);
        expect(detail.availableStock).toBe(5);
        expect(detail.updatedAt).toBe('2024-06-01T00:00:00.000Z');
        done();
      });

    const req = http.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    expect(req.request.body['name']).toBe('Nuevo Producto');
    expect(req.request.body['current_price']).toBe(10000);
    expect(req.request.body['available_stock']).toBe(20);
    expect(req.request.body['description']).toBe('Una descripción');
    req.flush({ ok: true, message: 'ok', data: rawProductDetail });
  });

  it('adjustStock() — retorna StockAdjustResult con solo 3 campos mapeados', (done) => {
    service
      .adjustStock('prod-uuid-1', {
        movement: 'IN',
        quantity: 10,
        reason: 'Reposición',
      })
      .subscribe((result) => {
        expect(result.id).toBe('prod-uuid-1');
        expect(result.name).toBe('Notebook Samsung');
        expect(result.availableStock).toBe(15);
        expect(
          (result as unknown as Record<string, unknown>)['currentPrice'],
        ).toBeUndefined();
        expect(
          (result as unknown as Record<string, unknown>)['status'],
        ).toBeUndefined();
        done();
      });

    const req = http.expectOne(`${BASE}/prod-uuid-1/stock`);
    expect(req.request.method).toBe('PATCH');
    req.flush({
      ok: true,
      message: 'ok',
      data: {
        id: 'prod-uuid-1',
        name: 'Notebook Samsung',
        available_stock: 15,
      },
    });
  });

  it('update() — no incluye available_stock en el body', (done) => {
    service
      .update('prod-uuid-1', {
        name: 'Nombre editado',
        currentPrice: 45000,
      })
      .subscribe((detail) => {
        expect(detail.name).toBe('Notebook Samsung');
        done();
      });

    const req = http.expectOne(`${BASE}/prod-uuid-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body['name']).toBe('Nombre editado');
    expect(req.request.body['current_price']).toBe(45000);
    expect(req.request.body['available_stock']).toBeUndefined();
    req.flush({ ok: true, message: 'ok', data: rawProductDetail });
  });

  it('create() — error 409 se propaga con message del backend', (done) => {
    service
      .create({ name: 'Duplicado', currentPrice: 100, availableStock: 1 })
      .subscribe({
        error: (err) => {
          expect(err.status).toBe(409);
          expect(err.message).toBe(
            'Ya existe un producto registrado con ese nombre.',
          );
          done();
        },
      });

    const req = http.expectOne(BASE);
    req.flush(
      {
        ok: false,
        message: 'Ya existe un producto registrado con ese nombre.',
      },
      { status: 409, statusText: 'Conflict' },
    );
  });

  it('adjustStock() — error 409 de stock insuficiente se propaga con message del backend', (done) => {
    service
      .adjustStock('prod-uuid-1', {
        movement: 'OUT',
        quantity: 100,
        reason: 'Test',
      })
      .subscribe({
        error: (err) => {
          expect(err.status).toBe(409);
          expect(err.message).toBe(
            'Stock insuficiente. Disponible: 5 unidades.',
          );
          done();
        },
      });

    const req = http.expectOne(`${BASE}/prod-uuid-1/stock`);
    req.flush(
      { ok: false, message: 'Stock insuficiente. Disponible: 5 unidades.' },
      { status: 409, statusText: 'Conflict' },
    );
  });
});

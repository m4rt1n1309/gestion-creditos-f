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
  title: 'Notebook Samsung',
  description: 'Descripción de prueba',
  model: null,
  status: 'ACTIVE' as const,
  created_at: '2024-01-01T00:00:00.000Z',
  category_id: null,
  category_name: null,
  brand_id: null,
  brand_name: null,
  available_count: 5,
  reserved_count: 1,
  sold_count: 10,
  variants: [],
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

  it('list() — mapea availableCount/reservedCount/soldCount', (done) => {
    service.list().subscribe((products) => {
      expect(products.length).toBe(1);
      expect(products[0].title).toBe('Notebook Samsung');
      expect(products[0].availableCount).toBe(5);
      expect(products[0].reservedCount).toBe(1);
      expect(products[0].soldCount).toBe(10);
      expect((products[0] as unknown as Record<string, unknown>)['name']).toBeUndefined();
      expect((products[0] as unknown as Record<string, unknown>)['currentPrice']).toBeUndefined();
      done();
    });

    const req = http.expectOne(BASE);
    req.flush({ ok: true, message: 'ok', data: [rawProduct] });
  });

  it('list() con filtros — envía status, search y category_id', (done) => {
    service.list({ status: 'ACTIVE', search: 'Notebook', categoryId: 'cat-1' }).subscribe(() => done());

    const req = http.expectOne((r) => r.url === BASE);
    expect(req.request.params.get('status')).toBe('ACTIVE');
    expect(req.request.params.get('search')).toBe('Notebook');
    expect(req.request.params.get('category_id')).toBe('cat-1');
    req.flush({ ok: true, message: 'ok', data: [rawProduct] });
  });

  it('create() — no incluye current_price ni available_stock en el body', (done) => {
    service
      .create({ title: 'Nuevo Producto', description: 'Una descripción', brandId: 'b-1', categoryId: 'c-1' })
      .subscribe((detail) => {
        expect(detail.title).toBe('Notebook Samsung');
        expect(detail.availableCount).toBe(5);
        expect((detail as unknown as Record<string, unknown>)['currentPrice']).toBeUndefined();
        expect((detail as unknown as Record<string, unknown>)['availableStock']).toBeUndefined();
        done();
      });

    const req = http.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    expect(req.request.body['title']).toBe('Nuevo Producto');
    expect(req.request.body['brand_id']).toBe('b-1');
    expect(req.request.body['category_id']).toBe('c-1');
    expect(req.request.body['current_price']).toBeUndefined();
    expect(req.request.body['available_stock']).toBeUndefined();
    req.flush({ ok: true, message: 'ok', data: rawProductDetail });
  });

  it('update() — no incluye available_stock en el body', (done) => {
    service
      .update('prod-uuid-1', { title: 'Título editado' })
      .subscribe((detail) => {
        expect(detail.title).toBe('Notebook Samsung');
        done();
      });

    const req = http.expectOne(`${BASE}/prod-uuid-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body['title']).toBe('Título editado');
    expect(req.request.body['available_stock']).toBeUndefined();
    req.flush({ ok: true, message: 'ok', data: rawProductDetail });
  });

  it('no existe adjustStock en el servicio', () => {
    expect((service as unknown as Record<string, unknown>)['adjustStock']).toBeUndefined();
  });

  it('create() — error 409 se propaga con message del backend', (done) => {
    service.create({ title: 'Duplicado' }).subscribe({
      error: (err) => {
        expect(err.status).toBe(409);
        expect(err.message).toBe('Ya existe un producto registrado con ese título.');
        done();
      },
    });

    const req = http.expectOne(BASE);
    req.flush(
      { ok: false, message: 'Ya existe un producto registrado con ese título.' },
      { status: 409, statusText: 'Conflict' },
    );
  });
});

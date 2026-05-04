import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ApiHttpService } from '../../../../core/http/api-http.service';
import { ProductRatesService } from './product-rates.service';

const mockRaw = {
  id: 'pr-1',
  product_id: 'prod-1',
  product_name: 'Producto A',
  payment_frequency: 'MONTHLY',
  installments_count: 12,
  rate: 0.08,
  active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('ProductRatesService', () => {
  let svc: ProductRatesService;
  let api: jasmine.SpyObj<ApiHttpService>;

  beforeEach(() => {
    api = jasmine.createSpyObj('ApiHttpService', ['get', 'post', 'put', 'patch']);
    TestBed.configureTestingModule({
      providers: [ProductRatesService, { provide: ApiHttpService, useValue: api }],
    });
    svc = TestBed.inject(ProductRatesService);
  });

  it('getAll sends product_id filter', () => {
    api.get.and.returnValue(of([mockRaw]));
    svc.getAll({ productId: 'prod-1' }).subscribe((rates) => {
      expect(rates.length).toBe(1);
      expect(rates[0].productId).toBe('prod-1');
      expect(rates[0].productName).toBe('Producto A');
    });
    expect(api.get).toHaveBeenCalledWith('product-rates', { product_id: 'prod-1' });
  });

  it('getAll without filter sends empty params', () => {
    api.get.and.returnValue(of([]));
    svc.getAll().subscribe();
    expect(api.get).toHaveBeenCalledWith('product-rates', {});
  });

  it('create maps camelCase payload to snake_case body', () => {
    api.post.and.returnValue(of(mockRaw));
    let result: any;
    svc.create({
      productId: 'prod-1',
      paymentFrequency: 'MONTHLY',
      installmentsCount: 12,
      rate: 0.08,
    }).subscribe((r) => (result = r));
    const body = api.post.calls.mostRecent().args[1] as Record<string, unknown>;
    expect(body['product_id']).toBe('prod-1');
    expect(body['payment_frequency']).toBe('MONTHLY');
    expect(body['installments_count']).toBe(12);
    expect(body['rate']).toBe(0.08);
    expect(result.productId).toBe('prod-1');
    expect(result.paymentFrequency).toBe('MONTHLY');
    expect(result.installmentsCount).toBe(12);
  });

  it('error 409 propagates from create', (done) => {
    const err409 = { status: 409, message: 'Ya existe una tasa activa para esta combinación.' };
    api.post.and.returnValue(throwError(() => err409));
    svc.create({
      productId: 'prod-1',
      paymentFrequency: 'MONTHLY',
      installmentsCount: 12,
      rate: 0.08,
    }).subscribe({
      next: () => fail('expected error'),
      error: (e) => {
        expect(e.status).toBe(409);
        done();
      },
    });
  });

  it('deactivate calls PATCH deactivate endpoint', () => {
    api.patch.and.returnValue(of(undefined));
    svc.deactivate('pr-1').subscribe();
    expect(api.patch).toHaveBeenCalledWith('product-rates/pr-1/deactivate', {});
  });

  it('activate maps response to ProductRate', () => {
    api.patch.and.returnValue(of(mockRaw));
    let result: any;
    svc.activate('pr-1').subscribe((r) => (result = r));
    expect(result.active).toBe(true);
    expect(result.rate).toBe(0.08);
  });
});

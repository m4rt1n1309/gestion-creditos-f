import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ApiHttpService } from '../../../../core/http/api-http.service';
import { InterestRatesService } from './interest-rates.service';

const mockRaw = {
  id: 'r1',
  payment_frequency: 'WEEKLY',
  installments_count: 12,
  min_amount: 1000,
  max_amount: null,
  rate: 0.08,
  active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('InterestRatesService', () => {
  let svc: InterestRatesService;
  let api: jasmine.SpyObj<ApiHttpService>;

  beforeEach(() => {
    api = jasmine.createSpyObj('ApiHttpService', ['get', 'post', 'put', 'patch']);
    TestBed.configureTestingModule({
      providers: [InterestRatesService, { provide: ApiHttpService, useValue: api }],
    });
    svc = TestBed.inject(InterestRatesService);
  });

  it('getAll sends payment_frequency filter', () => {
    api.get.and.returnValue(of([mockRaw]));
    svc.getAll({ paymentFrequency: 'WEEKLY' }).subscribe((rates) => {
      expect(rates.length).toBe(1);
      expect(rates[0].paymentFrequency).toBe('WEEKLY');
    });
    expect(api.get).toHaveBeenCalledWith('interest-rates', { payment_frequency: 'WEEKLY' });
  });

  it('getAll sends active filter as string', () => {
    api.get.and.returnValue(of([]));
    svc.getAll({ active: false }).subscribe();
    expect(api.get).toHaveBeenCalledWith('interest-rates', { active: 'false' });
  });

  it('create maps maxAmount null correctly (omits field)', () => {
    api.post.and.returnValue(of({ ...mockRaw, max_amount: null }));
    let result: any;
    svc.create({ paymentFrequency: 'WEEKLY', installmentsCount: 12, minAmount: 1000, rate: 0.08 }).subscribe((r) => (result = r));
    expect(result.maxAmount).toBeNull();
    const body = api.post.calls.mostRecent().args[1] as Record<string, unknown>;
    expect(body['max_amount']).toBeUndefined();
  });

  it('create includes maxAmount when provided', () => {
    api.post.and.returnValue(of({ ...mockRaw, max_amount: 5000 }));
    svc.create({ paymentFrequency: 'WEEKLY', installmentsCount: 12, minAmount: 1000, maxAmount: 5000, rate: 0.08 }).subscribe();
    const body = api.post.calls.mostRecent().args[1] as Record<string, unknown>;
    expect(body['max_amount']).toBe(5000);
  });

  it('activate propagates 409 error', () => {
    const err = { status: 409, message: 'El rango de montos se superpone con una tasa activa existente.' };
    api.patch.and.returnValue(throwError(() => err));
    let caught: any;
    svc.activate('r1').subscribe({ error: (e) => (caught = e) });
    expect(caught.status).toBe(409);
    expect(caught.message).toContain('superpone');
  });
});

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiHttpService } from '../../../core/http/api-http.service';
import { CashRegisterService } from './cash-register.service';

const mockDashboardRaw = {
  date: '2026-04-24',
  cash_amount: 30000,
  transfer_amount: 15000,
  total_collected: 45000,
  total_egreses: 5000,
  approved_count: 12,
  pending_count: 3,
  net_balance: 40000,
  pending_amount: 8000,
  down_payments_total: 2000,
  down_payments_count: 3,
};

const mockRegisterRaw = {
  id: 'cr1',
  register_date: '2026-04-23',
  total_collected: 40000,
  cash_amount: 25000,
  transfer_amount: 15000,
  declared_cash: 25000,
  difference: 0,
  difference_status: 'EXACT',
  observations: null,
  created_at: '2026-04-23T18:00:00Z',
  closed_by_name: 'Carlos Admin',
};

describe('CashRegisterService', () => {
  let service: CashRegisterService;
  let apiSpy: jasmine.SpyObj<ApiHttpService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiHttpService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [CashRegisterService, { provide: ApiHttpService, useValue: apiSpy }],
    });
    service = TestBed.inject(CashRegisterService);
  });

  it('getDashboard maps all fields including new ones', (done) => {
    apiSpy.get.and.returnValue(of(mockDashboardRaw));
    service.getDashboard().subscribe((d) => {
      expect(d.cashAmount).toBe(30000);
      expect(d.transferAmount).toBe(15000);
      expect(d.totalCollected).toBe(45000);
      expect(d.totalEgreses).toBe(5000);
      expect(d.approvedCount).toBe(12);
      expect(d.pendingCount).toBe(3);
      expect(d.netBalance).toBe(40000);
      expect(d.pendingAmount).toBe(8000);
      expect(d.downPaymentsTotal).toBe(2000);
      expect(d.downPaymentsCount).toBe(3);
      done();
    });
  });

  it('close sends declared_cash as snake_case', () => {
    apiSpy.post.and.returnValue(of(mockRegisterRaw));
    service.close({ declaredCash: 25000 }).subscribe(() => {});
    const [, body] = apiSpy.post.calls.mostRecent().args;
    expect((body as Record<string, unknown>)['declared_cash']).toBe(25000);
  });

  it('close includes observations when provided', () => {
    apiSpy.post.and.returnValue(of(mockRegisterRaw));
    service.close({ declaredCash: 25000, observations: 'Sin novedad' }).subscribe(() => {});
    const [, body] = apiSpy.post.calls.mostRecent().args;
    expect((body as Record<string, unknown>)['observations']).toBe('Sin novedad');
  });

  it('close with force=true includes force in body', () => {
    apiSpy.post.and.returnValue(of(mockRegisterRaw));
    service.close({ declaredCash: 25000, force: true }).subscribe(() => {});
    const [, body] = apiSpy.post.calls.mostRecent().args;
    expect((body as Record<string, unknown>)['force']).toBe(true);
  });

  it('close without force does not send force field', () => {
    apiSpy.post.and.returnValue(of(mockRegisterRaw));
    service.close({ declaredCash: 25000 }).subscribe(() => {});
    const [, body] = apiSpy.post.calls.mostRecent().args;
    expect((body as Record<string, unknown>)['force']).toBeUndefined();
  });

  it('getAll maps list items to camelCase with EXACT status', (done) => {
    apiSpy.get.and.returnValue(of([mockRegisterRaw]));
    service.getAll().subscribe((items) => {
      const item = items[0];
      expect(item.totalCollected).toBe(40000);
      expect(item.declaredCash).toBe(25000);
      expect(item.differenceStatus).toBe('EXACT');
      expect(item.closedByName).toBe('Carlos Admin');
      done();
    });
  });

  it('getAll sends difference_status filter when provided', () => {
    apiSpy.get.and.returnValue(of([]));
    service.getAll({ differenceStatus: 'SHORTAGE' }).subscribe(() => {});
    const [, params] = apiSpy.get.calls.mostRecent().args;
    expect((params as Record<string, string>)['difference_status']).toBe('SHORTAGE');
  });

  it('getAll does not send difference_status when not provided', () => {
    apiSpy.get.and.returnValue(of([]));
    service.getAll().subscribe(() => {});
    const [, params] = apiSpy.get.calls.mostRecent().args;
    expect((params as Record<string, string>)['difference_status']).toBeUndefined();
  });
});

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
};

const mockRegisterRaw = {
  id: 'cr1',
  register_date: '2026-04-23',
  total_collected: 40000,
  cash_amount: 25000,
  transfer_amount: 15000,
  declared_cash: 24500,
  difference: -500,
  difference_status: 'SHORTAGE',
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

  it('getDashboard maps numeric fields to camelCase', (done) => {
    apiSpy.get.and.returnValue(of(mockDashboardRaw));
    service.getDashboard().subscribe((d) => {
      expect(d.cashAmount).toBe(30000);
      expect(d.transferAmount).toBe(15000);
      expect(d.totalCollected).toBe(45000);
      expect(d.totalEgreses).toBe(5000);
      expect(d.approvedCount).toBe(12);
      expect(d.pendingCount).toBe(3);
      done();
    });
  });

  it('close sends declared_cash as snake_case', () => {
    apiSpy.post.and.returnValue(of(mockRegisterRaw));
    service.close({ declaredCash: 24500 }).subscribe(() => {});
    const [, body] = apiSpy.post.calls.mostRecent().args;
    expect((body as Record<string, unknown>)['declared_cash']).toBe(24500);
  });

  it('close includes observations when provided', () => {
    apiSpy.post.and.returnValue(of(mockRegisterRaw));
    service
      .close({ declaredCash: 24500, observations: 'Sin novedad' })
      .subscribe(() => {});
    const [, body] = apiSpy.post.calls.mostRecent().args;
    expect((body as Record<string, unknown>)['observations']).toBe('Sin novedad');
  });

  it('getAll maps list items to camelCase', (done) => {
    apiSpy.get.and.returnValue(of([mockRegisterRaw]));
    service.getAll().subscribe((items) => {
      const item = items[0];
      expect(item.totalCollected).toBe(40000);
      expect(item.declaredCash).toBe(24500);
      expect(item.differenceStatus).toBe('SHORTAGE');
      expect(item.closedByName).toBe('Carlos Admin');
      done();
    });
  });
});

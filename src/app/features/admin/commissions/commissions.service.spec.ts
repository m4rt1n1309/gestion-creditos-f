import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiHttpService } from '../../../core/http/api-http.service';
import { CommissionsService } from './commissions.service';

const mockSummaryRaw = {
  employees: [
    {
      user_id: 'u1',
      full_name: 'Ana García',
      role: 'SELLER',
      commissions_total: 5000,
      earliest_week: '2026-04-01',
      latest_week: '2026-04-07',
      salary_amount: 0,
      total_net: 5000,
    },
  ],
};

describe('CommissionsService', () => {
  let service: CommissionsService;
  let apiSpy: jasmine.SpyObj<ApiHttpService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiHttpService', ['get', 'post', 'put']);
    TestBed.configureTestingModule({
      providers: [CommissionsService, { provide: ApiHttpService, useValue: apiSpy }],
    });
    service = TestBed.inject(CommissionsService);
  });

  it('getWeeklySummary maps employees to camelCase', (done) => {
    apiSpy.get.and.returnValue(of(mockSummaryRaw));
    service.getWeeklySummary().subscribe((summary) => {
      const emp = summary.employees[0];
      expect(emp.userId).toBe('u1');
      expect(emp.fullName).toBe('Ana García');
      expect(emp.commissionsTotal).toBe(5000);
      expect(emp.earliestWeek).toBe('2026-04-01');
      expect(emp.salaryAmount).toBe(0);
      expect(emp.totalNet).toBe(5000);
      done();
    });
  });

  it('liquidate sends correct snake_case body', () => {
    apiSpy.post.and.returnValue(
      of({
        id: 'liq1',
        user_id: 'u1',
        week_start: '2026-04-01',
        week_end: '2026-04-07',
        commissions_total: 5000,
        salary_amount: 0,
        total_paid: 5000,
        payment_method: 'CASH',
        transfer_reference: null,
        paid_at: '2026-04-08T10:00:00Z',
        paid_by: 'admin1',
        user_name: 'Ana García',
        paid_by_name: 'Carlos Admin',
      }),
    );
    service
      .liquidate({ userId: 'u1', paymentMethod: 'CASH' })
      .subscribe(() => {});
    const [, body] = apiSpy.post.calls.mostRecent().args;
    expect((body as Record<string, unknown>)['user_id']).toBe('u1');
    expect((body as Record<string, unknown>)['payment_method']).toBe('CASH');
  });

  it('liquidate includes transfer_reference when provided', () => {
    apiSpy.post.and.returnValue(
      of({
        id: 'liq2',
        user_id: 'u1',
        week_start: '2026-04-01',
        week_end: '2026-04-07',
        commissions_total: 3000,
        salary_amount: 1000,
        total_paid: 4000,
        payment_method: 'TRANSFER',
        transfer_reference: 'REF-001',
        paid_at: '2026-04-08T10:00:00Z',
        paid_by: 'admin1',
        user_name: 'Ana García',
        paid_by_name: 'Carlos Admin',
      }),
    );
    service
      .liquidate({ userId: 'u1', paymentMethod: 'TRANSFER', transferReference: 'REF-001' })
      .subscribe(() => {});
    const [, body] = apiSpy.post.calls.mostRecent().args;
    expect((body as Record<string, unknown>)['transfer_reference']).toBe('REF-001');
  });

  it('setSalary sends weekly_amount as snake_case', () => {
    apiSpy.put.and.returnValue(
      of({ user_id: 'u1', weekly_amount: 2000, active: true }),
    );
    service.setSalary('u1', 2000).subscribe(() => {});
    const [, body] = apiSpy.put.calls.mostRecent().args;
    expect((body as Record<string, unknown>)['weekly_amount']).toBe(2000);
  });
});

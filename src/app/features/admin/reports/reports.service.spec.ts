import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiHttpService } from '../../../core/http/api-http.service';
import { ReportsService } from './reports.service';

const mockCollectionRaw = {
  summary: {
    grand_total: 100000,
    total_cash: 60000,
    total_transfer: 40000,
    payments_count: 20,
    avg_payment: 5000,
  },
  daily: [
    {
      day: '2026-04-01',
      total: 10000,
      total_cash: 6000,
      total_transfer: 4000,
      payments_count: 2,
    },
  ],
};

const mockPortfolioRaw = {
  by_status_type: [
    { status: 'ACTIVE', type: 'SALE', count: 10, total_amount: 500000 },
    { status: 'SETTLED', type: 'LOAN', count: 5, total_amount: 200000 },
  ],
  active_pending_balance: 350000,
};

const mockOverdueRaw = {
  summary: {
    overdue_installments: 15,
    total_overdue_amount: 75000,
    total_penalties: 3000,
    avg_days_overdue: 12.5,
  },
  by_customer: [
    {
      customer_id: 'c1',
      customer_name: 'Juan Pérez',
      phone: '1112345678',
      overdue_count: 3,
      total_overdue: 30000,
      max_days_overdue: 20,
    },
  ],
};

const mockCollectorsRaw = [
  {
    collector_id: 'col1',
    collector_name: 'María García',
    total_payments: 50,
    approved_count: 45,
    rejected_count: 5,
    total_collected: 225000,
    approval_rate: 90.0,
  },
  {
    collector_id: 'col2',
    collector_name: 'Luis Torres',
    total_payments: 0,
    approved_count: 0,
    rejected_count: 0,
    total_collected: 0,
    approval_rate: null,
  },
];

const mockProductsRaw = [
  {
    id: 'p1',
    name: 'Producto A',
    current_price: 15000,
    available_stock: 10,
    status: 'ACTIVE',
    times_sold: 25,
    total_units_sold: 30,
    total_revenue: 450000,
  },
  {
    id: 'p2',
    name: 'Producto B',
    current_price: 8000,
    available_stock: 0,
    status: 'ACTIVE',
    times_sold: 0,
    total_units_sold: 0,
    total_revenue: 0,
  },
];

describe('ReportsService', () => {
  let service: ReportsService;
  let apiSpy: jasmine.SpyObj<ApiHttpService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiHttpService', ['get']);
    TestBed.configureTestingModule({
      providers: [ReportsService, { provide: ApiHttpService, useValue: apiSpy }],
    });
    service = TestBed.inject(ReportsService);
  });

  describe('getCollectionReport', () => {
    it('returns error observable without calling backend when dateFrom is missing', (done) => {
      service
        .getCollectionReport({ dateFrom: '', dateTo: '2026-04-30' })
        .subscribe({
          next: () => fail('expected error'),
          error: (err) => {
            expect(err.status).toBe(400);
            expect(apiSpy.get).not.toHaveBeenCalled();
            done();
          },
        });
    });

    it('returns error observable without calling backend when dateTo is missing', (done) => {
      service
        .getCollectionReport({ dateFrom: '2026-04-01', dateTo: '' })
        .subscribe({
          next: () => fail('expected error'),
          error: (err) => {
            expect(err.status).toBe(400);
            expect(apiSpy.get).not.toHaveBeenCalled();
            done();
          },
        });
    });

    it('maps response to camelCase when both dates provided', (done) => {
      apiSpy.get.and.returnValue(of(mockCollectionRaw));
      service
        .getCollectionReport({ dateFrom: '2026-04-01', dateTo: '2026-04-30' })
        .subscribe((r) => {
          expect(r.summary.grandTotal).toBe(100000);
          expect(r.summary.totalCash).toBe(60000);
          expect(r.summary.paymentsCount).toBe(20);
          expect(r.daily.length).toBe(1);
          expect(r.daily[0].totalCash).toBe(6000);
          done();
        });
    });
  });

  describe('getPortfolioReport', () => {
    it('maps byStatusType with camelCase', (done) => {
      apiSpy.get.and.returnValue(of(mockPortfolioRaw));
      service.getPortfolioReport().subscribe((r) => {
        expect(r.activePendingBalance).toBe(350000);
        expect(r.byStatusType.length).toBe(2);
        expect(r.byStatusType[0].totalAmount).toBe(500000);
        expect(r.byStatusType[0].status).toBe('ACTIVE');
        done();
      });
    });
  });

  describe('getOverdueReport', () => {
    it('maps summary fields', (done) => {
      apiSpy.get.and.returnValue(of(mockOverdueRaw));
      service.getOverdueReport().subscribe((r) => {
        expect(r.summary.overdueInstallments).toBe(15);
        expect(r.summary.totalOverdueAmount).toBe(75000);
        expect(r.summary.avgDaysOverdue).toBe(12.5);
        done();
      });
    });

    it('maps byCustomer correctly', (done) => {
      apiSpy.get.and.returnValue(of(mockOverdueRaw));
      service.getOverdueReport().subscribe((r) => {
        expect(r.byCustomer.length).toBe(1);
        expect(r.byCustomer[0].customerName).toBe('Juan Pérez');
        expect(r.byCustomer[0].maxDaysOverdue).toBe(20);
        done();
      });
    });
  });

  describe('getCollectorsReport', () => {
    it('returns error observable without calling backend when dates missing', (done) => {
      service
        .getCollectorsReport({ dateFrom: '', dateTo: '' })
        .subscribe({
          next: () => fail('expected error'),
          error: (err) => {
            expect(err.status).toBe(400);
            expect(apiSpy.get).not.toHaveBeenCalled();
            done();
          },
        });
    });

    it('maps approvalRate null as null (not 0)', (done) => {
      apiSpy.get.and.returnValue(of(mockCollectorsRaw));
      service
        .getCollectorsReport({ dateFrom: '2026-04-01', dateTo: '2026-04-30' })
        .subscribe((rows) => {
          expect(rows[0].approvalRate).toBe(90.0);
          expect(rows[1].approvalRate).toBeNull();
          done();
        });
    });
  });

  describe('getProductsReport', () => {
    it('maps all fields including zero-sales products', (done) => {
      apiSpy.get.and.returnValue(of(mockProductsRaw));
      service.getProductsReport().subscribe((rows) => {
        expect(rows.length).toBe(2);
        expect(rows[0].currentPrice).toBe(15000);
        expect(rows[0].availableStock).toBe(10);
        expect(rows[0].timesSold).toBe(25);
        expect(rows[0].totalRevenue).toBe(450000);
        expect(rows[1].timesSold).toBe(0);
        expect(rows[1].availableStock).toBe(0);
        done();
      });
    });
  });
});

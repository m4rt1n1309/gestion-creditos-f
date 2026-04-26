import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MockAuthService } from '../../../core/auth/mock-auth.service';
import { DateService } from '../../../core/services/date.service';
import { CashRegisterService } from '../cash-register/cash-register.service';
import { ReportsService } from '../reports/reports.service';
import { CreditsService } from '../../seller/operations/credits.service';
import { DashboardComponent } from './dashboard.component';

const mockDashboard = { date: '2024-01-01', cashAmount: 0, transferAmount: 0, totalCollected: 48920, totalEgreses: 0, approvedCount: 0, pendingCount: 0 };
const mockPortfolio = { byStatusType: [{ status: 'ACTIVE' as const, type: 'LOAN' as const, count: 42, totalAmount: 200000 }], activePendingBalance: 2847320 };
const mockOverdue = { summary: { overdueInstallments: 87, totalOverdueAmount: 0, totalPenalties: 0, avgDaysOverdue: null }, byCustomer: [] };
const mockCredits = [
  { id: 'c1', type: 'LOAN', totalAmount: 5000, installmentsCount: 12, paymentFrequency: 'MONTHLY', interestRate: 0.08, status: 'ACTIVE', createdAt: '2024-04-15T10:00:00Z', approvedAt: null, customerId: 'u1', customerName: 'Test User', customerDni: '12345678', createdById: null, createdByName: null },
];

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let cashSpy: jasmine.SpyObj<CashRegisterService>;
  let reportsSpy: jasmine.SpyObj<ReportsService>;
  let creditsSpy: jasmine.SpyObj<CreditsService>;
  let authSpy: jasmine.SpyObj<MockAuthService>;

  beforeEach(async () => {
    cashSpy = jasmine.createSpyObj('CashRegisterService', ['getDashboard']);
    reportsSpy = jasmine.createSpyObj('ReportsService', ['getPortfolioReport', 'getOverdueReport']);
    creditsSpy = jasmine.createSpyObj('CreditsService', ['list']);
    authSpy = jasmine.createSpyObj('MockAuthService', [], { snapshot: { name: 'Carlos López', full_name: 'Carlos López' } });

    cashSpy.getDashboard.and.returnValue(of(mockDashboard));
    reportsSpy.getPortfolioReport.and.returnValue(of(mockPortfolio));
    reportsSpy.getOverdueReport.and.returnValue(of(mockOverdue));
    creditsSpy.list.and.returnValue(of(mockCredits as any));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: MockAuthService, useValue: authSpy },
        { provide: CashRegisterService, useValue: cashSpy },
        { provide: ReportsService, useValue: reportsSpy },
        { provide: CreditsService, useValue: creditsSpy },
        { provide: DateService, useValue: { display: () => 'sábado 26 de abril, 2025' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('userName comes from authService.snapshot.name', () => {
    expect(component.userName).toBe('Carlos López');
  });

  it('forkJoin calls cashRegister, portfolio, and overdue services', () => {
    expect(cashSpy.getDashboard).toHaveBeenCalledTimes(1);
    expect(reportsSpy.getPortfolioReport).toHaveBeenCalledTimes(1);
    expect(reportsSpy.getOverdueReport).toHaveBeenCalledTimes(1);
  });

  it('KPIs populated from real services after load', () => {
    expect(component.loadingKpis).toBeFalse();
    expect(component.kpis.length).toBe(4);
    const cobrado = component.kpis.find((k) => k.label === 'Cobrado Hoy');
    expect(cobrado?.value).toContain('48.920');
  });

  it('recentOps mapped from credits list', () => {
    expect(component.loadingOps).toBeFalse();
    expect(component.recentOps.length).toBe(1);
    expect(component.recentOps[0].client).toBe('Test User');
    expect(component.recentOps[0].type).toBe('PRÉSTAMO');
  });
});

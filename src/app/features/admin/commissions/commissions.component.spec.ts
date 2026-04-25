import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HeaderService } from '../../../core/services/header.service';
import { UsersService } from '../users/users.service';
import { CommissionsService } from './commissions.service';
import { CommissionsComponent } from './commissions.component';

const mockSummary = {
  employees: [
    {
      userId: 'u1',
      fullName: 'Ana García',
      role: 'SELLER',
      commissionsTotal: 5000,
      earliestWeek: '2026-04-01',
      latestWeek: '2026-04-07',
      salaryAmount: 0,
      totalNet: 5000,
    },
  ],
};

const mockLiquidation = {
  id: 'liq1',
  userId: 'u1',
  weekStart: '2026-04-01',
  weekEnd: '2026-04-07',
  commissionsTotal: 5000,
  salaryAmount: 0,
  totalPaid: 5000,
  paymentMethod: 'CASH' as const,
  transferReference: null,
  paidAt: '2026-04-08T10:00:00Z',
  paidBy: 'admin1',
  userName: 'Ana García',
  paidByName: 'Carlos Admin',
};

describe('CommissionsComponent', () => {
  let component: CommissionsComponent;
  let fixture: ComponentFixture<CommissionsComponent>;
  let commissionsSpy: jasmine.SpyObj<CommissionsService>;
  let usersSpy: jasmine.SpyObj<UsersService>;
  let headerSpy: jasmine.SpyObj<HeaderService>;

  beforeEach(async () => {
    commissionsSpy = jasmine.createSpyObj('CommissionsService', [
      'getWeeklySummary',
      'getLiquidations',
      'liquidate',
      'getSalary',
      'setSalary',
    ]);
    usersSpy = jasmine.createSpyObj('UsersService', ['listCollectors']);
    headerSpy = jasmine.createSpyObj('HeaderService', ['set', 'reset']);

    commissionsSpy.getWeeklySummary.and.returnValue(of(mockSummary));
    commissionsSpy.getLiquidations.and.returnValue(of([]));
    usersSpy.listCollectors.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [CommissionsComponent],
      providers: [
        MessageService,
        { provide: CommissionsService, useValue: commissionsSpy },
        { provide: UsersService, useValue: usersSpy },
        { provide: HeaderService, useValue: headerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit loads summary and liquidations', () => {
    expect(commissionsSpy.getWeeklySummary).toHaveBeenCalled();
    expect(commissionsSpy.getLiquidations).toHaveBeenCalled();
    expect(component.employees.length).toBe(1);
    expect(component.employees[0].fullName).toBe('Ana García');
  });

  it('confirmLiquidate calls liquidate and prepends result', () => {
    commissionsSpy.liquidate.and.returnValue(of(mockLiquidation));
    component.selectedEmployee = mockSummary.employees[0];
    component.liquidatePaymentMethod = 'CASH';
    component.confirmLiquidate();
    expect(commissionsSpy.liquidate).toHaveBeenCalledWith(
      jasmine.objectContaining({ userId: 'u1', paymentMethod: 'CASH' }),
    );
    expect(component.liquidations[0].id).toBe('liq1');
  });

  it('confirmLiquidate shows warn on 409', () => {
    const msgSpy = spyOn((component as any).msg, 'add');
    commissionsSpy.liquidate.and.returnValue(
      throwError(() => ({ status: 409, message: 'Sin comisiones' })),
    );
    component.selectedEmployee = mockSummary.employees[0];
    component.confirmLiquidate();
    expect(msgSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'warn' }),
    );
  });
});

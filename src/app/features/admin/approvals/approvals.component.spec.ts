import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApprovalsComponent } from './approvals.component';
import { MockDataService } from '../../../mocks/mock-data.service';
import { DateService } from '../../../core/services/date.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const MOCK_ROWS = [
  {
    id: 'CR001',
    type: 'VENTA' as const,
    clientName: 'Juan Pérez',
    createdBy: 'María S.',
    amount: 35000,
    installments: 12,
    waitingHours: 4,
    status: 'PENDING_APPROVAL' as const,
    riskLevel: 'MEDIUM' as const,
    createdAt: '2026-04-15T10:00:00',
  },
  {
    id: 'CR002',
    type: 'PRÉSTAMO' as const,
    clientName: 'María López',
    createdBy: 'Carlos L.',
    amount: 15000,
    installments: 6,
    waitingHours: 52,
    status: 'PENDING_APPROVAL' as const,
    riskLevel: 'HIGH' as const,
    createdAt: '2026-04-13T10:00:00',
  },
];

describe('ApprovalsComponent', () => {
  let component: ApprovalsComponent;
  let fixture: ComponentFixture<ApprovalsComponent>;
  let mockData: jasmine.SpyObj<MockDataService>;
  let confirmSvc: ConfirmationService;

  beforeEach(async () => {
    mockData = jasmine.createSpyObj('MockDataService', [
      'getPendingApprovals',
      'approveCredit',
      'rejectCredit',
    ]);

    mockData.getPendingApprovals.and.returnValue(of([...MOCK_ROWS]));
    mockData.approveCredit.and.returnValue(of({ ok: true }));
    mockData.rejectCredit.and.returnValue(of({ ok: true }));

    await TestBed.configureTestingModule({
      imports: [ApprovalsComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: MockDataService, useValue: mockData },
        ConfirmationService,
        MessageService,
        DateService,
      ],
    })
    .overrideComponent(ApprovalsComponent, { set: { providers: [] } })
    .compileComponents();

    confirmSvc = TestBed.inject(ConfirmationService);
    spyOn(confirmSvc, 'confirm');

    fixture = TestBed.createComponent(ApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Carga de datos ─────────────────────────────────────────────────────────
  it('debería cargar las aprobaciones en ngOnInit', () => {
    expect(mockData.getPendingApprovals).toHaveBeenCalledTimes(1);
    expect(component.approvals.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('debería mostrar loading=true antes de que lleguen los datos', () => {
    // Crear una instancia fresca sin detectar cambios
    const f = TestBed.createComponent(ApprovalsComponent);
    expect(f.componentInstance.loading).toBeTrue();
  });

  it('debería manejar error en carga y desactivar loading', () => {
    mockData.getPendingApprovals.and.returnValue(
      throwError(() => new Error('500')),
    );
    const f = TestBed.createComponent(ApprovalsComponent);
    f.detectChanges();
    expect(f.componentInstance.loading).toBeFalse();
    expect(f.componentInstance.approvals.length).toBe(0);
  });

  // ── Anti-doble-submit ──────────────────────────────────────────────────────
  it('processingId debería quedar en null antes de iniciar', () => {
    expect(component.processingId).toBeNull();
  });

  it('onApprove debería ignorar el clic si processingId está activo', () => {
    component.processingId = 'CR001_approve';
    component.onApprove(MOCK_ROWS[0]);
    expect(confirmSvc.confirm).not.toHaveBeenCalled();
  });

  it('onReject debería ignorar el clic si processingId está activo', () => {
    component.processingId = 'CR001_approve';
    component.onReject(MOCK_ROWS[0]);
    expect(confirmSvc.confirm).not.toHaveBeenCalled();
  });

  // ── Lógica de aprobación ───────────────────────────────────────────────────
  it('aprobar debería quitar la fila del array y resetear processingId', () => {
    // Simular que el usuario acepta el confirm
    (confirmSvc.confirm as jasmine.Spy).and.callFake((config: any) => config.accept());

    component.onApprove(MOCK_ROWS[0]);

    expect(mockData.approveCredit).toHaveBeenCalledWith('CR001');
    expect(component.approvals.find((a) => a.id === 'CR001')).toBeUndefined();
    expect(component.processingId).toBeNull();
  });

  it('rechazar debería quitar la fila del array', () => {
    (confirmSvc.confirm as jasmine.Spy).and.callFake((config: any) => config.accept());

    component.onReject(MOCK_ROWS[1]);

    expect(mockData.rejectCredit).toHaveBeenCalledWith(
      'CR002',
      'Decisión comercial',
    );
    expect(component.approvals.find((a) => a.id === 'CR002')).toBeUndefined();
  });

  // ── Memory leak ────────────────────────────────────────────────────────────
  it('debería desuscribirse en ngOnDestroy', () => {
    const spy = spyOn(component['destroy$'], 'next').and.callThrough();
    fixture.destroy();
    expect(spy).toHaveBeenCalled();
  });
});

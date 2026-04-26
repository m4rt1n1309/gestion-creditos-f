import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomersService } from './customers.service';
import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiBaseUrl}/customers`;

const rawCustomer = {
  id: 'uuid-1',
  full_name: 'Juan Pérez',
  dni: '12345678',
  address: 'Av. Test 123',
  phone: '1111111',
  email: 'juan@test.com',
  status: 'ACTIVE' as const,
  portal_enabled: false,
  created_at: '2024-01-01T00:00:00.000Z',
  collector_id: 'col-uuid',
  collector_name: 'María López',
};

const rawDetail = {
  ...rawCustomer,
  portal_is_temp_password: false,
  portal_failed_attempts: 0,
  portal_locked_at: null,
  updated_at: '2024-06-01T00:00:00.000Z',
};

describe('CustomersService', () => {
  let service: CustomersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CustomersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list() sin filtros — no envía query params', (done) => {
    service.list().subscribe((customers) => {
      expect(customers.length).toBe(1);
      expect(customers[0].fullName).toBe('Juan Pérez');
      expect(customers[0].portalEnabled).toBe(false);
      expect(customers[0].collectorId).toBe('col-uuid');
      done();
    });

    const req = http.expectOne(BASE);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ ok: true, message: 'ok', data: [rawCustomer] });
  });

  it('list() con filtros — solo envía params con valor, omite claves vacías', (done) => {
    service.list({ status: 'ACTIVE', search: 'Juan' }).subscribe(() => done());

    const req = http.expectOne((r) => r.url === BASE);
    expect(req.request.params.get('status')).toBe('ACTIVE');
    expect(req.request.params.get('search')).toBe('Juan');
    expect(req.request.params.has('collector_id')).toBeFalse();
    req.flush({ ok: true, message: 'ok', data: [rawCustomer] });
  });

  it('getById() — mapea snake_case a camelCase correctamente', (done) => {
    service.getById('uuid-1').subscribe((detail) => {
      expect(detail.fullName).toBe('Juan Pérez');
      expect(detail.portalEnabled).toBe(false);
      expect(detail.collectorId).toBe('col-uuid');
      expect(detail.collectorName).toBe('María López');
      expect(detail.portalIsTempPassword).toBe(false);
      expect(detail.portalFailedAttempts).toBe(0);
      expect(detail.portalLockedAt).toBeNull();
      expect(detail.updatedAt).toBe('2024-06-01T00:00:00.000Z');
      done();
    });

    const req = http.expectOne(`${BASE}/uuid-1`);
    req.flush({ ok: true, message: 'ok', data: rawDetail });
  });

  it('create() — envía snake_case en body y mapea respuesta a camelCase', (done) => {
    service.create({
      fullName: 'Ana García',
      dni: '87654321',
      address: 'Calle Falsa 123',
      assignedCollectorId: 'col-uuid',
    }).subscribe((detail) => {
      expect(detail.fullName).toBe('Juan Pérez');
      expect(detail.updatedAt).toBe('2024-06-01T00:00:00.000Z');
      done();
    });

    const req = http.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    expect(req.request.body['full_name']).toBe('Ana García');
    expect(req.request.body['dni']).toBe('87654321');
    expect(req.request.body['address']).toBe('Calle Falsa 123');
    expect(req.request.body['assigned_collector_id']).toBe('col-uuid');
    expect(req.request.body['phone']).toBeUndefined();
    req.flush({ ok: true, message: 'ok', data: rawDetail });
  });

  it('create() — error 409 se propaga como AppError con el message del backend', (done) => {
    service.create({ fullName: 'Test', dni: '12345678' }).subscribe({
      error: (err) => {
        expect(err.status).toBe(409);
        expect(err.message).toBe('Ya existe un cliente registrado con ese DNI.');
        done();
      },
    });

    const req = http.expectOne(BASE);
    req.flush(
      { ok: false, message: 'Ya existe un cliente registrado con ese DNI.' },
      { status: 409, statusText: 'Conflict' },
    );
  });

  // ── 05-B: Admin operations ────────────────────────────────────────────────

  it('update() — envía snake_case sin dni en el body, mapea respuesta a camelCase', (done) => {
    service.update('uuid-1', {
      fullName: 'Juan Editado',
      address: 'Nueva Dir 456',
    }).subscribe((detail) => {
      expect(detail.fullName).toBe('Juan Pérez');
      expect(detail.updatedAt).toBe('2024-06-01T00:00:00.000Z');
      done();
    });

    const req = http.expectOne(`${BASE}/uuid-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body['full_name']).toBe('Juan Editado');
    expect(req.request.body['address']).toBe('Nueva Dir 456');
    expect(req.request.body['dni']).toBeUndefined();
    req.flush({ ok: true, message: 'ok', data: rawDetail });
  });

  it('deactivate() — emite void en éxito', (done) => {
    service.deactivate('uuid-1').subscribe({
      next: (result) => {
        expect(result).toBeUndefined();
        done();
      },
    });

    const req = http.expectOne(`${BASE}/uuid-1/deactivate`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ok: true, message: 'ok', data: null });
  });

  it('activate() — emite void en éxito', (done) => {
    service.activate('uuid-1').subscribe({
      next: (result) => {
        expect(result).toBeUndefined();
        done();
      },
    });

    const req = http.expectOne(`${BASE}/uuid-1/activate`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ok: true, message: 'ok', data: null });
  });

  it('enablePortal() — retorna { tempPassword } desde data', (done) => {
    service.enablePortal('uuid-1').subscribe((result) => {
      expect(result.tempPassword).toBe('Temp1234!');
      done();
    });

    const req = http.expectOne(`${BASE}/uuid-1/enable-portal`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ok: true, message: 'ok', data: { tempPassword: 'Temp1234!' } });
  });

  it('resetPortalPassword() — retorna { tempPassword } desde data', (done) => {
    service.resetPortalPassword('uuid-1').subscribe((result) => {
      expect(result.tempPassword).toBe('Reset5678!');
      done();
    });

    const req = http.expectOne(`${BASE}/uuid-1/reset-portal-password`);
    req.flush({ ok: true, message: 'ok', data: { tempPassword: 'Reset5678!' } });
  });

  it('deactivate() — error 409 se propaga con el message del backend', (done) => {
    service.deactivate('uuid-1').subscribe({
      error: (err) => {
        expect(err.status).toBe(409);
        expect(err.message).toBe('No se puede desactivar un cliente con créditos activos o pendientes de aprobación.');
        done();
      },
    });

    const req = http.expectOne(`${BASE}/uuid-1/deactivate`);
    req.flush(
      { ok: false, message: 'No se puede desactivar un cliente con créditos activos o pendientes de aprobación.' },
      { status: 409, statusText: 'Conflict' },
    );
  });

  it('enablePortal() — error 409 se propaga con el message del backend', (done) => {
    service.enablePortal('uuid-1').subscribe({
      error: (err) => {
        expect(err.status).toBe(409);
        expect(err.message).toBe('No se puede habilitar el portal de un cliente inactivo.');
        done();
      },
    });

    const req = http.expectOne(`${BASE}/uuid-1/enable-portal`);
    req.flush(
      { ok: false, message: 'No se puede habilitar el portal de un cliente inactivo.' },
      { status: 409, statusText: 'Conflict' },
    );
  });
});

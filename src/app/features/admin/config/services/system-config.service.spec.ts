import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiHttpService } from '../../../../core/http/api-http.service';
import { SystemConfigService } from './system-config.service';

const mockRaw = {
  key: 'commission_rate',
  value: '0.08',
  description: 'Tasa de comisión',
  updated_at: '2024-01-01T00:00:00Z',
  updated_by: null,
};

describe('SystemConfigService', () => {
  let svc: SystemConfigService;
  let api: jasmine.SpyObj<ApiHttpService>;

  beforeEach(() => {
    api = jasmine.createSpyObj('ApiHttpService', ['get', 'put', 'post']);
    TestBed.configureTestingModule({
      providers: [SystemConfigService, { provide: ApiHttpService, useValue: api }],
    });
    svc = TestBed.inject(SystemConfigService);
  });

  it('getAll maps snake_case to camelCase including updatedBy as null', () => {
    api.get.and.returnValue(of([mockRaw]));
    svc.getAll().subscribe((params) => {
      expect(params[0].updatedAt).toBe('2024-01-01T00:00:00Z');
      expect(params[0].updatedBy).toBeNull();
    });
  });

  it('update sends value as string', () => {
    api.put.and.returnValue(of(mockRaw));
    svc.update('commission_rate', { value: '0.10' }).subscribe();
    const body = api.put.calls.mostRecent().args[1] as Record<string, unknown>;
    expect(typeof body['value']).toBe('string');
    expect(body['value']).toBe('0.10');
  });

  it('update calls correct endpoint', () => {
    api.put.and.returnValue(of(mockRaw));
    svc.update('commission_rate', { value: '0.10' }).subscribe();
    expect(api.put).toHaveBeenCalledWith('system-config/commission_rate', { value: '0.10' });
  });
});

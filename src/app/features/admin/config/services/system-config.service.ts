import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../../../../core/http/api-http.service';
import {
  SystemConfigParam,
  SystemConfigParamRaw,
  SystemConfigUpdatePayload,
} from '../models/system-config.model';

/**
 * Convierte un objeto SystemConfigParamRaw a SystemConfigParam.
 * @param r
 * @returns
 */
function toParam(r: SystemConfigParamRaw): SystemConfigParam {
  return {
    key: r.key,
    value: r.value,
    description: r.description,
    updatedAt: r.updated_at,
    updatedBy: r.updated_by,
  };
}

@Injectable({ providedIn: 'root' })
export class SystemConfigService {
  private readonly api = inject(ApiHttpService);

  /**
   * Obtiene todos los parámetros de configuración del sistema.
   * @returns
   */
  getAll(): Observable<SystemConfigParam[]> {
    return this.api
      .get<SystemConfigParamRaw[]>('system-config')
      .pipe(map((items) => items.map(toParam)));
  }

  /**
   * Obtiene un parámetro de configuración del sistema por su clave.
   * @param key
   * @returns
   */
  getByKey(key: string): Observable<SystemConfigParam> {
    return this.api
      .get<SystemConfigParamRaw>(`system-config/${key}`)
      .pipe(map(toParam));
  }

  /**
   * Actualiza un parámetro de configuración del sistema.
   * @param key
   * @param payload
   * @returns
   */
  update(
    key: string,
    payload: SystemConfigUpdatePayload,
  ): Observable<SystemConfigParam> {
    return this.api
      .put<SystemConfigParamRaw>(`system-config/${key}`, {
        value: payload.value,
      })
      .pipe(map(toParam));
  }

  /**
   * Restablece un parámetro de configuración del sistema a su valor por defecto.
   * @param key
   * @returns
   */
  resetToDefault(key: string): Observable<SystemConfigParam> {
    return this.api
      .post<SystemConfigParamRaw>(`system-config/${key}/reset`)
      .pipe(map(toParam));
  }
}

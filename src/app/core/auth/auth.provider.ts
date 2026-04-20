import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MockAuthService } from './mock-auth.service';
import { AuthService } from './auth.service';

/**
 * Registra el servicio de autenticación en el contenedor DI.
 *
 * Estrategia de toggle:
 *   - useMocks = true  → MockAuthService (datos locales, sin HTTP)
 *   - useMocks = false → AuthService (llama al backend real)
 *
 * TODOS los inyectores que pidan `MockAuthService` recibirán la implementación
 * activa, sin cambiar guards, interceptors ni componentes que ya inyectan
 * MockAuthService por clase.
 *
 * APP_INITIALIZER garantiza que la sesión esté restaurada antes de que
 * Angular active cualquier ruta (necesario para que authGuard vea el usuario).
 */
export function provideAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: MockAuthService,
      useClass: environment.useMocks ? MockAuthService : AuthService,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: MockAuthService) => () => firstValueFrom(auth.restoreSession()),
      deps: [MockAuthService],
      multi: true,
    },
  ]);
}

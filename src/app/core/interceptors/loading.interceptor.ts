import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

// Endpoints de polling o background que NO deben activar el spinner global.
// Agregar paths relativos (sin base URL) según se necesite.
// Ejemplo: '/api/cash-register/dashboard' si se usa con refresh automático.
const SILENT_URLS: string[] = ['cash-register/dashboard'];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  const isSilent = SILENT_URLS.some((path) => req.url.includes(path));
  if (isSilent) return next(req);

  loading.show();
  return next(req).pipe(finalize(() => loading.hide()));
};

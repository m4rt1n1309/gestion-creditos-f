import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo adjuntar Bearer en llamadas al backend propio
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const token = typeof localStorage !== 'undefined'
    ? localStorage.getItem(environment.tokenKey)
    : null;
  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};

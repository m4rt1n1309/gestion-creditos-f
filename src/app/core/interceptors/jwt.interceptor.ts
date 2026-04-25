import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppRoutes } from '../../shared/models/enums/routes.enum';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  if (req.url.endsWith('/credits/simulate')) {
    return next(req);
  }

  const isPortalUrl = req.url.includes(AppRoutes.PORTAL);
  const tokenKey = isPortalUrl
    ? environment.portalTokenKey
    : environment.tokenKey;

  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem(tokenKey) : null;
  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};

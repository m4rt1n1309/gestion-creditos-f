import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AppRoutes } from '../../shared/models/enums/routes.enum';
import { MockAuthService } from '../auth/mock-auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(MockAuthService);

  return next(req).pipe(
    catchError((err) => {
      if (!req.url.startsWith(environment.apiBaseUrl)) {
        return throwError(() => err);
      }

      if (err?.status === 401) {
        if (req.url.includes(AppRoutes.PORTAL)) {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(environment.portalTokenKey);
            localStorage.removeItem('sgcf_portal_customer');
          }
          router.navigate([AppRoutes.PORTAL_LOGIN]);
        } else {
          auth.clearSession();
          router.navigate([AppRoutes.LOGIN]);
        }
      }

      if (err?.status === 403) {
        router.navigate([AppRoutes.CHANGE_PASSWORD]);
      }

      return throwError(() => err);
    }),
  );
};

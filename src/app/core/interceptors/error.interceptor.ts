import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AppRoutes } from '../../shared/models/enums/routes.enum';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err) => {
      if (!req.url.startsWith(environment.apiBaseUrl)) {
        return throwError(() => err);
      }

      if (err?.status === 401) {
        if (typeof localStorage !== 'undefined') {
          if (req.url.includes(AppRoutes.PORTAL)) {
            localStorage.removeItem(environment.portalTokenKey);
            localStorage.removeItem('sgcf_portal_customer');
            router.navigate([AppRoutes.PORTAL_LOGIN]);
          } else {
            localStorage.removeItem(environment.tokenKey);
            localStorage.removeItem('sgcf_user');
            router.navigate([AppRoutes.LOGIN]);
          }
        }
      }

      if (err?.status === 403) {
        // "Debés cambiar tu contraseña antes de continuar." (is_temp_password)
        // TODO (prompt-05): crear ruta /change-password y descomentar la navegación
        // router.navigate([AppRoutes.CHANGE_PASSWORD]);
      }

      return throwError(() => err);
    }),
  );
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MockAuthService } from '../auth/mock-auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(MockAuthService);
  const token = auth.token;

  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MockAuthService } from './mock-auth.service';
import { AppRoutes } from '../../shared/models/enums/routes.enum';

export const tempPasswordGuard: CanActivateFn = () => {
  const auth = inject(MockAuthService);
  const router = inject(Router);

  const user = auth.snapshot;
  if (user && user.is_temp_password) {
    return router.createUrlTree([AppRoutes.CHANGE_PASSWORD]);
  }
  return true;
};

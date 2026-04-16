import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MockAuthService } from './mock-auth.service';
import { UserRole } from '../models/types/user-role';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(MockAuthService);
  const router = inject(Router);
  const roles = route.data['roles'] as UserRole[];

  if (auth.hasAnyRole(roles)) return true;
  return router.createUrlTree(['/unauthorized']);
};

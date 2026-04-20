import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MockAuthService } from './mock-auth.service';

export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(MockAuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return true;

  const user = auth.snapshot!;
  if (user.roles.includes('ADMIN')) return router.createUrlTree(['/admin']);
  if (user.roles.includes('SELLER')) return router.createUrlTree(['/seller']);
  if (user.roles.includes('COLLECTOR')) return router.createUrlTree(['/collector']);
  return router.createUrlTree(['/admin']);
};

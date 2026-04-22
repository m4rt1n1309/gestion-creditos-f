import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { noAuthGuard } from './core/auth/no-auth.guard';
import { Roles } from './shared/models/enums/roles.enum';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/public/login/login.routes').then(
        (r) => r.LOGIN_ROUTES,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Roles.ADMIN] },
    loadChildren: () =>
      import('./features/admin/admin.routes').then((r) => r.ADMIN_ROUTES),
  },
  {
    path: 'seller',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: [
        Roles.SELLER,
        Roles.ADMIN,
        Roles.COLLECTOR,
        Roles.SELLER_COLLECTOR,
      ],
    },
    loadChildren: () =>
      import('./features/seller/seller.routes').then((r) => r.SELLER_ROUTES),
  },
  {
    path: 'collector',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Roles.COLLECTOR] },
    loadChildren: () =>
      import('./features/collector/collector.routes').then(
        (r) => r.COLLECTOR_ROUTES,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/public/forgot-password/forgot-password.component').then(
        (c) => c.ForgotPasswordComponent,
      ),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];

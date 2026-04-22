import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { AppRoutes } from '../../shared/models/enums/routes.enum';

export const SELLER_ROUTES: Routes = [
  {
    path: AppRoutes.OPERATIONS,
    loadComponent: () =>
      import('../../shared/operations/operations.component').then(
        (c) => c.OperationsComponent,
      ),
  },
  {
    path: AppRoutes.CLIENTS,
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'SELLER', 'COLLECTOR', 'SELLER_COLLECTOR'] },
    loadComponent: () =>
      import('./clients/clients-list/clients-list.component').then(
        (c) => c.ClientsListComponent,
      ),
  },
  {
    path: AppRoutes.CLIENTS_NEW,
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'SELLER', 'SELLER_COLLECTOR'] },
    loadComponent: () =>
      import('./clients/client-create/client-create.component').then(
        (c) => c.ClientCreateComponent,
      ),
  },
  {
    path: AppRoutes.CLIENTS_DETAIL,
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'SELLER', 'COLLECTOR', 'SELLER_COLLECTOR'] },
    loadComponent: () =>
      import('./clients/client-detail/client-detail.component').then(
        (c) => c.ClientDetailComponent,
      ),
  },
  {
    path: AppRoutes.PRODUCTS,
    loadComponent: () =>
      import('../../shared/products/products.component').then(
        (c) => c.ProductsComponent,
      ),
  },
  { path: '', redirectTo: 'operations', pathMatch: 'full' },
];

import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const SELLER_ROUTES: Routes = [
  {
    path: 'operations',
    loadComponent: () =>
      import('../../shared/operations/operations.component').then(
        (c) => c.OperationsComponent,
      ),
  },
  {
    path: 'clients',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'SELLER', 'COLLECTOR', 'SELLER_COLLECTOR'] },
    loadComponent: () =>
      import('./clients/clients-list/clients-list.component').then(
        (c) => c.ClientsListComponent,
      ),
  },
  {
    path: 'clients/new',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'SELLER', 'SELLER_COLLECTOR'] },
    loadComponent: () =>
      import('./clients/client-create/client-create.component').then(
        (c) => c.ClientCreateComponent,
      ),
  },
  {
    path: 'clients/:id',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'SELLER', 'COLLECTOR', 'SELLER_COLLECTOR'] },
    loadComponent: () =>
      import('./clients/client-detail/client-detail.component').then(
        (c) => c.ClientDetailComponent,
      ),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('../../shared/products/products.component').then(
        (c) => c.ProductsComponent,
      ),
  },
  { path: '', redirectTo: 'operations', pathMatch: 'full' },
];

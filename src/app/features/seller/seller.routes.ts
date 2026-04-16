import { Routes } from '@angular/router';

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
    loadComponent: () =>
      import('../../shared/clients/clients.component').then(
        (c) => c.ClientsComponent,
      ),
  },
  {
    path: 'clients/:dni',
    loadComponent: () =>
      import('../../shared/clients/client-detail/client-detail.component').then(
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

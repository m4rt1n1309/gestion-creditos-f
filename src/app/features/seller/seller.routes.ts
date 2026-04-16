import { Routes } from '@angular/router';

export const SELLER_ROUTES: Routes = [
  {
    path: 'operations',
    loadComponent: () =>
      import('./operations/operations.component').then(
        (c) => c.OperationsComponent,
      ),
  },
  { path: '', redirectTo: 'operations', pathMatch: 'full' },
];

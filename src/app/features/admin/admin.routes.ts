import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (c) => c.DashboardComponent,
      ),
  },
  {
    path: 'operations/new',
    loadComponent: () =>
      import('../../shared/operations/new-operation/new-operation.component').then(
        (c) => c.NewOperationComponent,
      ),
  },
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
  {
    path: 'approvals',
    loadComponent: () =>
      import('./approvals/approvals.component').then(
        (c) => c.ApprovalsComponent,
      ),
  },
  {
    path: 'delinquency',
    loadComponent: () =>
      import('./delinquency/delinquency.component').then(
        (c) => c.DelinquencyComponent,
      ),
  },
  {
    path: 'cash-register',
    loadComponent: () =>
      import('./cash-register/cash-register.component').then(
        (c) => c.CashRegisterComponent,
      ),
  },
  {
    path: 'sheet',
    loadComponent: () =>
      import('./sheet/sheet.component').then((c) => c.SheetComponent),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./reports/reports.component').then((c) => c.ReportsComponent),
  },
  {
    path: 'config',
    loadComponent: () =>
      import('./config/config.component').then((c) => c.ConfigComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

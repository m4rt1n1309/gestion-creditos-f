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
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

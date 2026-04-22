import { Routes } from '@angular/router';
import { AppRoutes } from '../../shared/models/enums/routes.enum';

export const ADMIN_ROUTES: Routes = [
  {
    path: AppRoutes.DASHBOARD,
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (c) => c.DashboardComponent,
      ),
  },
  {
    path: AppRoutes.OPERATIONS_NEW,
    loadComponent: () =>
      import('../../shared/operations/new-operation/new-operation.component').then(
        (c) => c.NewOperationComponent,
      ),
  },
  {
    path: AppRoutes.OPERATIONS,
    loadComponent: () =>
      import('../../shared/operations/operations.component').then(
        (c) => c.OperationsComponent,
      ),
  },
  {
    path: AppRoutes.CLIENTS,
    loadComponent: () =>
      import('../../shared/clients/clients.component').then(
        (c) => c.ClientsComponent,
      ),
  },
  {
    path: AppRoutes.CLIENTS_DETAIL,
    loadComponent: () =>
      import('../../shared/clients/client-detail/client-detail.component').then(
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
  {
    path: AppRoutes.USERS_NEW,
    loadComponent: () =>
      import('./users/user-create/user-create.component').then(
        (c) => c.UserCreateComponent,
      ),
  },
  {
    path: AppRoutes.USERS_DETAIL,
    loadComponent: () =>
      import('./users/user-detail/user-detail.component').then(
        (c) => c.UserDetailComponent,
      ),
  },
  {
    path: AppRoutes.USERS,
    loadComponent: () =>
      import('./users/users-list/users-list.component').then(
        (c) => c.UsersListComponent,
      ),
  },
  {
    path: AppRoutes.APPROVALS,
    loadComponent: () =>
      import('./approvals/approvals.component').then(
        (c) => c.ApprovalsComponent,
      ),
  },
  {
    path: AppRoutes.DELINQUENCY,
    loadComponent: () =>
      import('./delinquency/delinquency.component').then(
        (c) => c.DelinquencyComponent,
      ),
  },
  {
    path: AppRoutes.CASH_REGISTER,
    loadComponent: () =>
      import('./cash-register/cash-register.component').then(
        (c) => c.CashRegisterComponent,
      ),
  },
  {
    path: AppRoutes.SHEET,
    loadComponent: () =>
      import('./sheet/sheet.component').then((c) => c.SheetComponent),
  },
  {
    path: AppRoutes.REPORTS,
    loadComponent: () =>
      import('./reports/reports.component').then((c) => c.ReportsComponent),
  },
  {
    path: AppRoutes.CONFIG,
    loadComponent: () =>
      import('./config/config.component').then((c) => c.ConfigComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

import { Routes } from '@angular/router';

export const COLLECTOR_ROUTES: Routes = [
  {
    path: 'route',
    loadComponent: () =>
      import('./route/route.component').then((c) => c.RouteComponent),
  },
  { path: '', redirectTo: 'route', pathMatch: 'full' },
];

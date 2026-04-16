import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MockAuthService } from '../../../core/auth/mock-auth.service';
import { UserRole } from '../../../core/models/types/user-role';
import { AppRoutes } from '../../models/enums/routes.enum';
import { AuthUser } from '../../../core/models/interface/auth-user';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  requiredRoles: UserRole[];
  badge?: number;
  dividerAfter?: boolean;
}

export const NAV_CONFIG: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'pi pi-th-large',
    route: AppRoutes.ADMIN_DASHBOARD,
    requiredRoles: ['ADMIN'],
  },
  {
    label: 'Operaciones',
    icon: 'pi pi-file-edit',
    route: AppRoutes.SELLER_OPERATIONS,
    requiredRoles: ['ADMIN', 'SELLER'],
  },
  {
    label: 'Clientes',
    icon: 'pi pi-users',
    route: AppRoutes.SELLER_CLIENTS,
    requiredRoles: ['ADMIN', 'SELLER'],
  },
  {
    label: 'Productos',
    icon: 'pi pi-box',
    route: AppRoutes.SELLER_PRODUCTS,
    requiredRoles: ['ADMIN', 'SELLER'],
  },
  {
    label: 'Aprobaciones',
    icon: 'pi pi-check-square',
    route: AppRoutes.ADMIN_APPROVALS,
    requiredRoles: ['ADMIN'],
    badge: 3,
  },
  {
    label: 'Mora y Canc.',
    icon: 'pi pi-exclamation-triangle',
    route: AppRoutes.ADMIN_DELINQUENCY,
    requiredRoles: ['ADMIN'],
  },
  {
    label: 'Planilla',
    icon: 'pi pi-list',
    route: AppRoutes.ADMIN_SHEET,
    requiredRoles: ['ADMIN'],
  },
  {
    label: 'Caja',
    icon: 'pi pi-wallet',
    route: AppRoutes.ADMIN_CASH_REGISTER,
    requiredRoles: ['ADMIN'],
    dividerAfter: true,
  },
  {
    label: 'Reportes',
    icon: 'pi pi-chart-bar',
    route: AppRoutes.ADMIN_REPORTS,
    requiredRoles: ['ADMIN'],
  },
  {
    label: 'Configuración',
    icon: 'pi pi-cog',
    route: AppRoutes.ADMIN_CONFIG,
    requiredRoles: ['ADMIN'],
  },
  {
    label: 'Mi Ruta',
    icon: 'pi pi-map',
    route: AppRoutes.COLLECTOR_ROUTE,
    requiredRoles: ['COLLECTOR'],
  },
];

@Component({
  selector: 'sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  visibleItems: NavItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(private auth: MockAuthService) {}

  ngOnInit(): void {
    this.auth.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      this.visibleItems = this.filterByRole(user);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   *  Filtra los items de navegación según los roles del usuario. Si el item no requiere roles, se muestra a todos.
   * @param user
   * @returns
   */
  filterByRole(user: AuthUser | null): NavItem[] {
    if (!user) return [];
    return NAV_CONFIG.filter(
      (item) =>
        item.requiredRoles.length === 0 ||
        item.requiredRoles.some((r) => user.roles.includes(r)),
    );
  }

  /**
   * Cierra la sesión del usuario actual. Se llama al hacer clic en "Cerrar Sesión" en el sidebar.
   * Redirige a la página de login y limpia el estado de autenticación.
   */
  logout(): void {
    this.auth.logout();
  }
}

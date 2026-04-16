import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MockAuthService } from '../../../core/auth/mock-auth.service';
import { AuthUser } from '../../../core/models/interface/auth-user';
import { NavItem } from '../../models/interface/nav-item';
import { NAV_CONFIG } from '../../utils/nav-config';

@Component({
  selector: 'sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    BadgeModule,
    AvatarModule,
    RippleModule,
  ],
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
   * Filtra los items de navegación según los roles del usuario. Si el item no requiere roles, se muestra a todos.
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

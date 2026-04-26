import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AppRoutes } from '../../../shared/models/enums/routes.enum';
import { PortalAuthService } from '../auth/portal-auth.service';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonModule, MessageModule],
  templateUrl: './portal-layout.component.html',
})
export class PortalLayoutComponent {
  private readonly auth = inject(PortalAuthService);
  private readonly router = inject(Router);

  /**
   * Devuelve el cliente autenticado actualmente, o null si no hay ninguno.
   */
  get customer() {
    return this.auth.snapshot;
  }

  /**
   * Cierra la sesión del cliente actual y redirige a la página de login del portal.
   */
  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate([AppRoutes.PORTAL_LOGIN]),
      error: () => this.router.navigate([AppRoutes.PORTAL_LOGIN]),
    });
  }
}

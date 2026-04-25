import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AppRoutes } from '../../../shared/models/enums/routes.enum';
import { PortalAuthService } from '../auth/portal-auth.service';

@Component({
  selector: 'app-portal-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
  ],
  templateUrl: './portal-login.component.html',
})
export class PortalLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(PortalAuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    dni: ['', Validators.required],
    password: ['', Validators.required],
  });

  loading = false;
  submitted = false;
  errorMessage = '';

  /**
   * Maneja el envío del formulario de inicio de sesión.
   * @returns
   */
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) return;

    this.loading = true;
    this.auth
      .login(this.form.getRawValue() as { dni: string; password: string })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate([AppRoutes.PORTAL_DASHBOARD]);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.message ?? 'Error al iniciar sesión.';
        },
      });
  }
}

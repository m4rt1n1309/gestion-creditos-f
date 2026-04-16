import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import { MockAuthService } from '../../../core/auth/mock-auth.service';
import { AppRoutes } from '../../../shared/models/enums/routes.enum';
import { UserRole, UserRoleEnum } from './../../../core/models/types/user-role';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  rememberMe = false;

  quickAccess = [
    { label: 'Admin', email: 'admin@siscreditos.com' },
    { label: 'Vendedor', email: 'vendedor@siscreditos.com' },
    { label: 'Cobrador', email: 'cobrador@siscreditos.com' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: MockAuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Getter para acceder fácilmente a los controles del formulario en la plantilla. Permite validar y mostrar errores de forma más limpia.
   */
  get formControls() {
    return this.form.controls;
  }

  /**
   * Maneja el envío del formulario de login. Valida el formulario, muestra un spinner de carga, y llama al servicio de autenticación. Si el login es exitoso, redirige al usuario según su rol. Si falla, muestra un mensaje de error.
   * @returns
   */
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) return;

    this.loading = true;
    this.auth
      .login(this.form.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => this.redirectByRole(user.roles),
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.message ?? 'Credenciales incorrectas.';
        },
      });
  }

  /**
   * Función de acceso rápido para probar con diferentes roles. Rellena el formulario con el email proporcionado y una contraseña mock, luego envía el formulario.
   * @param email
   */
  goToForgotPassword(): void {
    this.router.navigate([AppRoutes.FORGOT_PASSWORD]);
  }

  quickLogin(email: string): void {
    this.form.patchValue({ email, password: 'mock123' });
    this.onSubmit();
  }

  /**
   * Redirige al usuario según su rol. Si tiene múltiples roles, se prioriza ADMIN > SELLER > COLLECTOR.
   * @param roles
   * @returns
   */
  private redirectByRole(roles: UserRole[]): void {
    this.loading = false;
    if (roles.includes(UserRoleEnum.ADMIN))
      return void this.router.navigate([AppRoutes.ADMIN_DASHBOARD]);
    if (roles.includes(UserRoleEnum.SELLER))
      return void this.router.navigate([AppRoutes.SELLER_OPERATIONS]);
    if (roles.includes(UserRoleEnum.COLLECTOR))
      return void this.router.navigate([AppRoutes.COLLECTOR_ROUTE]);
    this.router.navigate([AppRoutes.LOGIN]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

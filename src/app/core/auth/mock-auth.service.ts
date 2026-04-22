import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const isBrowser = typeof localStorage !== 'undefined';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthServiceBase } from './auth-service.base';
import { AuthUser } from '../models/interface/auth-user';
import { LoginCredentials } from '../models/interface/login-credentials';
import { AuthError } from '../models/interface/auth.error';
import { UserRole } from '../models/types/user-role';
import { Roles } from '../../shared/models/enums/roles.enum';

// ── Usuarios mock ─────────────────────────────────────────────────────────────
// DNIs usados como credencial de login (igual que el backend real).
// quickAccess en login.component usa estos DNIs.
export const MOCK_USERS: AuthUser[] = [
  {
    id: 'usr-001',
    full_name: 'Carlos López',
    name: 'Carlos López',
    dni: '12345678',
    email: 'admin@siscreditos.com',
    avatar: 'CL',
    roles: [Roles.ADMIN],
    is_temp_password: false,
    force_relogin_at: null,
    token:
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAxIiwicm9sZSI6IkFETUlOIiwiYXVkIjoic2lzdGVtYS1pbnRlcm5vIn0.mock_admin',
  },
  {
    id: 'usr-002',
    full_name: 'María Sánchez',
    name: 'María Sánchez',
    dni: '87654321',
    email: 'vendedor@siscreditos.com',
    avatar: 'MS',
    roles: ['SELLER'],
    is_temp_password: false,
    force_relogin_at: null,
    token:
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAyIiwicm9sZSI6IlNFTExFUiIsImF1ZCI6InNpc3RlbWEtaW50ZXJubyJ9.mock_seller',
  },
  {
    id: 'usr-003',
    full_name: 'Juan Pedraza',
    name: 'Juan Pedraza',
    dni: '11223344',
    email: 'cobrador@siscreditos.com',
    avatar: 'JP',
    roles: ['COLLECTOR'],
    is_temp_password: false,
    force_relogin_at: null,
    token:
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAzIiwicm9sZSI6IkNPTExFQ1RPUiIsImF1ZCI6InNpc3RlbWEtaW50ZXJubyJ9.mock_collector',
  },
];

// ── Servicio ──────────────────────────────────────────────────────────────────
@Injectable()
export class MockAuthService extends AuthServiceBase {
  private readonly TOKEN_KEY = 'sgcf_token';
  private readonly USER_KEY  = 'sgcf_user';
  readonly NETWORK_LATENCY_MS = 800;

  private _user$ = new BehaviorSubject<AuthUser | null>(this.rehydrate());
  readonly currentUser$ = this._user$.asObservable();

  constructor(private router: Router) {
    super();
  }

  // ── Login — autenticación por DNI (igual que el backend real) ────────────
  login(credentials: LoginCredentials): Observable<AuthUser> {
    const match = MOCK_USERS.find((u) => u.dni === credentials.dni);

    if (!match) {
      return throwError(
        (): AuthError => ({
          status: 401,
          message: 'Credenciales incorrectas. Verificá tus datos e intentá nuevamente.',
        }),
      ).pipe(delay(this.NETWORK_LATENCY_MS));
    }

    return of(match).pipe(
      delay(this.NETWORK_LATENCY_MS),
      tap((user) => this.persist(user)),
    );
  }

  logout(): void {
    if (isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this._user$.next(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: UserRole): boolean {
    return this._user$.value?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((r) => this.hasRole(r));
  }

  isAuthenticated(): boolean {
    return !!this._user$.value;
  }

  get snapshot(): AuthUser | null {
    return this._user$.value;
  }

  get token(): string | null {
    return isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  // No-op: mock ya rehidrata sincronamente en el constructor.
  restoreSession(): Observable<void> {
    return of(undefined);
  }

  private persist(user: AuthUser): void {
    if (isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, user.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this._user$.next(user);
  }

  private rehydrate(): AuthUser | null {
    if (!isBrowser) return null;
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}

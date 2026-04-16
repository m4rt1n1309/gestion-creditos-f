import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthUser } from '../models/interface/auth-user';
import { LoginCredentials } from '../models/interface/login-credentials';
import { AuthError } from '../models/interface/auth.error';
import { UserRole } from '../models/types/user-role';



// ── Usuarios mock — representan los mockups exactos ──────────────────────────
export const MOCK_USERS: AuthUser[] = [
  {
    id: 'usr-001',
    name: 'Carlos López',
    email: 'admin@siscreditos.com',
    avatar: 'CL',
    roles: ['ADMIN'],
    // payload decodificado: { sub: 'usr-001', roles: ['ADMIN'], aud: 'sistema-interno', exp: 8h }
    token:
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAxIiwicm9sZXMiOlsiQURNSU4iXSwiYXVkIjoic2lzdGVtYS1pbnRlcm5vIn0.mock_admin',
  },
  {
    id: 'usr-002',
    name: 'María Sánchez',
    email: 'vendedor@siscreditos.com',
    avatar: 'MS',
    roles: ['SELLER'],
    token:
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAyIiwicm9sZXMiOlsiU0VMTEVSIl0sImF1ZCI6InNpc3RlbWEtaW50ZXJubyJ9.mock_seller',
  },
  {
    id: 'usr-003',
    name: 'Juan Pedraza',
    email: 'cobrador@siscreditos.com',
    avatar: 'JP',
    roles: ['COLLECTOR'],
    token:
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAzIiwicm9sZXMiOlsiQ09MTEVDVE9SIl0sImF1ZCI6InNpc3RlbWEtaW50ZXJubyJ9.mock_collector',
  },
];

// ── Servicio ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class MockAuthService {
  private readonly TOKEN_KEY = 'sgcf_token';
  private readonly USER_KEY = 'sgcf_user';
  readonly NETWORK_LATENCY_MS = 800; // visible en tests para acelerar

  private _user$ = new BehaviorSubject<AuthUser | null>(this.rehydrate());
  readonly currentUser$ = this._user$.asObservable();

  constructor(private router: Router) {}

  // ── Login ─────────────────────────────────────────────────────────────────
  login(credentials: LoginCredentials): Observable<AuthUser> {
    const match = MOCK_USERS.find((u) => u.email === credentials.email);

    if (!match) {
      // Simula 401 con latencia — idéntico a un servidor real
      return throwError(
        (): AuthError => ({
          status: 401,
          message:
            'Credenciales incorrectas. Verificá tus datos e intentá nuevamente.',
        }),
      ).pipe(delay(this.NETWORK_LATENCY_MS));
    }

    return of(match).pipe(
      delay(this.NETWORK_LATENCY_MS),
      tap((user) => this.persist(user)),
    );
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user$.next(null);
    this.router.navigate(['/login']);
  }

  // ── Queries de rol ────────────────────────────────────────────────────────
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
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ── Privados ──────────────────────────────────────────────────────────────
  private persist(user: AuthUser): void {
    localStorage.setItem(this.TOKEN_KEY, user.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user$.next(user);
  }

  private rehydrate(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}

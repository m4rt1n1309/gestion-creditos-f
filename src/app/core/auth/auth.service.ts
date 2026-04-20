import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { ApiHttpService } from '../http/api-http.service';
import { AuthUser } from '../models/interface/auth-user';
import { LoginCredentials } from '../models/interface/login-credentials';
import { UserRole } from '../models/types/user-role';
import { environment } from '../../../environments/environment';
import { AuthServiceBase } from './auth-service.base';

// ── Shapes de respuesta del backend ──────────────────────────────────────────
// Fuente verificada: back/src/modules/auth/auth.service.js → loginInternal()
interface LoginUserPayload {
  id: string;
  full_name: string;
  dni: string;
  role: string;
  is_temp_password: boolean;
}

interface LoginResponseData {
  token: string;
  user: LoginUserPayload;
}

// Fuente: back/src/middlewares/auth.middleware.js → _verifyInternalSession()
interface MeResponseData {
  id: string;
  full_name: string;
  dni: string;
  role: string;
  status: string;
  is_temp_password: boolean;
  force_relogin_at: string | null;
}
// ─────────────────────────────────────────────────────────────────────────────

/** true solo en entornos browser — false en SSR/Node (prerender) */
const isBrowser = typeof localStorage !== 'undefined';

@Injectable()
export class AuthService extends AuthServiceBase {
  private readonly api    = inject(ApiHttpService);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = environment.tokenKey;
  private readonly USER_KEY  = 'sgcf_user';

  // Rehidratación síncrona desde localStorage para que los guards no flasheen
  // a /login en el primer render. Se valida después en restoreSession().
  private _user$ = new BehaviorSubject<AuthUser | null>(this.readStoredUser());
  readonly currentUser$ = this._user$.asObservable();

  // ── Login ─────────────────────────────────────────────────────────────────
  login(credentials: LoginCredentials): Observable<AuthUser> {
    return this.api.post<LoginResponseData>('auth/login', credentials).pipe(
      map((data) => this.mapLoginUser(data)),
      tap((user) => this.persist(user)),
    );
  }

  // ── Logout — best-effort: limpia local aunque el POST falle ──────────────
  logout(): void {
    this.api.post<void>('auth/logout').pipe(catchError(() => of(null))).subscribe();
    this.clear();
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
    return isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  // ── Restauración de sesión (APP_INITIALIZER) ──────────────────────────────
  // Valida el token almacenado con GET /api/auth/me.
  // Si responde con 401 (token expirado/blacklisteado), el error.interceptor
  // ya limpia el token; aquí solo sincronizamos _user$.
  restoreSession(): Observable<void> {
    if (!this.token) return of(undefined);

    return this.api.get<MeResponseData>('auth/me').pipe(
      tap((me) => {
        const user = this.mapMeUser(me, this.token!);
        this.persist(user);
      }),
      map(() => undefined),
      catchError(() => {
        this.clear();
        return of(undefined);
      }),
    );
  }

  // ── Privados ──────────────────────────────────────────────────────────────
  private mapLoginUser(data: LoginResponseData): AuthUser {
    return {
      id:               data.user.id,
      full_name:        data.user.full_name,
      name:             data.user.full_name,   // compat con templates que usan .name
      dni:              data.user.dni,
      roles:            [data.user.role as UserRole],
      avatar:           this.initials(data.user.full_name),
      is_temp_password: data.user.is_temp_password,
      force_relogin_at: null,
      token:            data.token,
    };
  }

  private mapMeUser(me: MeResponseData, token: string): AuthUser {
    return {
      id:               me.id,
      full_name:        me.full_name,
      name:             me.full_name,
      dni:              me.dni,
      roles:            [me.role as UserRole],
      avatar:           this.initials(me.full_name),
      is_temp_password: me.is_temp_password,
      force_relogin_at: me.force_relogin_at ?? null,
      token,
    };
  }

  private initials(fullName: string): string {
    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  }

  private persist(user: AuthUser): void {
    if (!isBrowser) return;
    localStorage.setItem(this.TOKEN_KEY, user.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user$.next(user);
  }

  private clear(): void {
    if (isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this._user$.next(null);
  }

  private readStoredUser(): AuthUser | null {
    if (!isBrowser) return null;
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}

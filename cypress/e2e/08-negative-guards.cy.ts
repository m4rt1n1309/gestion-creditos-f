/**
 * SUITE: Guards & Roles — Unhappy Paths
 *
 * Cubre:
 *  - SELLER intenta /admin/* → roleGuard redirige (a /unauthorized o /seller/operations)
 *  - COLLECTOR intenta /admin/* → roleGuard redirige
 *  - ADMIN intenta /collector/* → roleGuard redirige (ADMIN no tiene rol COLLECTOR)
 *  - SELLER_COLLECTOR accede a /seller/* y /collector/* → permitido en ambos
 *  - Usuario no autenticado intenta cualquier ruta protegida → redirige a /login
 *  - authGuard protege /profile cuando no hay sesión
 */

describe('Guards & Roles — Unhappy Paths', () => {
  beforeEach(() => {
    cy.logout();
    cy.viewport(1280, 720);
  });

  // ── No autenticado → /login ──────────────────────────────────────────────────
  it('usuario no autenticado en /admin/dashboard → redirige a /login', () => {
    cy.visit('/admin/dashboard');
    cy.url().should('include', '/login');
  });

  it('usuario no autenticado en /seller/clients → redirige a /login', () => {
    cy.visit('/seller/clients');
    cy.url().should('include', '/login');
  });

  it('usuario no autenticado en /collector/route → redirige a /login', () => {
    cy.visit('/collector/route');
    cy.url().should('include', '/login');
  });

  it('usuario no autenticado en /profile → redirige a /login', () => {
    cy.visit('/profile');
    cy.url().should('include', '/login');
  });

  // ── Cross-role: SELLER intenta rutas de ADMIN ────────────────────────────────
  it('SELLER intenta /admin/dashboard → bloqueado por roleGuard', () => {
    cy.loginAs('SELLER');
    cy.visit('/admin/dashboard');
    // roleGuard redirige a /unauthorized o de vuelta a su home
    cy.url().should('not.include', '/admin/dashboard');
  });

  it('SELLER intenta /admin/users → bloqueado por roleGuard', () => {
    cy.loginAs('SELLER');
    cy.visit('/admin/users');
    cy.url().should('not.include', '/admin/users');
  });

  // ── Cross-role: COLLECTOR intenta rutas de ADMIN/SELLER ─────────────────────
  it('COLLECTOR intenta /admin/dashboard → bloqueado por roleGuard', () => {
    cy.loginAs('COLLECTOR');
    cy.visit('/admin/dashboard');
    cy.url().should('not.include', '/admin/dashboard');
  });

  // NOTA: COLLECTOR SÍ tiene acceso a /seller/clients (routes.ts lo permite).
  // Probamos con /seller/operations/new que requiere ADMIN/SELLER/SELLER_COLLECTOR (no COLLECTOR).
  it('COLLECTOR intenta /seller/operations/new → bloqueado por roleGuard', () => {
    cy.loginAs('COLLECTOR');
    cy.visit('/seller/operations/new');
    cy.url().should('not.include', '/seller/operations/new');
  });

  // ── SELLER_COLLECTOR: acceso híbrido ────────────────────────────────────────
  // cy.intercept de GET /auth/me necesario: APP_INITIALIZER llama restoreSession()
  // en cada cy.visit(). Sin intercept, el backend devuelve 401 para el token mock
  // → catchError llama clear() → usuario null → authGuard redirige a /login.
  it('SELLER_COLLECTOR accede a /seller/clients sin ser bloqueado', () => {
    const hybridUser = {
      id: 'usr-055',
      full_name: 'Ana Híbrida',
      name: 'Ana Híbrida',
      dni: '55667788',
      email: 'hibrido@siscreditos.com',
      avatar: 'AH',
      roles: ['SELLER_COLLECTOR'],
      is_temp_password: false,
      force_relogin_at: null,
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDU1Iiwicm9sZSI6IlNFTExFUl9DT0xMRUNUT1IifQ.mock_hybrid',
    };

    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: { ok: true, data: { id: hybridUser.id, full_name: hybridUser.full_name, dni: hybridUser.dni, role: 'SELLER_COLLECTOR', is_temp_password: false, force_relogin_at: null } },
    }).as('authMe');

    cy.visit('/seller/clients', {
      onBeforeLoad(win) {
        win.localStorage.setItem('sgcf_token', hybridUser.token);
        win.localStorage.setItem('sgcf_user', JSON.stringify(hybridUser));
      },
    });

    cy.url().should('include', '/seller/clients');
  });

  it('SELLER_COLLECTOR accede a /collector/route sin ser bloqueado', () => {
    const hybridUser = {
      id: 'usr-055',
      full_name: 'Ana Híbrida',
      name: 'Ana Híbrida',
      dni: '55667788',
      email: 'hibrido@siscreditos.com',
      avatar: 'AH',
      roles: ['SELLER_COLLECTOR'],
      is_temp_password: false,
      force_relogin_at: null,
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDU1Iiwicm9sZSI6IlNFTExFUl9DT0xMRUNUT1IifQ.mock_hybrid',
    };

    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: { ok: true, data: { id: hybridUser.id, full_name: hybridUser.full_name, dni: hybridUser.dni, role: 'SELLER_COLLECTOR', is_temp_password: false, force_relogin_at: null } },
    }).as('authMe');

    cy.visit('/collector/route', {
      onBeforeLoad(win) {
        win.localStorage.setItem('sgcf_token', hybridUser.token);
        win.localStorage.setItem('sgcf_user', JSON.stringify(hybridUser));
      },
    });

    cy.url().should('include', '/collector/route');
  });

  // ── Ruta wildcard → /login ────────────────────────────────────────────────────
  it('ruta inexistente → redirige a /login (no autenticado)', () => {
    cy.visit('/ruta-que-no-existe-jamas', { failOnStatusCode: false });
    cy.url().should('include', '/login');
  });
});

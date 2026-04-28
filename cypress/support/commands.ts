// ── Custom Commands ────────────────────────────────────────────────────────────

// Tokens y objetos de usuario mock — reflejan exactamente MOCK_USERS de mock-auth.service.ts
const MOCK_AUTH_DATA: Record<string, { token: string; user: object }> = {
  ADMIN: {
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAxIiwicm9sZSI6IkFETUlOIiwiYXVkIjoic2lzdGVtYS1pbnRlcm5vIn0.mock_admin',
    user: {
      id: 'usr-001',
      full_name: 'Carlos López',
      name: 'Carlos López',
      dni: '12345678',
      email: 'admin@siscreditos.com',
      avatar: 'CL',
      roles: ['ADMIN'],
      is_temp_password: false,
      force_relogin_at: null,
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAxIiwicm9sZSI6IkFETUlOIiwiYXVkIjoic2lzdGVtYS1pbnRlcm5vIn0.mock_admin',
    },
  },
  SELLER: {
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAyIiwicm9sZSI6IlNFTExFUiIsImF1ZCI6InNpc3RlbWEtaW50ZXJubyJ9.mock_seller',
    user: {
      id: 'usr-002',
      full_name: 'María Sánchez',
      name: 'María Sánchez',
      dni: '87654321',
      email: 'vendedor@siscreditos.com',
      avatar: 'MS',
      roles: ['SELLER'],
      is_temp_password: false,
      force_relogin_at: null,
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAyIiwicm9sZSI6IlNFTExFUiIsImF1ZCI6InNpc3RlbWEtaW50ZXJubyJ9.mock_seller',
    },
  },
  COLLECTOR: {
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAzIiwicm9sZSI6IkNPTExFQ1RPUiIsImF1ZCI6InNpc3RlbWEtaW50ZXJubyJ9.mock_collector',
    user: {
      id: 'usr-003',
      full_name: 'Juan Pedraza',
      name: 'Juan Pedraza',
      dni: '11223344',
      email: 'cobrador@siscreditos.com',
      avatar: 'JP',
      roles: ['COLLECTOR'],
      is_temp_password: false,
      force_relogin_at: null,
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAzIiwicm9sZSI6IkNPTExFQ1RPUiIsImF1ZCI6InNpc3RlbWEtaW50ZXJubyJ9.mock_collector',
    },
  },
};

/**
 * Respuestas mock para GET /auth/me.
 * ApiHttpService unwrapea ApiResponse<T> → { ok: true, data: MeResponseData }.
 * MeResponseData usa 'role' (singular), no array.
 */
const MOCK_ME_RESPONSES: Record<string, object> = {
  ADMIN: {
    ok: true,
    data: { id: 'usr-001', full_name: 'Carlos López', dni: '12345678', role: 'ADMIN', is_temp_password: false, force_relogin_at: null },
  },
  SELLER: {
    ok: true,
    data: { id: 'usr-002', full_name: 'María Sánchez', dni: '87654321', role: 'SELLER', is_temp_password: false, force_relogin_at: null },
  },
  COLLECTOR: {
    ok: true,
    data: { id: 'usr-003', full_name: 'Juan Pedraza', dni: '11223344', role: 'COLLECTOR', is_temp_password: false, force_relogin_at: null },
  },
};

/**
 * Respuestas mock para POST /auth/login.
 * ApiHttpService unwrapea ApiResponse<T> → { ok: true, data: LoginResponseData }.
 * LoginResponseData tiene { user: { id, full_name, dni, role, is_temp_password }, token }.
 */
export const MOCK_LOGIN_RESPONSES: Record<string, object> = {
  ADMIN: {
    ok: true,
    data: {
      user: { id: 'usr-001', full_name: 'Carlos López', dni: '12345678', role: 'ADMIN', is_temp_password: false },
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAxIiwicm9sZSI6IkFETUlOIiwiYXVkIjoic2lzdGVtYS1pbnRlcm5vIn0.mock_admin',
    },
  },
  SELLER: {
    ok: true,
    data: {
      user: { id: 'usr-002', full_name: 'María Sánchez', dni: '87654321', role: 'SELLER', is_temp_password: false },
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAyIiwicm9sZSI6IlNFTExFUiIsImF1ZCI6InNpc3RlbWEtaW50ZXJubyJ9.mock_seller',
    },
  },
  COLLECTOR: {
    ok: true,
    data: {
      user: { id: 'usr-003', full_name: 'Juan Pedraza', dni: '11223344', role: 'COLLECTOR', is_temp_password: false },
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMDAzIiwicm9sZSI6IkNPTExFQ1RPUiIsImF1ZCI6InNpc3RlbWEtaW50ZXJubyJ9.mock_collector',
    },
  },
};

// Ruta home de cada rol (ruta protegida donde el rol tiene acceso directo)
const ROLE_HOME: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  SELLER: '/seller/operations',
  COLLECTOR: '/collector/route',
};

/**
 * Inyecta auth en el AUT via onBeforeLoad + intercepta GET /auth/me.
 *
 * POR QUÉ onBeforeLoad + intercept:
 *   1. La app usa AuthService (useMocks=false en ambos environments).
 *   2. APP_INITIALIZER llama restoreSession() → GET /auth/me en CADA carga de página.
 *   3. El backend real devuelve 401 para tokens mock → catchError llama clear() → usuario null.
 *   4. onBeforeLoad establece localStorage ANTES de que Angular arranque.
 *   5. cy.intercept hace que GET /auth/me devuelva 200 → restoreSession persiste el usuario.
 *   6. Guards (authGuard, roleGuard, tempPasswordGuard) ven el usuario correcto. ✓
 *
 * cy.intercept persiste durante todo el test (testIsolation limpia entre tests).
 */
Cypress.Commands.add('loginAs', (role: 'ADMIN' | 'SELLER' | 'COLLECTOR', destination?: string) => {
  const { token, user } = MOCK_AUTH_DATA[role];

  // 1. Stub genérico: todas las llamadas API (cualquier método) devuelven 200 vacío.
  //    Evita que el backend devuelva 401 para tokens mock, lo que dispararía
  //    errorInterceptor → clearSession() → _user$ null → sidebar desmonta.
  //    Las rutas más específicas registradas DESPUÉS tienen prioridad (Cypress LIFO).
  cy.intercept({ url: /\/api\// }, {
    statusCode: 200,
    body: { ok: true, data: [], message: 'Stubbed by Cypress loginAs' },
  }).as('apiStub');

  // 2. Stub específico para endpoints de lista que necesitan un array no vacío.
  //    Registrado DESPUÉS de apiStub → mayor prioridad (LIFO).
  //    Devuelve un cliente mock para que componentes como seller/clients-list
  //    muestren p-table (que requiere customers.length > 0).
  cy.intercept('GET', /\/api\/customers/, {
    statusCode: 200,
    body: {
      ok: true,
      data: [{
        id: 'cust-001', full_name: 'Ana García', dni: '12345678',
        phone: '3811234567', status: 'ACTIVE', collector_id: null,
        collector_name: null, created_at: '2024-01-15T00:00:00Z',
        previous_credits: 1, delinquency: 'Al día', payment_capacity: 5000,
      }],
    },
  }).as('customersStub');

  // 3. GET /auth/me devuelve el usuario correcto para que APP_INITIALIZER
  //    (AuthService.restoreSession) persista el usuario en _user$.
  cy.intercept('GET', '**/auth/me', {
    statusCode: 200,
    body: MOCK_ME_RESPONSES[role],
  }).as('authMe');

  cy.visit(destination ?? ROLE_HOME[role], {
    onBeforeLoad(win) {
      win.localStorage.setItem('sgcf_token', token);
      win.localStorage.setItem('sgcf_user', JSON.stringify(user));
    },
  });
});

/** Limpia estado de auth y navega a /login */
Cypress.Commands.add('logout', () => {
  cy.clearAllLocalStorage();
  cy.visit('/login');
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: 'ADMIN' | 'SELLER' | 'COLLECTOR', destination?: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

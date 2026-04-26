// ── Custom Commands ────────────────────────────────────────────────────────────

/**
 * Login via localStorage injection (bypasses UI for non-auth tests).
 * Mirrors what MockAuthService.persist() writes.
 */
Cypress.Commands.add('loginAs', (role: 'ADMIN' | 'SELLER' | 'COLLECTOR') => {
  const users: Record<string, { token: string; user: object }> = {
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

  const { token, user } = users[role];
  localStorage.setItem('sgcf_token', token);
  localStorage.setItem('sgcf_user', JSON.stringify(user));
});

/** Clear auth state */
Cypress.Commands.add('logout', () => {
  localStorage.removeItem('sgcf_token');
  localStorage.removeItem('sgcf_user');
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: 'ADMIN' | 'SELLER' | 'COLLECTOR'): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

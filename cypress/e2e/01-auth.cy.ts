/**
 * SUITE: Autenticación (Login)
 *
 * Cubre:
 *  - Renderizado del formulario de login
 *  - Validaciones de campos vacíos y formato inválido
 *  - Login exitoso como Admin → redirige a /admin/dashboard
 *  - Login exitoso como Seller → redirige a /seller/operations
 *  - Login exitoso como Collector → redirige a /collector/route
 *  - Login fallido (DNI no registrado) → muestra mensaje de error
 *  - noAuthGuard: usuario autenticado no puede acceder a /login
 *  - Logout desde sidebar → redirige a /login
 */

describe('Autenticación', () => {
  beforeEach(() => {
    cy.logout();
    cy.viewport(1280, 720);
    cy.visit('/login');
  });

  // ── Renderizado ──────────────────────────────────────────────────────────────
  it('muestra el formulario de login correctamente', () => {
    cy.get('[data-testid="input-dni"]').should('be.visible');
    // p-password renderiza un <input> interno; el data-testid está en el wrapper
    cy.get('[data-testid="input-password"] input').should('be.visible');
    cy.get('[data-testid="btn-login"]').should('be.visible').and('contain.text', 'Iniciar Sesión');
    cy.get('h2').should('contain.text', 'Iniciar Sesión');
  });

  // ── Validaciones de formulario ───────────────────────────────────────────────
  it('muestra error al enviar formulario vacío', () => {
    cy.get('[data-testid="btn-login"]').click();
    cy.contains('El DNI es obligatorio').should('be.visible');
    cy.contains('La contraseña es obligatoria').should('be.visible');
  });

  it('muestra error de formato cuando el DNI tiene menos de 7 dígitos', () => {
    cy.get('[data-testid="input-dni"]').type('123');
    cy.get('[data-testid="btn-login"]').click();
    cy.contains('DNI inválido (7-9 dígitos)').should('be.visible');
  });

  it('muestra error de formato cuando el DNI contiene letras', () => {
    cy.get('[data-testid="input-dni"]').type('ABCD123');
    cy.get('[data-testid="btn-login"]').click();
    cy.contains('DNI inválido (7-9 dígitos)').should('be.visible');
  });

  // ── Login exitoso — Admin ────────────────────────────────────────────────────
  it('autentica a un Admin y redirige a /admin/dashboard', () => {
    cy.get('[data-testid="input-dni"]').type('12345678');
    cy.get('[data-testid="input-password"] input').type('password123');
    cy.get('[data-testid="btn-login"]').click();

    // Botón muestra loading durante el delay del mock (800ms)
    cy.get('[data-testid="btn-login"]').should('have.attr', 'aria-busy', 'true');

    cy.url().should('include', '/admin/dashboard');
    // Sidebar visible con el nombre del usuario
    cy.contains('Carlos López').should('be.visible');
  });

  // ── Login exitoso — Seller ───────────────────────────────────────────────────
  it('autentica a un Seller y redirige a /seller/operations', () => {
    cy.get('[data-testid="input-dni"]').type('87654321');
    cy.get('[data-testid="input-password"] input').type('cualquier-password');
    cy.get('[data-testid="btn-login"]').click();

    cy.url().should('include', '/seller/operations');
    cy.contains('María Sánchez').should('be.visible');
  });

  // ── Login exitoso — Collector ────────────────────────────────────────────────
  it('autentica a un Collector y redirige a /collector/route', () => {
    cy.get('[data-testid="input-dni"]').type('11223344');
    cy.get('[data-testid="input-password"] input').type('cualquier-password');
    cy.get('[data-testid="btn-login"]').click();

    cy.url().should('include', '/collector/route');
    cy.contains('Juan Pedraza').should('be.visible');
  });

  // ── Login fallido ────────────────────────────────────────────────────────────
  it('muestra mensaje de error con credenciales incorrectas', () => {
    cy.get('[data-testid="input-dni"]').type('99999999');
    cy.get('[data-testid="input-password"] input').type('wrong');
    cy.get('[data-testid="btn-login"]').click();

    cy.get('[data-testid="login-error"]')
      .should('be.visible')
      .and('contain.text', 'Credenciales incorrectas');
    cy.url().should('include', '/login');
  });

  // ── noAuthGuard ──────────────────────────────────────────────────────────────
  it('redirige a /admin/dashboard si el usuario ya está autenticado como Admin', () => {
    cy.loginAs('ADMIN');
    cy.visit('/login');
    cy.url().should('include', '/admin/dashboard');
  });

  // ── Logout ───────────────────────────────────────────────────────────────────
  it('cierra sesión y redirige al login', () => {
    cy.loginAs('ADMIN');
    cy.visit('/admin/dashboard');
    cy.get('[data-testid="logout-btn"]').click();
    cy.url().should('include', '/login');
    // localStorage limpio
    cy.window().then((win) => {
      expect(win.localStorage.getItem('sgcf_user')).to.be.null;
    });
  });
});

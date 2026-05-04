/**
 * SUITE: Admin — Configuración y Planilla Legacy
 *
 * Cubre:
 *  - Config: panel lateral con tabs, contenido de cada tab principal
 *  - Sheet (planilla legacy): formulario de generación
 */

describe('Admin — Configuración', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/config');
  });

  it('renderiza sin error', () => {
    cy.get('app-error-state').should('not.exist');
  });

  it('muestra el panel lateral de navegación de tabs', () => {
    cy.get('.w-52.flex-shrink-0').should('exist');
  });

  it('tiene al menos 4 opciones de configuración en el panel', () => {
    cy.get('.w-52.flex-shrink-0 button').should('have.length.gte', 4);
  });

  it('la primera tab está activa (bg-blue-50)', () => {
    cy.get('button.bg-blue-50').should('exist');
  });

  it('muestra el breadcrumb "/ Configuración /"', () => {
    cy.contains('/ Configuración /').should('exist');
  });

  it('muestra el título h1 de la tab activa', () => {
    cy.get('h1').should('be.visible');
  });

  it('navegar a tab "Empresa" cambia el título', () => {
    cy.get('.w-52.flex-shrink-0 button').contains('Empresa').click();
    cy.contains('h1', 'Empresa').should('exist');
  });

  it('navegar a tab "Usuarios" muestra el contenido de usuarios-config', () => {
    cy.get('.w-52.flex-shrink-0 button').contains('Usuarios').click();
    cy.get('app-users-config').should('exist');
  });

  it('navegar a tab "Notificaciones" muestra el contenido', () => {
    cy.get('.w-52.flex-shrink-0 button').contains('Notificaciones').click();
    cy.get('app-notifications-config').should('exist');
  });
});

describe('Admin — Planilla (Sheet)', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/sheet');
  });

  it('renderiza sin error', () => {
    cy.get('app-error-state').should('not.exist');
  });

  it('muestra el título "Generar planilla de cobro"', () => {
    cy.contains('Generar planilla de cobro').should('be.visible');
  });

  it('tiene dropdown de cobrador', () => {
    cy.get('p-dropdown').first().should('exist');
  });

  it('tiene input de fecha', () => {
    cy.get('input[type="date"]').should('exist');
  });

  it('tiene dropdown de filtro de cuotas', () => {
    cy.get('p-dropdown').should('have.length.gte', 2);
  });

  it('muestra el botón "Generar planilla"', () => {
    cy.contains('button', 'Generar planilla').should('exist');
  });
});

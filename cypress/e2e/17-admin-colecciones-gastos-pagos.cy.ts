/**
 * SUITE: Admin — Planillas de Cobro, Gastos y Cobros (Payments)
 *
 * Cubre:
 *  - Admin Collections: título, filtros, botón generar planilla
 *  - Admin Expenses: título, botones de acción, panel de categorías
 *  - Admin Payments: título, filtros, botón refresh
 */

describe('Admin — Planillas de Cobro', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/collections');
  });

  it('muestra el título "Planillas de cobro"', () => {
    cy.contains('h1', 'Planillas de cobro').should('be.visible');
  });

  it('muestra el botón "Generar planilla"', () => {
    cy.contains('button', 'Generar planilla').should('exist');
  });

  it('tiene dropdown de filtro por cobrador', () => {
    cy.get('p-dropdown').should('exist');
  });

  it('tiene input de filtro por fecha', () => {
    cy.get('input[type="date"]').should('exist');
  });

  it('renderiza sin error', () => {
    cy.get('app-error-state').should('not.exist');
  });

  it('clic en "Generar planilla" navega a /new', () => {
    cy.contains('button', 'Generar planilla').click();
    cy.url().should('include', '/collections/new');
  });
});

describe('Admin — Gastos', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/expenses');
  });

  it('muestra el título "Gastos"', () => {
    cy.contains('h1', 'Gastos').should('be.visible');
  });

  it('muestra botón "Registrar gasto"', () => {
    cy.contains('button', 'Registrar gasto').should('exist');
  });

  it('muestra botón para gestionar categorías', () => {
    cy.contains('button', /categoría/i).should('exist');
  });

  it('renderiza sin error', () => {
    cy.get('app-error-state').should('not.exist');
  });

  it('al hacer clic en "Gestionar categorías" muestra el panel', () => {
    cy.contains('button', /categoría/i).first().click();
    cy.contains('Categorías de gastos').should('be.visible');
  });

  it('el panel de categorías tiene botón "Nueva categoría"', () => {
    cy.contains('button', /categoría/i).first().click();
    cy.contains('button', 'Nueva categoría').should('exist');
  });
});

describe('Admin — Cobros (Payments)', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/payments');
  });

  it('muestra el título "Cobros"', () => {
    cy.contains('h1', 'Cobros').should('be.visible');
  });

  it('muestra el botón de refresh', () => {
    cy.get('p-button[icon="pi pi-refresh"]').should('exist');
  });

  it('tiene dropdowns de filtro', () => {
    cy.get('p-dropdown').should('have.length.gte', 2);
  });

  it('renderiza sin error', () => {
    cy.get('app-error-state').should('not.exist');
  });
});

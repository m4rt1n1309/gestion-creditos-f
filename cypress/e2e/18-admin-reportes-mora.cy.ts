/**
 * SUITE: Admin — Reportes y Morosidad
 *
 * Cubre:
 *  - Reports: tabs visibles, contenido de cada tab
 *  - Delinquency: KPI cards, tabla de mora
 */

describe('Admin — Reportes', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/reports');
  });

  it('renderiza sin error', () => {
    cy.get('app-error-state').should('not.exist');
  });

  it('muestra al menos 2 tabs de navegación', () => {
    cy.get('button.border-b-2').should('have.length.gte', 2);
  });

  it('la primera tab está activa con estilo resaltado', () => {
    cy.get('button.border-blue-600').should('exist');
  });

  it('muestra contenido financiero (montos o skeletons)', () => {
    cy.get('p-card, app-loading-state, p-skeleton').should('exist');
  });

  it('se puede navegar entre tabs sin error', () => {
    cy.get('button.border-b-2').eq(1).click();
    cy.get('app-error-state').should('not.exist');
  });
});

describe('Admin — Morosidad', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/delinquency');
  });

  it('renderiza sin error', () => {
    cy.get('app-error-state').should('not.exist');
  });

  it('muestra KPI cards de mora (skeleton o reales)', () => {
    cy.get('p-card').should('exist');
  });

  it('muestra la tarjeta "En Mora"', () => {
    cy.contains('En Mora').should('exist');
  });

  it('muestra la tarjeta "Sin Aplicar"', () => {
    cy.contains('Sin Aplicar').should('exist');
  });

  it('muestra tabla o estado de carga', () => {
    cy.get('p-table, app-loading-state, p-skeleton').should('exist');
  });
});

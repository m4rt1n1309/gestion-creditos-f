/**
 * SUITE: Admin — Generar Planilla de Cobro (/admin/collections/new)
 *
 * Cubre:
 *  - Título y descripción del formulario
 *  - Aviso de reemplazo (p-message warning)
 *  - Dropdown de cobrador
 *  - Input de fecha
 *  - Dropdown de filtro de cuotas
 *  - Botón Cancelar
 *  - Botón Generar
 */

describe('Admin — Generar Planilla de Cobro', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/collections/new');
  });

  it('muestra el título "Generar planilla de cobro"', () => {
    cy.contains('h1', 'Generar planilla de cobro').should('be.visible');
  });

  it('muestra aviso de advertencia sobre reemplazo', () => {
    cy.get('p-message[severity="warn"]').should('exist');
    cy.contains('reemplazada automáticamente').should('exist');
  });

  it('tiene dropdown de cobrador', () => {
    cy.get('p-dropdown').should('have.length.gte', 1);
  });

  it('tiene input de fecha', () => {
    cy.get('input[type="date"]').should('exist');
  });

  it('tiene dropdown de filtro de cuotas', () => {
    cy.get('p-dropdown').should('have.length.gte', 2);
  });

  it('muestra botón "Generar"', () => {
    cy.contains('button', 'Generar').should('exist');
  });

  it('botón Cancelar navega a /admin/collections', () => {
    cy.contains('button', 'Cancelar').click();
    cy.url().should('include', '/admin/collections');
    cy.url().should('not.include', '/new');
  });
});

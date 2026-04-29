/**
 * SUITE: Seller — Lista de Operaciones (Créditos)
 *
 * Cubre:
 *  - Render de la lista con filtros de Estado y Tipo
 *  - Botón "Nueva operación" visible para SELLER
 *  - Estado vacío / tabla con datos
 *  - Navegación al wizard de creación
 */

describe('Seller — Lista de Operaciones', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('SELLER', '/seller/operations');
  });

  it('renderiza la página sin error', () => {
    cy.get('app-error-state').should('not.exist');
  });

  it('muestra el dropdown de filtro por Estado', () => {
    cy.get('p-dropdown').first().should('exist');
  });

  it('muestra el dropdown de filtro por Tipo', () => {
    cy.get('p-dropdown').should('have.length.gte', 2);
  });

  it('el botón "Nueva operación" es visible para SELLER', () => {
    cy.contains('button', 'Nueva operación').should('exist');
  });

  it('clic en "Nueva operación" navega al wizard', () => {
    cy.contains('button', 'Nueva operación').click();
    cy.url().should('include', '/new');
  });

  it('muestra tabla o estado vacío (no error)', () => {
    cy.get('p-table, app-empty-state, app-loading-state').should('exist');
  });
});

describe('Admin — Lista de Operaciones (misma vista vía /admin)', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/operations');
  });

  it('renderiza sin error', () => {
    cy.get('app-error-state').should('not.exist');
  });

  it('botón "Nueva operación" existe para ADMIN', () => {
    cy.contains('button', 'Nueva operación').should('exist');
  });
});

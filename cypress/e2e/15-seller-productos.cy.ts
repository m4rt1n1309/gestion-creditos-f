/**
 * SUITE: Seller — Productos
 *
 * Cubre:
 *  - Lista de productos con filtros (texto, estado, categoría)
 *  - Botón "Nuevo producto" (visible solo para ADMIN)
 *  - Acceso de SELLER sin botón crear
 *  - Tabla o estado vacío
 */

describe('Admin — Lista de Productos', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/seller/products');
  });

  it('renderiza sin error', () => {
    cy.get('app-error-state').should('not.exist');
  });

  it('muestra campo de búsqueda por descripción', () => {
    cy.get('input[placeholder*="Buscar por descripción"]').should('exist');
  });

  it('muestra dropdown de filtro por Estado', () => {
    cy.get('p-dropdown').should('have.length.gte', 1);
  });

  it('muestra dropdown de filtro por Categoría', () => {
    cy.get('p-dropdown').should('have.length.gte', 2);
  });

  it('el botón "Nuevo producto" es visible para ADMIN', () => {
    cy.contains('button', 'Nuevo producto').should('exist');
  });

  it('clic en "Nuevo producto" navega al formulario', () => {
    cy.contains('button', 'Nuevo producto').click();
    cy.url().should('include', '/new');
  });

  it('muestra tabla o estado vacío (no error)', () => {
    cy.get('p-table, app-empty-state, app-loading-state').should('exist');
  });
});

describe('Seller — Lista de Productos (sin botón crear)', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('SELLER', '/seller/products');
  });

  it('SELLER no ve el botón "Nuevo producto"', () => {
    cy.contains('button', 'Nuevo producto').should('not.exist');
  });

  it('muestra campo de búsqueda', () => {
    cy.get('input[placeholder*="Buscar por descripción"]').should('exist');
  });
});

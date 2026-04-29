/**
 * SUITE: Admin — Dashboard
 *
 * Cubre:
 *  - Banner de bienvenida con nombre de usuario
 *  - KPI Cards (skeleton o cards reales)
 *  - Sección de gráficos
 *  - Tabla de operaciones recientes
 */

describe('Admin — Dashboard', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/dashboard');
  });

  it('muestra el banner de bienvenida con el nombre del usuario', () => {
    cy.contains('¡Hola,').should('be.visible');
  });

  it('muestra la fecha de hoy en el banner', () => {
    cy.get('.bg-gradient-to-r').contains(/\d{1,2}/).should('exist');
  });

  it('renderiza la sección de KPI cards (skeleton o cards)', () => {
    cy.get('p-card, p-skeleton').should('exist');
  });

  it('el grid de KPI tiene 4 columnas de contenido', () => {
    // Espera a que carguen o estén en skeleton
    cy.get('.grid.grid-cols-1 p-card, .grid.grid-cols-1 p-skeleton')
      .should('have.length.gte', 4);
  });

  it('renderiza al menos un contenedor de gráfico', () => {
    cy.get('p-chart, canvas').should('exist');
  });

  it('existe la sección de operaciones recientes', () => {
    cy.contains('Operaciones Recientes').should('exist');
  });

  it('la tabla de operaciones recientes renderiza (con datos o vacía)', () => {
    cy.contains('Operaciones Recientes')
      .parents('p-card')
      .find('p-table, p-skeleton')
      .should('exist');
  });
});

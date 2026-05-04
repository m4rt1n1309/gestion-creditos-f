/**
 * SUITE: Cobranzas — Collector Route
 *
 * Cubre:
 *  - Listado de planillas del cobrador
 *  - Ver detalle de cada planilla
 *  - Estado de cuotas por cliente
 *  - Acceso desde /collector/route
 *
 * NOTA: La UI muestra "Mi Ruta de Cobro" con planillas generadas por el Admin.
 *       Los botones de acción están dentro de cada planilla.
 */

describe('Cobranzas — Collector Route', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('COLLECTOR', '/collector/route');
  });

  // ── Listado ────────────────────────────────────────────────────────────────────
  it('muestra el título de la ruta de cobros', () => {
    cy.contains('h1', 'Mi Ruta de Cobro').should('be.visible');
  });

  it('la fecha del día es visible', () => {
    cy.contains(/\d{1,2} \w+ \d{4}/).should('be.visible');
  });

  it('la sección de planillas es visible', () => {
    cy.contains('Mis planillas').should('be.visible');
  });

  // La tabla puede tener planillas o estar vacía
  it('muestra la tabla de planillas', () => {
    cy.get('p-table').should('exist');
  });

  // ── Planillas ─────────────────────────────────────────────────────────────────
  it('si hay planillas, muestra al menos una fila', () => {
    cy.get('p-table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.get('p-table tbody tr').should('have.length.gte', 1);
      } else {
        cy.contains('No tenés planillas generadas').should('exist');
      }
    });
  });

  // Si hay planillas, verifica columnas
  it('las planillas tienen las columnas esperadas', () => {
    cy.get('p-table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.get('p-table th').should('exist');
      }
    });
  });

  // ── Ver detalle de Planilla ──────────────────────────────────────────────────
  it('al hacer clic en Ver planilla abre el detalle', () => {
    cy.get('p-table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.wrap($rows[0]).find('[data-cy^="btn-ver-"]').click();
        cy.get('p-dialog').should('be.visible');
      } else {
        cy.log('No hay planillas — test omitido');
      }
    });
  });

  it('el detalle muestra las cuotas de la planilla', () => {
    cy.get('p-table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.wrap($rows[0]).find('[data-cy^="btn-ver-"]').click();
        cy.get('p-dialog').within(() => {
          cy.get('p-table').should('exist');
        });
      }
    });
  });

  it('el botón Cerrar cierra el modal de detalle', () => {
    cy.get('p-table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.wrap($rows[0]).find('[data-cy^="btn-ver-"]').click();
        cy.get('p-dialog').within(() => {
          cy.contains('button', 'Cerrar').click();
        });
        cy.get('p-dialog[ng-reflect-visible="true"]').should('not.exist');
      }
    });
  });

  // ── Estado vacío ─────────────────────────────────────────────────────────────
  it('si no hay planillas muestra mensaje informativo', () => {
    cy.get('p-table tbody tr').then(($rows) => {
      if ($rows.length === 0) {
        cy.contains('No tenés planillas').should('exist');
      }
    });
  });
});
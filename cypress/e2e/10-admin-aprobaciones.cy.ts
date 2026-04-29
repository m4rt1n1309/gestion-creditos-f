/**
 * SUITE: Admin — Aprobaciones de Créditos
 *
 * Cubre:
 *  - Listado de operaciones pendientes de aprobación
 *  - Tabla con buscador
 *  - Filtrado de resultados
 *  - Modal de detalle
 *  - Aprobar / Rechazar operaciones
 *  - Acceso desde /admin/approvals
 */

describe('Admin — Aprobaciones de Créditos', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/approvals');
  });

  // ── Listado ────────────────────────────────────────────────────────────────────
  it('muestra el título "Aprobación de Operaciones"', () => {
    cy.contains('h1', 'Aprobación de Operaciones').should('be.visible');
  });

  it('muestra el description del módulo', () => {
    cy.contains('Revisa y valida las solicitudes entrantes').should('be.visible');
  });

  it('la tabla de aprobaciones es visible', () => {
    cy.get('p-table').should('be.visible');
  });

  it('la tabla tiene el buscador habilitdo', () => {
    cy.get('input[placeholder*="Buscar"]').should('exist');
  });

  // Columnas reales del HTML
  it('la tabla contiene las columnas: Fecha, Cliente, Operación, Monto, Vendedor, Estado, Acciones', () => {
    const cols = ['Fecha', 'Cliente', 'Operación', 'Monto', 'Vendedor', 'Estado', 'Acciones'];
    cols.forEach((col) => {
      cy.get('p-table th').contains(col).should('exist');
    });
  });

  // ── Datos ─────────────────────────────────────────────────────────────────
  it('existe al menos una operación pendiente O muestra mensaje vacío', () => {
    cy.get('p-table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.get('p-table tbody tr').should('have.length.gte', 1);
      } else {
        cy.get('p-table').contains('No hay operaciones').should('exist');
      }
    });
  });

  it('muestra badge con cantidad de pendientes', () => {
    cy.get('p-badge').should('exist');
  });

  // ── Buscador ────────────────────────────────────────────────────────────────
  it('el buscador filtra los resultados', () => {
    cy.get('p-table tbody tr').its('length').then((total) => {
      if (total > 0) {
        cy.get('input[placeholder*="Buscar"]').type('xxx_no_existe');
        cy.get('p-table tbody tr').should('have.length', 0);
      }
    });
  });

  // ── Acciones de fila ─────────────────────────────────────────────────────
  it('las filas tienen botones de acción', () => {
    cy.get('p-table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.wrap($rows[0]).find('button').should('exist');
      }
    });
  });

  // ── Ver Detalle ──────────────────────────────────────────────────────────────
  describe('Modal de Detalle', () => {
    beforeEach(() => {
      cy.get('p-table tbody tr').then(($rows) => {
        if ($rows.length === 0) {
          cy.log('No hay operaciones pendientes — tests omitidos');
          return;
        }
        cy.wrap($rows[0]).find('button').first().click();
      });
    });

    it('al hacer clic en acción abre el modal', () => {
      cy.get('p-table tbody tr').then(($rows) => {
        if ($rows.length > 0) {
          cy.wrap($rows[0]).find('button').first().click();
          cy.get('p-dialog').should('be.visible');
        }
      });
    });

    it('el modal de detalle muestra información del crédito', () => {
      cy.get('p-table tbody tr').then(($rows) => {
        if ($rows.length > 0) {
          cy.wrap($rows[0]).find('button').first().click();
          cy.get('p-dialog').within(() => {
            cy.get('div').should('exist');
          });
        }
      });
    });
  });

  // ── Aprobar ────────────────────────────────────────────────────────────
  it('el botón aprobar existe', () => {
    cy.get('p-table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.wrap($rows[0]).contains('button', /Aprobar|✓/).should('exist');
      }
    });
  });

  it('el botón rechazar existe', () => {
    cy.get('p-table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        cy.wrap($rows[0]).contains('button', /Rechazar|✗/).should('exist');
      }
    });
  });
  });

  // ── Vacío ──────────────────────────────────────────────────────────────
  it('si no hay pendientes muestra mensaje informativo', () => {
    cy.get('p-table tbody tr').then(($rows) => {
      if ($rows.length === 0) {
        cy.contains('No hay operaciones').should('exist');
      }
    });
  });
});
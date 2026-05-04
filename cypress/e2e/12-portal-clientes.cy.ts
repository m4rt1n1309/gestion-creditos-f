/**
 * SUITE: Portal Cliente — B2C
 *
 * Cubre:
 *  - Dashboard del cliente (información general)
 *  - Validación de deuda total
 *  - Navegación a "Mis Créditos"
 *  - Tabla de amortización (p-table)
 *  - Detalle de cada crédito
 *  - Acceso público sin login (/portal/dashboard, /portal/credits)
 */

describe('Portal Cliente — Dashboard y Mis Créditos', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/portal/dashboard');
  });

  // ── Dashboard ──────────────────────────────────────────────────────────
  it('el dashboard es accesible sin autenticación', () => {
    cy.url().should('include', '/portal/dashboard');
  });

  it('muestra el título "Mi Dashboard"', () => {
    cy.contains('h1', 'Mi Dashboard').should('be.visible');
  });

  it('muestra el nombre del cliente', () => {
    cy.get('[data-cy="nombre-cliente"]').should('exist');
  });

  it('muestra la sección de deuda total', () => {
    cy.contains('Deuda Total').should('be.visible');
  });

  it('el monto de deuda total es visible', () => {
    cy.get('[data-cy="deuda-total"]').should('exist');
  });

  it('muestra el monto de deuda en formato moneda', () => {
    cy.get('[data-cy="deuda-total"]').should('contain', '$');
  });

  it('muestra la sección de crédito activo', () => {
    cy.contains('Crédito Activo').should('be.visible');
  });

  it('muestra botón "Mis Créditos"', () => {
    cy.contains('button', 'Mis Créditos').should('exist');
  });

  // ── Navegación a Mis Créditos ─────────────────────────────────────────
  it('al hacer clic en "Mis Créditos" navega a /portal/credits', () => {
    cy.contains('button', 'Mis Créditos').click();
    cy.url().should('include', '/portal/credits');
  });

  // ── Lista de Mis Créditos ────────────────────────────────────────────────
  describe('Mis Créditos', () => {
    beforeEach(() => {
      cy.visit('/portal/credits');
    });

    it('la página de créditos es visible', () => {
      cy.url().should('include', '/portal/credits');
    });

    it('muestra el título "Mis Créditos"', () => {
      cy.contains('h1', 'Mis Créditos').should('be.visible');
    });

    it('la tabla de créditos es visible (p-table)', () => {
      cy.get('p-table').should('be.visible');
    });

    it('la tabla contiene columnas: Producto, Monto, Saldo, Cuota, Próxima Fecha', () => {
      const cols = ['Producto', 'Monto', 'Saldo', 'Cuota', 'Próxima Fecha'];
      cols.forEach((col) => {
        cy.get('p-table th').contains(col).should('exist');
      });
    });

    it('si existe crédito, muestra al menos una fila', () => {
      cy.get('p-table tbody tr').should('have.length.gte', 1);
    });

    // ── Ver Detalle del Crédito ───────────────────────────────────────
    it('al hacer clic en "Ver" abre el modal de detalle', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-ver-"]').click();
      cy.contains('Detalle del Crédito').should('be.visible');
    });

    it('el modal muestra información del crédito', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-ver-"]').click();
      cy.get('p-dialog').within(() => {
        cy.get('[data-cy="credito-producto"]').should('exist');
        cy.get('[data-cy="credito-monto"]').should('exist');
        cy.get('[data-cy="credito-saldo"]').should('exist');
      });
    });

    it('el botón Cerrar cierra el modal', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-ver-"]').click();
      cy.get('p-dialog').within(() => {
        cy.contains('button', 'Cerrar').click();
      });
      cy.get('p-dialog[ng-reflect-visible="true"]').should('not.exist');
    });

    // ── Tabla de Amortización ──────────────────────────────────────
    it('el botón "Ver Cuotas" abre la tabla de amortización', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-cuotas-"]').click();
      cy.contains('Tabla de Amortización').should('be.visible');
    });

    it('la tabla de amortización contiene columnas: #, Fecha, Capital, Interés, Cuota, Saldo', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-cuotas-"]').click();
      cy.get('p-dialog').within(() => {
        const cols = ['#', 'Fecha', 'Capital', 'Interés', 'Cuota', 'Saldo'];
        cols.forEach((col) => {
          cy.get('p-table th').contains(col).should('exist');
        });
      });
    });

    it('la tabla de amortización muestra las cuotas', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-cuotas-"]').click();
      cy.get('p-dialog p-table tbody tr').should('have.length.gte', 1);
    });

    it('cada fila muestra el número de cuota', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-cuotas-"]').click();
      cy.get('p-dialog p-table tbody tr').first().find('td').should('exist');
    });

    it('cada fila muestra la fecha de vencimiento', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-cuotas-"]').click();
      cy.get('p-dialog p-table tbody tr').first().find('td').eq(1).should('exist');
    });

    it('cada fila muestra el monto de capital', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-cuotas-"]').click();
      cy.get('p-dialog p-table tbody tr').first().find('td').eq(2).should('exist');
    });

    it('cada fila muestra el monto de interés', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-cuotas-"]').click();
      cy.get('p-dialog p-table tbody tr').first().find('td').eq(3).should('exist');
    });

    it('cada fila muestra el monto de cuota', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-cuotas-"]').click();
      cy.get('p-dialog p-table tbody tr').first().find('td').eq(4).should('exist');
    });

    it('cada fila muestra el saldo restante', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-cuotas-"]').click();
      cy.get('p-dialog p-table tbody tr').first().find('td').eq(5).should('exist');
    });

    it('el botón Cerrar cierra el modal de amortización', () => {
      cy.get('p-table tbody tr').first().find('[data-cy^="btn-cuotas-"]').click();
      cy.get('p-dialog').within(() => {
        cy.contains('button', 'Cerrar').click();
      });
      cy.get('p-dialog[ng-reflect-visible="true"]').should('not.exist');
    });

    // ── Estado del Crédito ──────────────────────────────────────────
    it('cada crédito muestra badge p-tag con estado', () => {
      cy.get('p-table tbody tr').first().find('p-tag').should('exist');
    });
  });

  // ── Navegación de Regreso ─────────────────────────────────────────
  it('desde Mis Créditos puede volver al Dashboard', () => {
    cy.visit('/portal/credits');
    cy.contains('button', 'Volver').click();
    cy.url().should('include', '/portal/dashboard');
  });
});
/**
 * SUITE: Admin — Caja y Tesorería
 *
 * Cubre:
 *  - Apertura de caja (registrar saldo inicial)
 *  - Registro de gastos (categoría Insumos)
 *  - Cierre de caja
 *  - Estado visual de caja abierta/cerrada
 *  - Validación: no permitir gasto con caja cerrada
 *  - Mensajes de error en UI
 *  - Acceso desde /admin/cash-register
 */

describe('Admin — Caja y Tesorería', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/cash-register');
  });

  // ── Estado Inicial ──────────────────────────────────────────────────────
  it('muestra el título "Caja y Tesorería"', () => {
    cy.contains('h1', 'Caja y Tesorería').should('be.visible');
  });

  it('indica el estado de caja (Abierta/Cerrada)', () => {
    cy.get('[data-cy="estado-caja"]').should('exist');
  });

  // ── Apertura de Caja ────────────────────────────────────────────────────────────
  describe('Apertura de Caja', () => {
    it('el botón "Abrir Caja" es visible cuando está cerrada', () => {
      cy.contains('button', 'Abrir Caja').should('exist');
    });

    it('al hacer clic en "Abrir Caja" muestra el modal', () => {
      cy.contains('button', 'Abrir Caja').click();
      cy.contains('Abrir Caja').should('be.visible');
    });

    it('el modal tiene campo para saldo inicial', () => {
      cy.contains('button', 'Abrir Caja').click();
      cy.get('p-dialog').within(() => {
        cy.get('input[formControlName="saldoInicial"]').should('exist');
      });
    });

    it('el botón "Confirmar" está deshabilitado sin monto', () => {
      cy.contains('button', 'Abrir Caja').click();
      cy.get('p-dialog').within(() => {
        cy.contains('button', 'Confirmar').should(
          'have.attr',
          'ng-reflect-disabled',
          'true',
        );
      });
    });

    it('completa saldo inicial y abre la caja', () => {
      cy.contains('button', 'Abrir Caja').click();
      cy.get('p-dialog').within(() => {
        cy.get('input[formControlName="saldoInicial"]').type('5000000');
      });
      cy.get('p-dialog').contains('button', 'Confirmar').click();
      cy.get('p-dialog[ng-reflect-visible="true"]').should('not.exist');
    });

    it('tras abrir, el estado cambia a "Abierta"', () => {
      cy.contains('button', 'Abrir Caja').click();
      cy.get('p-dialog').within(() => {
        cy.get('input[formControlName="saldoInicial"]').type('3000000');
      });
      cy.get('p-dialog').contains('button', 'Confirmar').click();
      cy.get('[data-cy="estado-caja"]').should('contain', 'Abierta');
    });

    it('tras abrir, muestra el botón "Cerrar Caja"', () => {
      cy.contains('button', 'Abrir Caja').click();
      cy.get('p-dialog').within(() => {
        cy.get('input[formControlName="saldoInicial"]').type('2000000');
      });
      cy.get('p-dialog').contains('button', 'Confirmar').click();
      cy.contains('button', 'Cerrar Caja').should('exist');
    });
  });

  // ── Registro de Gastos (Happy Path) ──────────────────────────────────────────────
  describe('Registro de Gastos', () => {
    beforeEach(() => {
      if (cy.contains('Abrir Caja').length > 0) {
        cy.contains('button', 'Abrir Caja').click();
        cy.get('p-dialog').within(() => {
          cy.get('input[formControlName="saldoInicial"]').type('5000000');
        });
        cy.get('p-dialog').contains('button', 'Confirmar').click();
      }
    });

    it('el botón "Registrar Gasto" es visible', () => {
      cy.contains('button', 'Registrar Gasto').should('exist');
    });

    it('al hacer clic abre el modal de gasto', () => {
      cy.contains('button', 'Registrar Gasto').click();
      cy.contains('Registrar Gasto').should('be.visible');
    });

    it('el modal tiene campo de monto', () => {
      cy.contains('button', 'Registrar Gasto').click();
      cy.get('p-dialog').within(() => {
        cy.get('input[formControlName="monto"]').should('exist');
      });
    });

    it('el modal tiene dropdown de categoría', () => {
      cy.contains('button', 'Registrar Gasto').click();
      cy.get('p-dialog').within(() => {
        cy.get('p-dropdown').should('exist');
      });
    });

    it('el dropdown de categoría tiene la opción "Insumos"', () => {
      cy.contains('button', 'Registrar Gasto').click();
      cy.get('p-dialog').within(() => {
        cy.get('p-dropdown').click();
        cy.get('.p-dropdown-item').contains('Insumos').should('exist');
      });
    });

    it('el campo de descripción existe', () => {
      cy.contains('button', 'Registrar Gasto').click();
      cy.get('p-dialog').within(() => {
        cy.get('textarea[formControlName="descripcion"]').should('exist');
      });
    });

    it('el botón "Guardar" está deshabilitado sin datos', () => {
      cy.contains('button', 'Registrar Gasto').click();
      cy.get('p-dialog').within(() => {
        cy.contains('button', 'Guardar').should(
          'have.attr',
          'ng-reflect-disabled',
          'true',
        );
      });
    });

    it('completa todos los campos y registra el gasto exitosamente', () => {
      cy.contains('button', 'Registrar Gasto').click();
      cy.get('p-dialog').within(() => {
        cy.get('input[formControlName="monto"]').type('150000');
        cy.get('p-dropdown').click();
        cy.get('.p-dropdown-item').contains('Insumos').click();
        cy.get('textarea[formControlName="descripcion"]').type('Compra de papelería');
      });
      cy.get('p-dialog').contains('button', 'Guardar').click();
      cy.get('p-dialog[ng-reflect-visible="true"]').should('not.exist');
    });

    it('tras registrar gasto genera toast de éxito', () => {
      cy.contains('button', 'Registrar Gasto').click();
      cy.get('p-dialog').within(() => {
        cy.get('input[formControlName="monto"]').type('50000');
        cy.get('p-dropdown').click();
        cy.get('.p-dropdown-item').contains('Insumos').click();
        cy.get('textarea[formControlName="descripcion"]').type('Materiales de oficina');
      });
      cy.get('p-dialog').contains('button', 'Guardar').click();
      cy.get('.p-toast').should('contain', 'éxito');
    });

    it('el gasto registrado aparece en la tabla de movimientos', () => {
      cy.contains('button', 'Registrar Gasto').click();
      cy.get('p-dialog').within(() => {
        cy.get('input[formControlName="monto"]').type('75000');
        cy.get('p-dropdown').click();
        cy.get('.p-dropdown-item').contains('Insumos').click();
        cy.get('textarea[formControlName="descripcion"]').type('Utensilios');
      });
      cy.get('p-dialog').contains('button', 'Guardar').click();
      cy.get('p-table').should('contain', 'Insumos');
    });

    it('el botón Cancelar cierra el modal sin registrar', () => {
      cy.contains('button', 'Registrar Gasto').click();
      cy.get('p-dialog').within(() => {
        cy.get('input[formControlName="monto"]').type('10000');
        cy.get('p-dropdown').click();
        cy.get('.p-dropdown-item').contains('Insumos').click();
        cy.contains('button', 'Cancelar').click();
      });
      cy.get('p-dialog[ng-reflect-visible="true"]').should('not.exist');
    });
  });

  // ── Cierre de Caja ────────────────────────────────────────────────────
  describe('Cierre de Caja', () => {
    it('el botón "Cerrar Caja" es visible', () => {
      cy.contains('button', 'Cerrar Caja').should('exist');
    });

    it('al hacer clic abre el modal de cierre', () => {
      cy.contains('button', 'Cerrar Caja').click();
      cy.contains('Cerrar Caja').should('be.visible');
    });

    it('el modal muestra el saldo actual', () => {
      cy.contains('button', 'Cerrar Caja').click();
      cy.get('p-dialog').within(() => {
        cy.get('[data-cy="saldo-actual"]').should('exist');
      });
    });

    it('el botón "Confirmar Cierre" está disponible', () => {
      cy.contains('button', 'Cerrar Caja').click();
      cy.get('p-dialog').within(() => {
        cy.contains('button', 'Confirmar Cierre').should('exist');
      });
    });

    it('cierra la caja exitosamente', () => {
      cy.contains('button', 'Cerrar Caja').click();
      cy.get('p-dialog').contains('button', 'Confirmar Cierre').click();
      cy.get('p-dialog[ng-reflect-visible="true"]').should('not.exist');
    });

    it('tras cerrar, el estado cambia a "Cerrada"', () => {
      cy.contains('button', 'Cerrar Caja').click();
      cy.get('p-dialog').contains('button', 'Confirmar Cierre').click();
      cy.get('[data-cy="estado-caja"]').should('contain', 'Cerrada');
    });

    it('tras cerrar, el botón "Abrir Caja" vuelve a estar disponible', () => {
      cy.contains('button', 'Cerrar Caja').click();
      cy.get('p-dialog').contains('button', 'Confirmar Cierre').click();
      cy.contains('button', 'Abrir Caja').should('exist');
    });
  });

  // ── Validación: Gasto con Caja Cerrada (Negative Path) ───────────────────
  describe('Validación: Gasto con Caja Cerrada', () => {
    it('si la caja está cerrada, el botón "Registrar Gasto" está deshabilitado', () => {
      cy.contains('button', 'Registrar Gasto').should(
        'have.attr',
        'disabled',
      );
    });

    it('intentar acceder al modal de gasto muestra error', () => {
      cy.contains('button', 'Registrar Gasto').click({ force: true });
      cy.get('.p-toast').should('exist');
    });

    it('mensaje de error indica que la caja está cerrada', () => {
      cy.contains('button', 'Registrar Gasto').click({ force: true });
      cy.contains('caja').should('exist');
    });
  });
});
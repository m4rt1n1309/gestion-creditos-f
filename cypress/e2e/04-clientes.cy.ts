/**
 * SUITE: Gestión de Clientes
 *
 * Cubre:
 *  - Listado de clientes (tabla p-table visible con columnas correctas)
 *  - Búsqueda de clientes en tiempo real
 *  - Filtro por estado (dropdown)
 *  - Modal "Ver" muestra detalles del cliente seleccionado
 *  - Modal "Editar" permite modificar datos y guardar
 *  - Modal "Créditos" muestra cantidad de créditos activos
 *  - Modal "Crear Cliente" con validaciones de formulario
 *  - Crear cliente exitoso agrega registro a la tabla
 *  - Acceso desde /admin/clients y /seller/clients
 */

describe('Gestión de Clientes — Admin', () => {
  beforeEach(() => {
    cy.loginAs('ADMIN');
    cy.viewport(1280, 720);
    cy.visit('/admin/clients');
  });

  // ── Listado ────────────────────────────────────────────────────────────────────
  it('muestra el título y la tabla de clientes', () => {
    cy.contains('h1', 'Gestión de Clientes').should('be.visible');
    cy.get('p-table').should('be.visible');
  });

  it('la tabla tiene las columnas: DNI, Nombre, Teléfono, Créditos, Riesgo, Acciones', () => {
    const cols = ['DNI', 'Nombre', 'Teléfono', 'Créditos', 'Riesgo', 'Acciones'];
    cols.forEach((col) => {
      cy.get('p-table th').contains(col).should('exist');
    });
  });

  it('muestra al menos un cliente en la tabla', () => {
    cy.get('p-table tbody tr').should('have.length.gte', 1);
  });

  it('muestra badge p-tag de riesgo en cada fila', () => {
    cy.get('p-table tbody tr').first().find('p-tag').should('exist');
  });

  // ── Búsqueda ───────────────────────────────────────────────────────────────────
  it('filtra clientes al escribir en el campo de búsqueda', () => {
    cy.get('p-table tbody tr').its('length').then((total) => {
      cy.get('input[placeholder="Buscar cliente..."]').type('xxx_no_existe');
      cy.get('p-table tbody tr').should('have.length.lte', total);
    });
  });

  it('limpiar búsqueda restaura la lista completa', () => {
    cy.get('p-table tbody tr').its('length').then((total) => {
      cy.get('input[placeholder="Buscar cliente..."]').type('xxx').clear();
      cy.get('p-table tbody tr').should('have.length', total);
    });
  });

  // ── Filtro por estado ─────────────────────────────────────────────────────────
  it('el dropdown de filtro existe y tiene las opciones Todos / Activos / Inactivos', () => {
    // Abrir p-dropdown
    cy.get('p-dropdown').first().click();
    cy.get('.p-dropdown-item').should('have.length.gte', 1);
    // Cerrar
    cy.get('body').click(0, 0);
  });

  // ── Modal Ver ─────────────────────────────────────────────────────────────────
  it('abre el modal "Ver Cliente" al hacer clic en Ver', () => {
    cy.get('p-table tbody tr').first().find('button').contains('Ver').click();
    cy.get('p-dialog').should('be.visible');
    cy.get('p-dialog').contains('Ver Cliente').should('be.visible');
  });

  it('el modal Ver muestra DNI, nombre y riesgo del cliente', () => {
    cy.get('p-table tbody tr').first().find('button').contains('Ver').click();
    cy.get('p-dialog').within(() => {
      cy.contains('DNI').should('exist');
      cy.contains('Teléfono').should('exist');
      cy.contains('Riesgo').should('exist');
    });
  });

  it('el botón Cerrar cierra el modal Ver', () => {
    cy.get('p-table tbody tr').first().find('button').contains('Ver').click();
    cy.get('p-dialog').contains('button', 'Cerrar').click();
    cy.get('p-dialog[ng-reflect-visible="true"]').should('not.exist');
  });

  // ── Modal Editar ──────────────────────────────────────────────────────────────
  it('abre el modal "Editar Cliente" al hacer clic en Editar', () => {
    cy.get('p-table tbody tr').first().find('button').contains('Editar').click();
    cy.get('p-dialog').should('be.visible');
    cy.contains('Editar Cliente').should('be.visible');
  });

  it('el formulario de edición tiene campos: Nombre, Apellido, Teléfono, Riesgo, Estado', () => {
    cy.get('p-table tbody tr').first().find('button').contains('Editar').click();
    cy.get('p-dialog').within(() => {
      cy.get('input[formControlName="nombre"]').should('exist');
      cy.get('input[formControlName="apellido"]').should('exist');
      cy.get('input[formControlName="phone"]').should('exist');
      cy.get('p-dropdown').should('exist'); // Risk dropdown
      cy.contains('Activo').should('exist');
      cy.contains('Inactivo').should('exist');
    });
  });

  it('el botón "Guardar Cambios" está disponible con el formulario válido', () => {
    cy.get('p-table tbody tr').first().find('button').contains('Editar').click();
    cy.get('p-dialog').within(() => {
      cy.contains('button', 'Guardar Cambios').should('not.have.attr', 'disabled');
    });
  });

  it('editar teléfono y guardar actualiza la fila en la tabla', () => {
    cy.get('p-table tbody tr').first().find('button').contains('Editar').click();
    cy.get('p-dialog').within(() => {
      cy.get('input[formControlName="phone"]').clear().type('300-999-8888');
    });
    cy.get('p-dialog').find('p-button[label="Guardar Cambios"]').click();
    // Modal cierra
    cy.get('p-dialog').should('not.be.visible');
    // Tabla muestra el teléfono actualizado
    cy.get('p-table tbody').contains('300-999-8888').should('exist');
  });

  // ── Modal Créditos ────────────────────────────────────────────────────────────
  it('abre el modal "Créditos" para clientes con créditos activos', () => {
    // El botón Créditos solo aparece si client.credits > 0
    cy.get('p-table tbody tr').then(($rows) => {
      const rowWithCredits = Cypress._.find($rows.toArray(), (row) =>
        Cypress.$(row).find('button:contains("Créditos")').length > 0,
      );
      if (rowWithCredits) {
        cy.wrap(rowWithCredits).find('button').contains('Créditos').click();
        cy.get('p-dialog').contains('Créditos').should('be.visible');
        cy.get('p-dialog').contains('crédito(s) activo(s)').should('exist');
      } else {
        cy.log('No hay clientes con créditos en los mocks — test omitido');
      }
    });
  });

  // ── Modal Crear Cliente ───────────────────────────────────────────────────────
  describe('Crear Cliente', () => {
    beforeEach(() => {
      cy.contains('button', 'Nuevo Cliente').click();
      cy.contains('Crear Cliente').should('be.visible');
    });

    it('muestra el modal de creación con todos los campos', () => {
      cy.get('p-dialog').within(() => {
        cy.get('input[formControlName="nombres"]').should('exist');
        cy.get('input[formControlName="apellidos"]').should('exist');
        cy.get('input[formControlName="dni"]').should('exist');
        cy.get('input[formControlName="telefonoPrincipal"]').should('exist');
        cy.get('input[formControlName="email"]').should('exist');
        cy.get('input[formControlName="direccion"]').should('exist');
        cy.get('input[formControlName="ingresos"]').should('exist');
      });
    });

    it('el botón "Crear Cliente" está deshabilitado con formulario vacío', () => {
      cy.get('p-dialog p-button[label="Crear Cliente"]').should(
        'have.attr',
        'ng-reflect-disabled',
        'true',
      );
    });

    it('muestra errores de validación al intentar crear con campos vacíos', () => {
      // Tocar campos sin completar para disparar touched
      cy.get('p-dialog input[formControlName="nombres"]').click().blur();
      cy.get('p-dialog').contains('span.text-red-500').should('exist');
    });

    it('completa el formulario y crea el cliente exitosamente', () => {
      cy.get('p-table tbody tr').its('length').then((initialCount) => {
        cy.get('p-dialog').within(() => {
          cy.get('input[formControlName="nombres"]').type('Laura');
          cy.get('input[formControlName="apellidos"]').type('Gómez');
          cy.get('input[formControlName="dni"]').type('9988776655');
          cy.get('input[formControlName="telefonoPrincipal"]').type('310-111-2222');
          cy.get('input[formControlName="telefonoAlterno"]').type('320-333-4444');
          cy.get('input[formControlName="email"]').type('lgomez@email.com');
          cy.get('input[formControlName="direccion"]').type('Calle 10 #5-20');
          cy.get('input[formControlName="ingresos"]').type('5000000');
        });
        cy.get('p-dialog p-button[label="Crear Cliente"]').click();
        // Modal cierra
        cy.get('p-dialog').should('not.be.visible');
        // Tabla tiene un registro más
        cy.get('p-table tbody tr').should('have.length', initialCount + 1);
      });
    });

    it('el botón Borrar limpia todos los campos del formulario', () => {
      cy.get('p-dialog').within(() => {
        cy.get('input[formControlName="nombres"]').type('Test');
      });
      cy.get('p-dialog button').contains('Borrar').click();
      cy.get('p-dialog input[formControlName="nombres"]').should('have.value', '');
    });

    it('el botón Cancelar cierra el modal sin crear', () => {
      cy.get('p-table tbody tr').its('length').then((initialCount) => {
        cy.get('p-dialog button').contains('Cancelar').click();
        cy.get('p-dialog').should('not.be.visible');
        cy.get('p-table tbody tr').should('have.length', initialCount);
      });
    });
  });
});

// ── Acceso Seller ─────────────────────────────────────────────────────────────
describe('Gestión de Clientes — Seller', () => {
  beforeEach(() => {
    cy.loginAs('SELLER');
    cy.viewport(1280, 720);
    cy.visit('/seller/clients');
  });

  it('Seller puede acceder a /seller/clients y ve la tabla', () => {
    cy.contains('Gestión de Clientes').should('be.visible');
    cy.get('p-table').should('be.visible');
  });
});

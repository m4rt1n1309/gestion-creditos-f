/**
 * SUITE: Seller — Detalle de Cliente (/seller/clients/:dni)
 *
 * Cubre:
 *  - Vista read-only: nombre, tag estado, botones según rol
 *  - Admin: botones Editar, Desactivar
 *  - Seller: puede ver el detalle pero no desactivar
 *  - Modo edición: campos del formulario
 *  - Botón Volver
 */

const CUSTOMER_MOCK = {
  id: 'cust-001',
  fullName: 'Ana García',
  dni: '12345678',
  phone: '3811234567',
  email: 'ana@mail.com',
  address: 'Av. Principal 100',
  status: 'ACTIVE',
  collectorId: null,
  collectorName: null,
  createdAt: '2024-01-15T00:00:00Z',
};

function stubCustomer(role: 'ADMIN' | 'SELLER') {
  cy.intercept('GET', /\/api\/customers\/12345678/, {
    statusCode: 200,
    body: { ok: true, data: CUSTOMER_MOCK },
  }).as('customerDetail');

  cy.intercept('GET', /\/api\/customers\/12345678\/credits/, {
    statusCode: 200,
    body: { ok: true, data: [] },
  }).as('customerCredits');

  cy.loginAs(role, '/seller/clients/12345678');
}

describe('Detalle de Cliente — Admin', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    stubCustomer('ADMIN');
    cy.wait('@customerDetail');
  });

  it('muestra el nombre del cliente', () => {
    cy.contains('Ana García').should('be.visible');
  });

  it('muestra el tag de estado Activo', () => {
    cy.get('p-tag').contains('Activo').should('exist');
  });

  it('Admin ve el botón Editar', () => {
    cy.contains('button', 'Editar').should('exist');
  });

  it('Admin ve el botón Desactivar', () => {
    cy.contains('button', 'Desactivar').should('exist');
  });

  it('botón Volver navega a la lista', () => {
    cy.contains('button', 'Volver').click();
    cy.url().should('not.match', /\/12345678$/);
  });

  it('clic en Editar activa el modo edición', () => {
    cy.contains('button', 'Editar').click();
    cy.contains('button', 'Guardar').should('exist');
  });

  it('en modo edición: campo fullName visible y prellenado', () => {
    cy.contains('button', 'Editar').click();
    cy.get('input[id="fullName"]').should('have.value', 'Ana García');
  });

  it('Cancelar edición vuelve a la vista read-only', () => {
    cy.contains('button', 'Editar').click();
    cy.contains('button', 'Cancelar').click();
    cy.contains('button', 'Editar').should('exist');
  });
});

describe('Detalle de Cliente — Seller', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    stubCustomer('SELLER');
    cy.wait('@customerDetail');
  });

  it('muestra el nombre del cliente', () => {
    cy.contains('Ana García').should('be.visible');
  });

  it('Seller NO ve el botón Desactivar', () => {
    cy.contains('button', 'Desactivar').should('not.exist');
  });

  it('botón Volver existe', () => {
    cy.contains('button', 'Volver').should('exist');
  });
});

describe('Detalle de Cliente — Estado de carga/error', () => {
  it('muestra loading mientras carga', () => {
    cy.intercept('GET', /\/api\/customers\/99999999/, (req) => {
      req.reply({ delay: 3000, statusCode: 200, body: { ok: true, data: null } });
    }).as('slowCustomer');
    cy.loginAs('SELLER', '/seller/clients/99999999');
    cy.get('app-loading-state').should('exist');
  });

  it('muestra error si no existe el cliente', () => {
    cy.intercept('GET', /\/api\/customers\/00000000/, {
      statusCode: 404,
      body: { ok: false, message: 'Not found' },
    }).as('notFound');
    cy.loginAs('SELLER', '/seller/clients/00000000');
    cy.wait('@notFound');
    cy.get('app-error-state').should('exist');
  });
});

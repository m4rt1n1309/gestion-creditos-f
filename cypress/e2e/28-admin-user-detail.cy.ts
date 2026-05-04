/**
 * SUITE: Admin — Detalle de Usuario (/admin/users/:id)
 *
 * Cubre:
 *  - Vista read-only: nombre, tags de rol y estado
 *  - Botones de acción: Editar, Desactivar, Resetear contraseña
 *  - Modo edición: campos prellenados
 *  - Cancelar edición vuelve a vista read-only
 *  - Botón Volver
 *  - Estado de carga / error
 */

const USER_MOCK = {
  id: 'usr-002',
  fullName: 'María Sánchez',
  dni: '87654321',
  email: 'vendedor@siscreditos.com',
  address: 'Calle Falsa 456',
  role: 'SELLER',
  status: 'ACTIVE',
  lockedAt: null,
  createdAt: '2025-01-01T00:00:00Z',
};

function stubUser() {
  cy.intercept('GET', /\/api\/users\/usr-002/, {
    statusCode: 200,
    body: { ok: true, data: USER_MOCK },
  }).as('userDetail');
}

describe('Admin — Detalle de Usuario', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    stubUser();
    cy.loginAs('ADMIN', '/admin/users/usr-002');
    cy.wait('@userDetail');
  });

  it('muestra el nombre completo del usuario', () => {
    cy.contains('María Sánchez').should('be.visible');
  });

  it('muestra el tag de rol', () => {
    cy.get('p-tag').should('have.length.gte', 1);
  });

  it('muestra el tag de estado Activo', () => {
    cy.get('p-tag').contains('Activo').should('exist');
  });

  it('muestra el botón Editar', () => {
    cy.contains('button', 'Editar').should('exist');
  });

  it('muestra el botón Desactivar (usuario activo)', () => {
    cy.contains('button', 'Desactivar').should('exist');
  });

  it('muestra el botón "Resetear contraseña"', () => {
    cy.contains('button', 'Resetear contraseña').should('exist');
  });

  it('botón Volver navega al listado', () => {
    cy.contains('button', 'Volver').click();
    cy.url().should('include', '/admin/users');
    cy.url().should('not.match', /\/usr-002$/);
  });

  it('clic en Editar activa el modo edición', () => {
    cy.contains('button', 'Editar').click();
    cy.contains('button', 'Guardar').should('exist');
  });

  it('modo edición: campo fullName prellenado', () => {
    cy.contains('button', 'Editar').click();
    cy.get('input[id="fullName"]').should('have.value', 'María Sánchez');
  });

  it('modo edición: campo email prellenado', () => {
    cy.contains('button', 'Editar').click();
    cy.get('input[id="email"]').should('have.value', 'vendedor@siscreditos.com');
  });

  it('Cancelar en modo edición vuelve a la vista read-only', () => {
    cy.contains('button', 'Editar').click();
    cy.contains('button', 'Cancelar').click();
    cy.contains('button', 'Editar').should('exist');
    cy.contains('button', 'Guardar').should('not.exist');
  });

  it('clic en Desactivar abre diálogo de confirmación', () => {
    cy.contains('button', 'Desactivar').click();
    cy.get('p-confirmDialog').should('be.visible');
  });

  it('clic en "Resetear contraseña" abre diálogo de confirmación', () => {
    cy.contains('button', 'Resetear contraseña').click();
    cy.get('p-confirmDialog').should('be.visible');
  });
});

describe('Admin — Detalle de Usuario — Estado carga/error', () => {
  it('muestra loading state mientras carga', () => {
    cy.intercept('GET', /\/api\/users\/usr-slow/, (req) => {
      req.reply({ delay: 3000, statusCode: 200, body: { ok: true, data: null } });
    }).as('slowUser');
    cy.loginAs('ADMIN', '/admin/users/usr-slow');
    cy.get('app-loading-state').should('exist');
  });

  it('muestra error state si el usuario no existe', () => {
    cy.intercept('GET', /\/api\/users\/usr-404/, {
      statusCode: 404,
      body: { ok: false, message: 'Not found' },
    }).as('notFound');
    cy.loginAs('ADMIN', '/admin/users/usr-404');
    cy.wait('@notFound');
    cy.get('app-error-state').should('exist');
  });
});

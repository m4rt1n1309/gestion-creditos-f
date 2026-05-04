/**
 * SUITE: Seller — Lista y Creación de Clientes (ClientsListComponent / ClientCreateComponent)
 *
 * Difiere de 04-clientes.cy.ts que cubre el componente compartido /admin/clients.
 * Aquí cubrimos las rutas /seller/clients y /seller/clients/new.
 */

describe('Seller — Lista de Clientes (/seller/clients)', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('SELLER', '/seller/clients');
  });

  it('renderiza sin error', () => {
    cy.get('app-error-state').should('not.exist');
  });

  it('muestra campo de búsqueda', () => {
    cy.get('input[placeholder*="Buscar"]').should('exist');
  });

  it('muestra dropdown de filtro por Estado', () => {
    cy.get('p-dropdown').should('exist');
  });

  it('botón "Nuevo cliente" visible para SELLER', () => {
    cy.contains('button', 'Nuevo cliente').should('exist');
  });

  it('clic en "Nuevo cliente" navega a /seller/clients/new', () => {
    cy.contains('button', 'Nuevo cliente').click();
    cy.url().should('include', '/clients/new');
  });

  it('muestra tabla, vacío o loading (no error)', () => {
    cy.get('p-table, app-empty-state, app-loading-state').should('exist');
  });
});

describe('Seller — Crear Cliente (/seller/clients/new)', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('SELLER', '/seller/clients/new');
  });

  it('muestra el título "Nuevo cliente"', () => {
    cy.contains('h2', 'Nuevo cliente').should('be.visible');
  });

  it('tiene campo fullName', () => {
    cy.get('input[id="fullName"]').should('exist');
  });

  it('tiene campo DNI', () => {
    cy.get('input[id="dni"]').should('exist');
  });

  it('tiene campo dirección', () => {
    cy.get('input[id="address"]').should('exist');
  });

  it('tiene campo teléfono', () => {
    cy.get('input[id="phone"]').should('exist');
  });

  it('tiene campo email', () => {
    cy.get('input[id="email"]').should('exist');
  });

  it('botón Guardar deshabilitado con formulario vacío', () => {
    cy.contains('button', 'Guardar').should('have.attr', 'disabled');
  });

  it('tocar campo fullName sin completar muestra error', () => {
    cy.get('input[id="fullName"]').click().blur();
    cy.get('small.text-red-500').should('exist');
  });

  it('email inválido muestra error', () => {
    cy.get('input[id="email"]').type('noesemail').blur();
    cy.get('small.text-red-500').should('exist');
  });

  it('botón Cancelar navega de vuelta a la lista', () => {
    cy.contains('button', 'Cancelar').click();
    cy.url().should('include', '/seller/clients');
    cy.url().should('not.include', '/new');
  });

  it('formulario completo habilita botón Guardar', () => {
    cy.get('input[id="fullName"]').type('Cliente Test E2E');
    cy.get('input[id="dni"]').type('55556666');
    cy.contains('button', 'Guardar').should('not.have.attr', 'disabled');
  });
});

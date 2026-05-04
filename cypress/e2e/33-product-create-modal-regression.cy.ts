/**
 * SUITE: Admin — Modal crear producto (/admin/products)
 *
 * Cubre:
 *  - Apertura del modal desde gestión compartida de productos
 *  - Botón "Guardar Producto" deshabilitado con formulario incompleto
 *  - Botón habilitado al completar los campos requeridos
 */

describe('Admin — Modal crear producto', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/products');
  });

  it('mantiene Guardar Producto deshabilitado hasta completar los campos requeridos', () => {
    cy.contains('button', 'Nuevo Producto').click();

    cy.contains('button', 'Guardar Producto').should('be.disabled');

    cy.get('input[formcontrolname="codigo"]').type('PRD-006');
    cy.get('[formcontrolname="categoria"]').click();
    cy.contains('.p-dropdown-item', 'Electrónica').click();
    cy.get('input[formcontrolname="stockInicial"]').clear().type('5').blur();

    cy.get('p-inputnumber[formcontrolname="precioCompra"] input').type('1000').blur();
    cy.get('p-inputnumber[formcontrolname="precioVenta"] input').type('1500').blur();

    cy.contains('button', 'Guardar Producto').should('not.be.disabled');
  });
});

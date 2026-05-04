/**
 * SUITE: Admin — Toast de alta producto (/admin/products)
 *
 * Cubre:
 *  - El modal compartido muestra feedback visual de éxito al completar el alta
 */

describe('Admin — Toast de alta producto', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/products');
  });

  it('muestra el mensaje de éxito luego de guardar el producto', () => {
    cy.intercept('POST', '**/api/products', {
      statusCode: 201,
      body: {
        ok: true,
        data: {
          id: 'prod-35',
          title: 'PRD-005 Motorola Edge',
          description: 'Motorola demo',
          model: null,
          status: 'ACTIVE',
          created_at: '2026-05-04T00:00:00.000Z',
          updated_at: '2026-05-04T00:00:00.000Z',
          category_id: null,
          category_name: null,
          brand_id: null,
          brand_name: null,
          available_count: 0,
          reserved_count: 0,
          sold_count: 0,
          variants: [],
        },
      },
    }).as('createProduct');

    cy.intercept('POST', '**/api/product-variants', {
      statusCode: 201,
      body: {
        ok: true,
        data: {
          id: 'var-35',
          product_id: 'prod-35',
          color: null,
          size: null,
          capacity: null,
          current_price: 2200,
          status: 'ACTIVE',
          created_at: '2026-05-04T00:00:00.000Z',
          updated_at: '2026-05-04T00:00:00.000Z',
          product_name: 'PRD-005 Motorola Edge',
          title: 'PRD-005 Motorola Edge',
          model: null,
          product_status: 'ACTIVE',
          brand_id: null,
          brand_name: null,
        },
      },
    }).as('createVariant');

    cy.intercept('POST', '**/api/product-units/bulk', {
      statusCode: 201,
      body: {
        ok: true,
        data: {
          created: 1,
          units: [],
        },
      },
    }).as('createUnits');

    cy.intercept('GET', '**/api/products*', {
      statusCode: 200,
      body: { ok: true, data: [] },
    }).as('reloadProducts');

    cy.contains('button', 'Nuevo Producto').click({ force: true });
    cy.get('input[formcontrolname="codigo"]').type('PRD-005');
    cy.get('[formcontrolname="categoria"]').click();
    cy.contains('.p-dropdown-item', 'Electrónica').click();
    cy.get('input[formcontrolname="marca"]').type('Motorola');
    cy.get('input[formcontrolname="modelo"]').type('Edge');
    cy.get('p-inputnumber[formcontrolname="precioCompra"] input').type('1500').blur();
    cy.get('p-inputnumber[formcontrolname="precioVenta"] input').type('2200').blur();
    cy.get('input[formcontrolname="stockInicial"]').clear().type('1').blur();

    cy.contains('button', 'Guardar Producto').click();

    cy.wait('@createProduct');
    cy.wait('@createVariant');
    cy.wait('@createUnits');
    cy.wait('@reloadProducts');

    cy.contains('.p-toast-message', 'Producto registrado correctamente.').should(
      'be.visible',
    );
  });
});

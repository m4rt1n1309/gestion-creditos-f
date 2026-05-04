/**
 * SUITE: Admin — Edición y categoría en productos (/admin/products)
 *
 * Cubre:
 *  - La tabla compartida muestra la categoría real del producto
 *  - Existe acción de edición y navega al formulario correspondiente
 */

describe('Admin — Edición y categoría en productos', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/products');
  });

  it('muestra la categoría y permite navegar a editar', () => {
    cy.intercept('POST', '**/api/products', {
      statusCode: 201,
      body: {
        ok: true,
        data: {
          id: 'prod-36',
          title: 'Moto G84',
          description: 'Smartphone demo',
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
          id: 'var-36',
          product_id: 'prod-36',
          color: null,
          size: null,
          capacity: null,
          current_price: 3200,
          status: 'ACTIVE',
          created_at: '2026-05-04T00:00:00.000Z',
          updated_at: '2026-05-04T00:00:00.000Z',
          product_name: 'Moto G84',
          title: 'Moto G84',
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
      body: {
        ok: true,
        data: [
          {
            id: 'prod-36',
            title: 'Moto G84',
            description: 'Smartphone demo',
            model: null,
            status: 'ACTIVE',
            created_at: '2026-05-04T00:00:00.000Z',
            category_id: 'cat-36',
            category_name: 'Electrónica',
            brand_id: null,
            brand_name: null,
            available_count: 1,
            reserved_count: 0,
            sold_count: 0,
            variants: [
              {
                id: 'var-36',
                color: null,
                size: null,
                capacity: null,
                current_price: 3200,
                status: 'ACTIVE',
              },
            ],
          },
        ],
      },
    }).as('reloadProducts');

    cy.contains('button', 'Nuevo Producto').click({ force: true });
    cy.get('input[formcontrolname="codigo"]').type('PRD-036');
    cy.get('[formcontrolname="categoria"]').click();
    cy.contains('.p-dropdown-item', 'Electrónica').click();
    cy.get('input[formcontrolname="marca"]').type('Motorola');
    cy.get('input[formcontrolname="modelo"]').type('G84');
    cy.get('p-inputnumber[formcontrolname="precioCompra"] input').type('2000').blur();
    cy.get('p-inputnumber[formcontrolname="precioVenta"] input').type('3200').blur();
    cy.get('input[formcontrolname="stockInicial"]').clear().type('1').blur();

    cy.contains('button', 'Guardar Producto').click();

    cy.wait('@createProduct');
    cy.wait('@createVariant');
    cy.wait('@createUnits');
    cy.wait('@reloadProducts');

    cy.contains('td', 'Electrónica').should('be.visible');
    cy.contains('button', 'Editar').should('be.visible');
    cy.contains('button', 'Editar').click({ force: true });
    cy.url().should('include', '/seller/products/prod-36/edit');
  });
});

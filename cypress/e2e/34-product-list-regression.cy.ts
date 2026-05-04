/**
 * SUITE: Admin — Crear producto visible en listado (/admin/products)
 *
 * Cubre:
 *  - El alta desde el modal compartido persiste precio y stock inicial
 *  - El producto vuelve al listado con esos datos visibles tras confirmar
 */

describe('Admin — Alta de producto visible en listado', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/products');
  });

  it('muestra precio y stock luego de confirmar la creación', () => {
    cy.intercept('POST', '**/api/products', {
      statusCode: 201,
      body: {
        ok: true,
        data: {
          id: 'prod-34',
          title: 'PRD-004 Samsung Galaxy',
          description: 'Galaxy demo',
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
          id: 'var-34',
          product_id: 'prod-34',
          color: null,
          size: null,
          capacity: null,
          current_price: 1500,
          status: 'ACTIVE',
          created_at: '2026-05-04T00:00:00.000Z',
          updated_at: '2026-05-04T00:00:00.000Z',
          product_name: 'PRD-004 Samsung Galaxy',
          title: 'PRD-004 Samsung Galaxy',
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
          created: 2,
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
            id: 'prod-34',
            title: 'PRD-004 Samsung Galaxy',
            description: 'Galaxy demo',
            model: null,
            status: 'ACTIVE',
            created_at: '2026-05-04T00:00:00.000Z',
            category_id: null,
            category_name: null,
            brand_id: null,
            brand_name: null,
            available_count: 2,
            reserved_count: 0,
            sold_count: 0,
            variants: [
              {
                id: 'var-34',
                color: null,
                size: null,
                capacity: null,
                current_price: 1500,
                status: 'ACTIVE',
              },
            ],
          },
        ],
      },
    }).as('reloadProducts');

    cy.contains('button', 'Nuevo Producto').click({ force: true });
    cy.get('input[formcontrolname="codigo"]').type('PRD-004');
    cy.get('[formcontrolname="categoria"]').click();
    cy.contains('.p-dropdown-item', 'Electrónica').click();
    cy.get('input[formcontrolname="marca"]').type('Samsung');
    cy.get('input[formcontrolname="modelo"]').type('Galaxy');
    cy.get('p-inputnumber[formcontrolname="precioCompra"] input').type('1000').blur();
    cy.get('p-inputnumber[formcontrolname="precioVenta"] input').type('1500').blur();
    cy.get('input[formcontrolname="stockInicial"]').clear().type('2').blur();

    cy.contains('button', 'Guardar Producto').click();

    cy.wait('@createProduct');
    cy.wait('@createVariant');
    cy.wait('@createUnits');
    cy.wait('@reloadProducts');

    cy.contains('td', 'PRD-004 Samsung Galaxy').should('be.visible');
    cy.contains('td', '1.500').should('be.visible');
    cy.contains('td', '2').should('be.visible');
  });
});

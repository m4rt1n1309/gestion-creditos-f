/**
 * SUITE: Admin — Detalle de Planilla de Cobro (/admin/collections/:id)
 *
 * Cubre:
 *  - Render del detalle con datos
 *  - Cabecera: fecha, cobrador, generado por, filtro usado
 *  - Lista de ítems con estados (PENDING, OVERDUE, PAID)
 *  - Tag "Cobro pendiente de aprobación" si hasPendingPayment
 *  - Botón Volver
 */

const ADMIN_SHEET_MOCK = {
  id: 'sheet-adm-001',
  sheetDate: '2026-04-28T00:00:00Z',
  collectorName: 'Juan Pedraza',
  generatedByName: 'Carlos López',
  filterUsed: 'ALL',
  items: [
    {
      installmentId: 'inst-adm-01',
      installmentNumber: 1,
      customerName: 'Ana García',
      customerPhone: '3811234567',
      customerAddress: 'Av. Principal 100',
      dueDate: '2026-04-30T00:00:00Z',
      amountDue: 13000,
      plannedAmount: 13000,
      installmentStatus: 'PENDING',
      hasPendingPayment: true,
    },
    {
      installmentId: 'inst-adm-02',
      installmentNumber: 4,
      customerName: 'Pedro Gómez',
      customerPhone: '3819876543',
      customerAddress: 'Calle Sur 50',
      dueDate: '2026-04-10T00:00:00Z',
      amountDue: 8500,
      plannedAmount: 8500,
      installmentStatus: 'OVERDUE',
      hasPendingPayment: false,
    },
    {
      installmentId: 'inst-adm-03',
      installmentNumber: 2,
      customerName: 'Laura Díaz',
      customerPhone: null,
      customerAddress: null,
      dueDate: '2026-04-15T00:00:00Z',
      amountDue: 10000,
      plannedAmount: 10000,
      installmentStatus: 'PAID',
      hasPendingPayment: false,
    },
  ],
};

describe('Admin — Detalle de Planilla de Cobro', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);

    cy.intercept('GET', /\/api\/collection-sheets\/sheet-adm-001/, {
      statusCode: 200,
      body: { ok: true, data: ADMIN_SHEET_MOCK },
    }).as('adminSheetDetail');

    cy.loginAs('ADMIN', '/admin/collections/sheet-adm-001');
    cy.wait('@adminSheetDetail');
  });

  it('muestra la fecha de la planilla', () => {
    cy.contains('28/04/2026').should('exist');
  });

  it('muestra el nombre del cobrador', () => {
    cy.contains('Juan Pedraza').should('exist');
  });

  it('muestra quién generó la planilla', () => {
    cy.contains('Carlos López').should('exist');
  });

  it('muestra los 3 ítems de la planilla', () => {
    cy.contains('Ana García').should('exist');
    cy.contains('Pedro Gómez').should('exist');
    cy.contains('Laura Díaz').should('exist');
  });

  it('ítem en mora tiene fondo rojo', () => {
    cy.get('.border-red-200').should('exist');
  });

  it('ítem pagado tiene fondo verde', () => {
    cy.get('.border-green-200').should('exist');
  });

  it('ítem con cobro pendiente muestra aviso "Cobro pendiente de aprobación"', () => {
    cy.contains('Cobro pendiente de aprobación').should('exist');
  });

  it('muestra tags de estado', () => {
    cy.get('p-tag').should('have.length.gte', 2);
  });

  it('botón Volver navega al listado de planillas', () => {
    cy.contains('button', 'Volver').click();
    cy.url().should('include', '/admin/collections');
    cy.url().should('not.include', '/sheet-adm-001');
  });
});

describe('Admin — Detalle de Planilla — Estado carga/error', () => {
  it('muestra loading state mientras carga', () => {
    cy.intercept('GET', /\/api\/collection-sheets\/sheet-slow-adm/, (req) => {
      req.reply({ delay: 3000, statusCode: 200, body: { ok: true, data: null } });
    }).as('slowSheet');
    cy.loginAs('ADMIN', '/admin/collections/sheet-slow-adm');
    cy.get('app-loading-state').should('exist');
  });

  it('muestra error state si no existe la planilla', () => {
    cy.intercept('GET', /\/api\/collection-sheets\/sheet-404-adm/, {
      statusCode: 404,
      body: { ok: false, message: 'Not found' },
    }).as('notFound');
    cy.loginAs('ADMIN', '/admin/collections/sheet-404-adm');
    cy.wait('@notFound');
    cy.get('app-error-state').should('exist');
  });
});

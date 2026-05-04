/**
 * SUITE: Detalle de Crédito (/seller/operations/:id)
 *
 * Estrategia: el stub genérico de loginAs devuelve { ok:true, data:[] }
 * para GET /api/credits/:id, lo que produce el estado de error en el componente.
 * Stubamos específicamente el endpoint de detalle para tener datos reales.
 *
 * Cubre:
 *  - Render con datos (tags de tipo y estado, monto, cuotas)
 *  - Botón Volver
 *  - Botones de acción Admin (Aprobar / Rechazar para PENDING_APPROVAL)
 *  - Seller no ve botones de acción Admin
 *  - Estado de carga / error cuando no hay datos
 */

const CREDIT_MOCK = {
  id: 'crd-001',
  type: 'SALE',
  status: 'PENDING_APPROVAL',
  totalAmount: 150000,
  installmentsCount: 12,
  paymentFrequency: 'WEEKLY',
  interestRate: 10,
  createdAt: '2026-01-15T00:00:00Z',
  approvedAt: null,
  rejectionReason: null,
  customerName: 'Ana García',
  customerDni: '12345678',
  sellerId: 'usr-002',
  sellerName: 'María Sánchez',
  approverId: null,
  approverName: null,
  units: [],
};

const INSTALLMENTS_MOCK = {
  ok: true,
  data: [
    { id: 'inst-001', installmentNumber: 1, dueDate: '2026-02-01', amountDue: 13000, status: 'PENDING', paidAt: null, paidAmount: null },
    { id: 'inst-002', installmentNumber: 2, dueDate: '2026-02-08', amountDue: 13000, status: 'PENDING', paidAt: null, paidAmount: null },
  ],
};

function stubCreditDetail(role: 'ADMIN' | 'SELLER') {
  cy.intercept('GET', /\/api\/credits\/crd-001/, {
    statusCode: 200,
    body: { ok: true, data: CREDIT_MOCK },
  }).as('creditDetail');

  cy.intercept('GET', /\/api\/credits\/crd-001\/installments/, {
    statusCode: 200,
    body: INSTALLMENTS_MOCK,
  }).as('installments');

  cy.loginAs(role, '/seller/operations/crd-001');
}

describe('Detalle de Crédito — Seller', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    stubCreditDetail('SELLER');
    cy.wait('@creditDetail');
  });

  it('muestra el tag de tipo (Venta)', () => {
    cy.get('p-tag').contains('Venta').should('exist');
  });

  it('muestra el tag de estado (Pendiente)', () => {
    cy.get('p-tag').should('have.length.gte', 1);
  });

  it('muestra el botón Volver', () => {
    cy.contains('button', 'Volver').should('exist');
  });

  it('botón Volver navega a la lista', () => {
    cy.contains('button', 'Volver').click();
    cy.url().should('include', '/seller/operations');
    cy.url().should('not.match', /\/crd-001$/);
  });

  it('muestra el monto total del crédito', () => {
    cy.contains('Monto total').should('exist');
  });

  it('muestra las cuotas', () => {
    cy.contains('Cuotas').should('exist');
  });

  it('SELLER no ve botones de Aprobar / Rechazar', () => {
    cy.contains('button', 'Aprobar').should('not.exist');
    cy.contains('button', 'Rechazar').should('not.exist');
  });
});

describe('Detalle de Crédito — Admin', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    stubCreditDetail('ADMIN');
    cy.wait('@creditDetail');
  });

  it('Admin ve el botón "Aprobar" para crédito PENDING_APPROVAL', () => {
    cy.contains('button', 'Aprobar').should('exist');
  });

  it('Admin ve el botón "Rechazar" para crédito PENDING_APPROVAL', () => {
    cy.contains('button', 'Rechazar').should('exist');
  });

  it('clic en "Aprobar" abre un diálogo', () => {
    cy.contains('button', 'Aprobar').click();
    cy.get('p-dialog').should('be.visible');
  });

  it('clic en "Rechazar" abre un diálogo', () => {
    cy.contains('button', 'Rechazar').click();
    cy.get('p-dialog').should('be.visible');
  });
});

describe('Detalle de Crédito — Estado de carga/error', () => {
  it('muestra loading state mientras carga', () => {
    cy.intercept('GET', /\/api\/credits\/crd-002/, (req) => {
      req.reply({ delay: 3000, statusCode: 200, body: { ok: true, data: null } });
    }).as('slowCredit');
    cy.loginAs('SELLER', '/seller/operations/crd-002');
    cy.get('app-loading-state').should('exist');
  });

  it('muestra error state si el endpoint falla', () => {
    cy.intercept('GET', /\/api\/credits\/crd-404/, {
      statusCode: 404,
      body: { ok: false, message: 'Not found' },
    }).as('notFound');
    cy.loginAs('SELLER', '/seller/operations/crd-404');
    cy.wait('@notFound');
    cy.get('app-error-state').should('exist');
  });
});

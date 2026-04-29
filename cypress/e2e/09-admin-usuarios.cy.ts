/**
 * SUITE: Admin — Gestión de Usuarios
 *
 * Cubre:
 *  - Listado de usuarios
 *  - Crear usuario (formulario completo)
 *  - Validaciones de formulario
 *  - Error de DNI duplicado desde backend
 *  - Diálogo de contraseña temporal
 *  - Navegación a detalle tras crear
 */

describe('Admin — Gestión de Usuarios', () => {
  beforeEach(() => {
    cy. viewport(1280, 720);
    cy.loginAs('ADMIN', '/admin/users');
  });

  // ── Listado ────────────────────────────────────────────────────────────────────
  it('muestra el título del módulo', () => {
    cy.contains('h1', 'Gestión de Usuarios').should('be.visible');
  });

  it('la tabla de usuarios es visible', () => {
    cy.get('p-table').should('be.visible');
  });

  it('existe al menos un usuario en la tabla', () => {
    cy.get('p-table tbody tr').should('have.length.gte', 1);
  });

  it('el botón "Nuevo usuario" es visible', () => {
    cy.contains('button', 'Nuevo usuario').should('exist');
  });

  // ── Buscador ────────────────────────────────────────────────────────────────
  it('el buscador filtra resultados', () => {
    cy.get('p-table tbody tr').its('length').then((total) => {
      if (total > 0) {
        cy.get('input[placeholder*="Buscar"]').type('xxx_no_existe');
        cy.get('p-table tbody tr').should('have.length', 0);
      }
    });
  });

  it('al limpiar búsqueda se restauran los resultados', () => {
    cy.get('p-table tbody tr').its('length').then((total) => {
      if (total > 0) {
        cy.get('input[placeholder*="Buscar"]').type('x').clear();
        cy.get('p-table tbody tr').should('have.length', total);
      }
    });
  });

  // ── Navegación a Crear ────────────────────────────────────────────────────────
  it('clic en "Nuevo usuario" navega al formulario', () => {
    cy.contains('button', 'Nuevo usuario').click();
    cy.url().should('include', '/admin/users/new');
  });

  // ── Formulario de Creación ───────────────────────────────────────────────────────────
  describe('Formulario Crear Usuario', () => {
    beforeEach(() => {
      cy.visit('/admin/users/new');
    });

    it('muestra el título "Nuevo usuario"', () => {
      cy.contains('h2', 'Nuevo usuario').should('be.visible');
    });

    it('todos los campos del formulario existen', () => {
      cy.get('input[id="fullName"]').should('exist');
      cy.get('input[id="dni"]').should('exist');
      cy.get('input[id="email"]').should('exist');
      cy.get('input[id="address"]').should('exist');
      cy.get('p-dropdown[id="role"]').should('exist');
    });

    it('el botón "Crear usuario" está deshabilitado con formulario vacío', () => {
      cy.contains('button', 'Crear usuario').should(
        'have.attr',
        'disabled',
      );
    });

    // ── Validaciones ────────────────────────────────────────────────
    it('tocar campo sin completar muestra error en fullName', () => {
      cy.get('input[id="fullName"]').click().blur();
      cy.get('small.text-red-500').should('exist');
    });

    it('tocar DNI sin completar muestra error', () => {
      cy.get('input[id="dni"]').click().blur();
      cy.get('small.text-red-500').should('exist');
    });

    it('tocar rol sin seleccionar muestra error', () => {
      cy.get('p-dropdown').click().blur();
      cy.get('small.text-red-500').should('exist');
    });

    it('ingresar email inválido muestra error de formato', () => {
      cy.get('input[id="email"]').type('email-invalido').blur();
      cy.get('small.text-red-500').should('contain', 'inválido');
    });

    it('ingresar nombre con menos de 3 caracteres muestra error', () => {
      cy.get('input[id="fullName"]').type('AB').blur();
      cy.get('small.text-red-500').should('contain', 'Mínimo');
    });

    // ── Happy Path ───────────────────────────────────────────────
    it('completar formulario válido habilita el botón', () => {
      cy.get('input[id="fullName"]').type('Juan Pérez');
      cy.get('input[id="dni"]').type('99998877');
      cy.get('input[id="email"]').type('jperez@test.com');
      cy.get('input[id="address"]').type('Calle Falsa 123');
      cy.get('p-dropdown').click();
      cy.get('.p-dropdown-item').contains('Vendedor').click();
      cy.contains('button', 'Crear usuario').should('not.have.attr', 'disabled');
    });

    it('botón Cancelar redirige al listado', () => {
      cy.contains('button', 'Cancelar').click();
      cy.url().should('include', '/admin/users');
    });

    // ── Submit + Backend ────────────────────────────────────────────
    it('crear usuario exitoso abre diálogo de contraseña temporal', () => {
      const dniUnique = `99${Date.now().toString().slice(-7)}`;
      cy.get('input[id="fullName"]').type('Usuario Test E2E');
      cy.get('input[id="dni"]').type(dniUnique);
      cy.get('input[id="email"]').type(`test${Date.now()}@e2e.com`);
      cy.get('p-dropdown').click();
      cy.get('.p-dropdown-item').contains('Cobrador').click();
      cy.contains('button', 'Crear usuario').click();
      cy.get('app-temp-password-dialog').should('be.visible');
    });

    it('el diálogo muestra la contraseña temporal', () => {
      cy.get('app-temp-password-dialog').within(() => {
        cy.get('input[disabled]').should('exist');
      });
    });

    it('cerrar diálogo navega al detalle del usuario', () => {
      cy.get('app-temp-password-dialog button').contains('Aceptar').click();
      cy.url().should('match', /\/admin\/users\/[\w-]+$/);
    });

    // ── Error Backend ─────────────────────────────────────────────────────
    it('crear con DNI duplicado muestra error en campo DNI', () => {
      cy.get('input[id="fullName"]').type('Test Duplicado');
      cy.get('input[id="dni"]').type('12345678'); // DNI del admin
      cy.get('input[id="email"]').type('test@test.com');
      cy.get('p-dropdown').click();
      cy.get('.p-dropdown-item').contains('Vendedor').click();
      cy.contains('button', 'Crear usuario').click();
      cy.get('small.text-red-500').should('exist');
    });
  });
});
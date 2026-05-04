# Documento de Pruebas QA - Sistema Créditos

**Propósito:** Registrar los casos de uso, validar el comportamiento esperado (Frontend y Backend) y documentar los errores para la generación de prompts de corrección.

## 🟢 1. Módulo: Crédito

| ID | Caso de Uso / Prueba | Acción Realizada | Resultado Esperado (Éxito) | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **CR-01** | Operación Crédito | Click en "Enviar para Aprobación". | Debería enviar la operación para ser aprobada. | Corregido / Validado |
| **CR-02** | Operación Crédito | En fecha de primer pago puse una fecha anterior a la actual. | Debería estar deshabilitadas las fechas fechas anteriores a la actual. | Error
| **CR-03** | Operación Crédito | Click en "Tipo de operación" y "Préstamo personal". | Debería desaparecer los productos. | Error 
| **CR-04** | Operación Crédito | Escribí "aire" en "Buscar productos". | Debería filtrar la búsqueda por el nombre. | Error 
| **CR-05** | Configuración del Crédito | Click en "Siguiente" sin elegir "Fecha de primer pago". | Debería estar deshabilitado el botón "Siguiente". | Error 
| **CR-06** | Operación Crédito - Declaraciones y Autorizaciones | Dejé sin marcar la casilla "Autorizo el desembolso inmediato". | Debería estar deshabilitado el botón "Siguiente" hasta marcar la casilla. | Error
| **CR-07** | Operación Crédito - Operaciones | Click en "Activo" para filtrar las operaciones. | Debería filtrar las operaciones. | Error
| **CR-08** | Operación Crédito - Operaciones | Escribí "Perez" en el buscador. | Debería filtrar los clientes. | Error

## 🟢 2. Módulo: Cliente

| ID | Caso de Uso / Prueba | Acción Realizada | Resultado Esperado (Éxito) | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **CL-01** | Crear Cliente | Se realizó la creación de un cliente. | Debería salir un mensaje que el cliente se gaurdó correctamente. | Error 
| **CL-02** | Ver Cliente | Click en "Ver" en un cliente. | Debería mostrar los datos del cliente. | Corregido / Validado |
| **CL-03** | Gestión de Clientes | Click en "Editar" en un cliente. | Los cambios deberían guardarse en la DB. | Corregido / Validado |



## 🟢 3. Módulo: Producto

| ID | Caso de Uso / Prueba | Acción Realizada | Resultado Esperado (Éxito) | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **PR-01** | Crear Producto | Se realizó la creación de un producto. | Los campos deberían ser obligatorios. | Corregido / Validado |
| **PR-02** | Editar Producto | No existe el botón editar producto. | No está editar producto. | Corregido / Validado |
| **PR-03** | Categoría Producto | Los campos de categoría están vacíos. | No está la categoría de los productos. | Corregido / Validado |
| **PR-04** | Crear Producto | Se hizo click en "Crear Producto". | Los productos deberían mostrarse luego de confirmar la creación. | Corregido / Validado |
| **PR-05** | Crear Producto | Se hizo click en confirmar al "Crear Producto". | Debería salir un cartel que el producto fué creado exitosamente. | Corregido / Validado |
| **PR-06** | Crear Producto | Se hizo click en "Crear Producto". | Debería estar deshabilitado el botón "Guardar producto" hasta completar los campos obligatorios. | Corregido / Validado |

## ✅ Correcciones validadas recientemente

- **CR-01**: el flujo SALE quedó alineado al contrato actual (`unit_ids`, `down_payment`, sin `prepaid_installments` en alta).
- **CL-02**: el detalle del cliente ya carga por `id` real y no depende de mocks locales.
- **CL-03**: la edición de cliente persiste los campos soportados actualmente (`full_name`, `phone`) y se refleja tras recargar.
- **PR-01**: el formulario de `seller/products/new` ya bloquea el alta vacía; el problema era un spec Cypress buscando el label viejo del botón.
- **PR-02**: el listado compartido de `/admin/products` ahora incluye acción "Editar" por fila y navega a `seller/products/:id/edit`.
- **PR-03**: la columna categoría del listado compartido ya usa `categoryName` real del backend.
- **PR-04**: el modal compartido ahora crea también la variante y las unidades iniciales, por eso precio y stock ya se reflejan en el listado tras confirmar.
- **PR-05**: el modal compartido ahora muestra feedback visual de éxito con toast al completar el alta del producto.
- **PR-06**: el modal compartido de alta de producto ahora mantiene deshabilitado "Guardar Producto" mientras el formulario esté inválido.

## 🧪 Evidencia de regresión automatizada

- `cypress/e2e/31-qa-regression-issues.cy.ts` → flujo SALE integrado: **passing**
- `cypress/e2e/32-client-detail-regression.cy.ts` → CL-02 detalle cliente: **passing**
- `cypress/e2e/04-clientes.cy.ts` → módulo clientes / CL-03 persistencia: **passing**
- `cypress/e2e/30-producto-crear.cy.ts` → PR-01 crear producto: **passing**
- `cypress/e2e/36-product-edit-category-regression.cy.ts` → PR-02/PR-03 edición + categoría: **passing**
- `cypress/e2e/34-product-list-regression.cy.ts` → PR-04 alta visible en listado: **passing**
- `cypress/e2e/35-product-success-toast-regression.cy.ts` → PR-05 toast de éxito: **passing**
- `cypress/e2e/33-product-create-modal-regression.cy.ts` → PR-06 modal crear producto: **passing**

## 🟢 

| ID | Caso de Uso / Prueba | Acción Realizada | Resultado Esperado (Éxito) | Estado |
| :--- | :--- | :--- | :--- | :--- |

## 🟢 

| ID | Caso de Uso / Prueba | Acción Realizada | Resultado Esperado (Éxito) | Estado |
| :--- | :--- | :--- | :--- | :--- |

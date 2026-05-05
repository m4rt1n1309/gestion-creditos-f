# Plantilla de Reporte de Bug / Nueva Funcionalidad

**Módulo:** [Agenda / Caja / Productos / Reportes / Global]
**ID de Prueba:** [Ej: AG-11, CA-06]
**Título / Descripción:** [Descripción breve de lo que se va a probar o el error encontrado]

### 1. Contexto de la Prueba
* **Acción Realizada:** [Ej: Hice clic en "Registrar Pago" agregando 10 personas...]
* **Resultado Esperado:** [Ej: Debería sumar $4200 y guardarse en la BD.]
* **Resultado Obtenido (Error):** [Ej: Tira Error 500 y se ve la pantalla desalineada.]

### 2. Evidencia Técnica
**Payload Enviado (Request):**
```json
{
  "ejemplo": "pegar payload aca"
}
```

---
Modulo Crédito

**Módulo:** [Crédito]
**ID de Prueba:** [CR-01]
**Título / Descripción:** [Nueva operación crédito.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Hice click en "Enviar para Aprobación"]
* **Resultado Esperado:** [Debería enviar la operación para ser aprobada.]
* **Resultado Obtenido (Actual):** [Corregido. La operación SALE envía `unit_ids` y acepta `down_payment`; el alta ya no usa `prepaid_installments`. Validado con Cypress en `31-qa-regression-issues.cy.ts`.]
### 2. Evidencia Técnica
**Payload Enviado (Request):**
http://localhost:3000/api/credits - POST
```json 
{
    customer_id:"7f7f3a3b-df67-4948-bb3a-db8140c4d5a2"
    installments_count:6
    payment_frequency:"MONTHLY"
    type:"SALE"
    unit_ids:["unit-1"]
    down_payment:200
    down_payment_method:"CASH"
}
```

**Respuesta esperada actual:**
```json
{
    "ok": true,
    "message": "Pre-operación registrada. Pendiente de aprobación."
}
```
### 1. Contexto de la Prueba
* **Acción Realizada:** [Hice click en "Enviar para Aprobación"]
* **Resultado Esperado:** [Debería enviar la operación para ser aprobada.]
* **Resultado Obtenido (Actual):** [Cuando eligo un producto que dice que posee 5 unidades sale error de no encontrado.]
### 2. Evidencia Técnica

**Payload Enviado (Request):**
```json
{
{customer_id: "9da1f6c7-8297-44c9-858e-a5d3918deccf", type: "SALE", installments_count: 6,…}
customer_id:"9da1f6c7-8297-44c9-858e-a5d3918deccf"
installments_count:6
payment_frequency:"MONTHLY"
type:"SALE"
unit_ids:["c8e8ef31-eec0-4e8f-a09c-d921a368d84d"]
0:"c8e8ef31-eec0-4e8f-a09c-d921a368d84d"
}

```

**Respuesta esperada actual:**
```json
{
    "ok": false,
    "message": "Unidad c8e8ef31-eec0-4e8f-a09c-d921a368d84d no encontrada."
}
```
---

**Módulo:** [Crédito]
**ID de Prueba:** [CR-02]
**Título / Descripción:** [Nueva operación crédito.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [En fecha de primer pago me deja poder fechas anteriores a la actual.]
* **Resultado Esperado:** [Debería estar deshabilitadas las fechas anteriores a la actual.]
* **Resultado Obtenido (Error):** [Permite continuar la operación aunque la fecha sea incorrecta.]

---

**Módulo:** [Crédito]
**ID de Prueba:** [CR-03]
**Título / Descripción:** [Nueva operación crédito.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Hice click en "Tipo de operación" y elegi "Préstamo personal".]
* **Resultado Esperado:** [Debería desaparecer los productos.]
* **Resultado Obtenido (Error):** [Los productos continúan visibles.]
* **Resultado Obtenido (Actual):** [Corregido. Al elegir "Préstamo personal" se ocultan buscador/listados/selección de productos y además se limpia el estado (`searchProduct`, `selectedProducts`) para evitar datos residuales. Validado con `step-products.component.spec.ts` y `new-operation.component.spec.ts` (caso LOAN sin productos).]

---

**Módulo:** [Crédito]
**ID de Prueba:** [CR-04]
**Título / Descripción:** [Nueva operación crédito.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Escribí "aire" en "Buscar Producto".]
* **Resultado Esperado:** [Debería filtrar los productos por el nombre.]
* **Resultado Obtenido (Actual):** [Corregido. El listado del paso "Tipo y Producto" ahora se filtra por nombre usando el texto de `searchProduct`. Validado con `step-products.component.spec.ts` (caso CR-04).]

---

**Módulo:** [Crédito]
**ID de Prueba:** [CR-05]
**Título / Descripción:** [Configuración del crédito.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Hice click en "Siguiente" sin elegir "Fecha del primer pago".]
* **Resultado Esperado:** [Debería estar deshabilitado el botón "Siguiente" hasta elegir la "Fecha del primer pago".]
* **Resultado Obtenido (Actual):** [Corregido. En paso Condiciones, `canNext` bloquea avanzar cuando `firstDueDate` está vacío o es inválido. Validado con `new-operation.component.spec.ts` (caso CR-05) y `cypress/e2e/07-negative-nueva-operacion.cy.ts`.]
* **Acción Realizada:** [Hice click para elegir la fecha con el mouse.]
* **Resultado Esperado:** [Debería poder elegir la fecha con el click.]
* **Resultado Obtenido (Actual):** [Al hacer click con el mouse sobre una fecha del calendario no hace nada, escribiendo la fecha me permite seguir.]


---

**Módulo:** [Crédito]
**ID de Prueba:** [CR-06]
**Título / Descripción:** [Operación Crédito - Declaraciones y Autorizaciones.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Dejé sin marcar la casilla "Autorizo el desembolso inmediato al finalizar la aprobación del crédito".]
* **Resultado Esperado:** [Debería estar deshabilitado el botón "Siguiente" hasta marcar la casilla.]
* **Resultado Obtenido (Actual):** [Corregido. El botón final de envío queda deshabilitado hasta marcar también `disbursement` junto con las demás declaraciones obligatorias. Validado con `new-operation.component.spec.ts` y `cypress/e2e/07-negative-nueva-operacion.cy.ts` (caso CR-06).]

---

**Módulo:** [Crédito]
**ID de Prueba:** [CR-07]
**Título / Descripción:** [Operaciones.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Hice click en "Activo" para filtrar las operaciones.]
* **Resultado Esperado:** [Debería filtrar las operaciones.]
* **Resultado Obtenido (Actual):** [Corregido. El listado ahora aplica filtro real por estado y "Activo" devuelve únicamente operaciones activas. Validado con `operations.component.spec.ts` (caso CR-07) y Cypress `14-seller-operaciones.cy.ts`.]

---

**Módulo:** [Crédito]
**ID de Prueba:** [CR-08]
**Título / Descripción:** [Operaciones.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Escribí "Perez" en el buscador.]
* **Resultado Esperado:** [Debería filtrar los clientes.]
* **Resultado Obtenido (Actual):** [Corregido. El buscador ahora filtra por cliente ignorando mayúsculas/minúsculas y tildes (ej. "Perez" encuentra "Pérez"). Validado con `operations.component.spec.ts` (caso CR-08) y Cypress `14-seller-operaciones.cy.ts`.]

---

Módulo Clientes

**Módulo:** [Clientes]
**ID de Prueba:** [CL-01]
**Título / Descripción:** [Crear Cliente]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se realizó la creación de un nuevo cliente.]
* **Resultado Esperado:** [Debería salir un mensaje que el cliente se guardo exitosamente.]
* **Resultado Obtenido (Error):** [No sale ninguna alerta que el cliente se guardo exitosamente.]

---

**Módulo:** [Clientes]
**ID de Prueba:** [CL-02]
**Título / Descripción:** [Ver Cliente]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se hizo click sobre el boton "Ver" en un cliente.]
* **Resultado Esperado:** [Debe mostrar los datos del Cliente.]
* **Resultado Obtenido (Actual):** [Corregido. El detalle ahora carga el cliente real por `id`; solo muestra “Cliente no encontrado.” cuando el backend responde 404. Validado con Cypress en `32-client-detail-regression.cy.ts`.]

---

**Módulo:** [Clientes]
**ID de Prueba:** [CL-03]
**Título / Descripción:** [Gestion de Clientes]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se hizo click sobre el boton "Editar" en un cliente.]
* **Resultado Esperado:** [Al modificar los datos deben guardarse en la DB.]
* **Resultado Obtenido (Actual):** [Corregido. Los cambios persistidos actualmente (`full_name`, `phone`) se guardan y se mantienen tras refrescar. Los campos no soportados por el contrato real fueron retirados del modal para evitar UX engañosa. Validado con Cypress en `04-clientes.cy.ts`.]

---

## Resumen de correcciones ya validadas

- **CR-01** → Corregido / validado
- **CL-02** → Corregido / validado
- **CL-03** → Corregido / validado

## Evidencia automatizada

- `cypress/e2e/31-qa-regression-issues.cy.ts` → passing
- `cypress/e2e/32-client-detail-regression.cy.ts` → passing
- `cypress/e2e/04-clientes.cy.ts` → passing

---

Módulo Producto

**Módulo:** [Producto]
**ID de Prueba:** [PR-01]
**Título / Descripción:** [Crear Producto]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se realizó la creación de un nuevo producto.]
* **Resultado Esperado:** [Los campos deberían ser obligatorios.]
* **Resultado Obtenido (Actual):** [Validado. El formulario `seller/products/new` mantiene deshabilitado el botón "Registrar producto" mientras el formulario sea inválido. El falso negativo original venía de un spec Cypress desactualizado que buscaba el label viejo "Guardar". Validado con `30-producto-crear.cy.ts`.]

---

**Módulo:** [Producto]
**ID de Prueba:** [PR-02]
**Título / Descripción:** [Editar Producto]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Quisiera editar el producto para agregar mas unidades por ejemplo.]
* **Resultado Esperado:** [No se encuentra el botón para editar el producto.]
* **Resultado Obtenido (Actual):** [Corregido. El listado compartido de `/admin/products` ahora muestra el botón "Editar" por fila y permite navegar al formulario `seller/products/:id/edit`. Validado con `36-product-edit-category-regression.cy.ts`.]

* **Acción Realizada:** [Quisiera editar el producto para agregar mas unidades por ejemplo.]
* **Resultado Esperado:** [Hice click en "Editar Producto".]
* **Resultado Obtenido (Actual):** [El campo stock no se encuentra y los botones "Guardar Cambios" y "Cancelar" no estan alineados con los demas botones.]

---

**Módulo:** [Producto]
**ID de Prueba:** [PR-03]
**Título / Descripción:** [Categoría Producto]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Quiero ver la categoría del producto.]
* **Resultado Esperado:** [Los productos no poseen la categoría.]
* **Resultado Obtenido (Actual):** [Corregido. La columna categoría ya muestra el valor real (`categoryName`) devuelto por backend en el listado compartido de productos. Validado con `36-product-edit-category-regression.cy.ts`.]

---

**Módulo:** [Producto]
**ID de Prueba:** [PR-04]
**Título / Descripción:** [Crear Producto]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se realizó la operación de "Crear Producto".]
* **Resultado Esperado:** [Los productos deberían mostrarse luego de confirmar la creación.]
* **Resultado Obtenido (Actual):** [Corregido. El modal compartido ahora crea el producto base, su variante con precio y las unidades iniciales según el stock cargado, por lo que el listado ya muestra precio y stock después de confirmar. Validado con `34-product-list-regression.cy.ts`.]

### 2. Evidencia Técnica
**Payload Enviado (Request):**
http://localhost:3000/api/products - POST
```json 
{
    data: 
{id: "de490051-aaa2-4cad-80ae-d1292011e93f", title: "PRD0002 Samsung Galaxy A54",…}
available_count:0
brand_id:null
category_id:null
created_at:"2026-05-03T01:52:36.084Z"
description:"Galaxy A54 5G 256 GB Awesome graphite 8 GB RAM"
id:"de490051-aaa2-4cad-80ae-d1292011e93f"
model:null
reserved_count:0
sold_count:0
status:"ACTIVE"
title:"PRD0002 Samsung Galaxy A54"
variants:[]
}
```

**Respuesta esperada actual:**
```json
{
    "ok": true,
    "message": "Producto registrado correctamente.",
    "data": {
        "id": "de490051-aaa2-4cad-80ae-d1292011e93f",
        "title": "PRD0002 Samsung Galaxy A54",
        "description": "Galaxy A54 5G 256 GB Awesome graphite 8 GB RAM",
        "model": null,
        "brand_id": null,
        "category_id": null,
        "status": "ACTIVE",
        "created_at": "2026-05-03T01:52:36.084Z",
        "available_count": 0,
        "reserved_count": 0,
        "sold_count": 0,
        "variants": []
    }
}
```

**Comportamiento integrado posterior esperado:**
- Alta de `product_variant` con `current_price`
- Alta de `product_units` según `stockInicial`
- Refresh del listado con precio y stock visibles

---

**Módulo:** [Producto]
**ID de Prueba:** [PR-05]
**Título / Descripción:** [Crear Producto]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se hizo click en confirmar la operación de "Crear Producto".]
* **Resultado Esperado:** [Debería salir un cartel que el producto fué creado exitosamente.]
* **Resultado Obtenido (Actual):** [Corregido. El modal compartido de `/admin/products` ahora muestra un toast con el mensaje "Producto registrado correctamente." después de completar el alta integrada. Validado con `35-product-success-toast-regression.cy.ts`.]

---

**Módulo:** [Producto]
**ID de Prueba:** [PR-06]
**Título / Descripción:** [Crear Producto]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se hizo click en "Crear Producto".]
* **Resultado Esperado:** [Debería estar deshabilitado el botón de "Guardar Producto" hasta llenar los campos.]
* **Resultado Obtenido (Actual):** [Corregido. El modal mantiene deshabilitado "Guardar Producto" mientras falten campos obligatorios o el formulario siga inválido. Validado con Cypress en `33-product-create-modal-regression.cy.ts`.]

---

## Resumen de correcciones validadas en Producto

- **PR-06** → Corregido / validado

## Evidencia automatizada

- `cypress/e2e/33-product-create-modal-regression.cy.ts` → passing

---

Módulo Planilla

**Módulo:** [Planilla]
**ID de Prueba:** [PL-01]
**Título / Descripción:** [Generar Planilla]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se hizo click en "Generar Planilla para todos" y se seleccionó un cobrador y se hizo click en "Generar Planilla".]
* **Resultado Esperado:** [Deberia aparecer las planillas generadas y deshabilitar el botón "Generar Planilla para todos" y dehabilitar el botón "Generar Planilla" cuando se selecciona un cobrador.]
* **Resultado Obtenido (Actual):** [Permite apretar el boton las veces que uno quiera.]

**Módulo:** [Planilla]
**ID de Prueba:** [PL-02]
**Título / Descripción:** [Botones]
### 1. Contexto de la Prueba
* **Resultado Obtenido (Actual):** [Botones no están alineados al resto de la página.]

---


Módulo Gastos

**Módulo:** [Gastos]
**ID de Prueba:** [GA-01]
**Título / Descripción:** [Gastos]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se hizo click en desactivar gasto "Alquiler".]
* **Resultado Esperado:** [Deberia poder activarlo de nuevo si quisiera.]
* **Resultado Obtenido (Actual):** [No existe el botón "Activar".]
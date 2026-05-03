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
* **Resultado Obtenido (Error):** [Arroja Error 400 y no se registro la operación.]
### 2. Evidencia Técnica
**Payload Enviado (Request):**
http://localhost:3000/api/credits - POST
```json 
{
    customer_id:"7f7f3a3b-df67-4948-bb3a-db8140c4d5a2"
    installments_count:6
    payment_frequency:"MONTHLY"
    type:"SALE"
    units:[]
}
```

**Respuesta del servidor:**
```json
{
    "ok": false,
    "message": "Datos inválidos. Revisá los campos marcados.",
    "errors": [
        {
            "field": "unit_ids",
            "message": "Las ventas deben incluir al menos una unidad de producto."
        }
    ]
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

---

**Módulo:** [Crédito]
**ID de Prueba:** [CR-04]
**Título / Descripción:** [Nueva operación crédito.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Escribí "aire" en "Buscar Producto".]
* **Resultado Esperado:** [Debería filtrar los productos por el nombre.]
* **Resultado Obtenido (Error):** [No funciona el buscador.]

---

**Módulo:** [Crédito]
**ID de Prueba:** [CR-05]
**Título / Descripción:** [Configuración del crédito.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Hice click en "Siguiente" sin elegir "Fecha del primer pago".]
* **Resultado Esperado:** [Debería estar deshabilitado el botón "Siguiente" hasta elegir la "Fecha del primer pago".]
* **Resultado Obtenido (Error):** [Permite continuar aunque no se haya elegido la "Fecha del primer pago".]

---

**Módulo:** [Crédito]
**ID de Prueba:** [CR-06]
**Título / Descripción:** [Operación Crédito - Declaraciones y Autorizaciones.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Dejé sin marcar la casilla "Autorizo el desembolso inmediato al finalizar la aprobación del crédito".]
* **Resultado Esperado:** [Debería estar deshabilitado el botón "Siguiente" hasta marcar la casilla.]
* **Resultado Obtenido (Error):** [Permite continuar aunque no se haya tildado la casilla.]

---

**Módulo:** [Crédito]
**ID de Prueba:** [CR-07]
**Título / Descripción:** [Operaciones.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Hice click en "Activo" para filtrar las operaciones.]
* **Resultado Esperado:** [Debería filtrar las operaciones.]
* **Resultado Obtenido (Error):** [No funciona el filtro.]

---

**Módulo:** [Crédito]
**ID de Prueba:** [CR-08]
**Título / Descripción:** [Operaciones.]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Escribí "Perez" en el buscador.]
* **Resultado Esperado:** [Debería filtrar los clientes.]
* **Resultado Obtenido (Error):** [No funciona el buscador.]

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
* **Resultado Obtenido (Error):** [Muestra un mensaje que dice Cliente no encontrado y no muestra nada.]

---

**Módulo:** [Clientes]
**ID de Prueba:** [CL-03]
**Título / Descripción:** [Gestion de Clientes]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se hizo click sobre el boton "Editar" en un cliente.]
* **Resultado Esperado:** [Al modificar los datos deben guardarse en la DB.]
* **Resultado Obtenido (Error):** [Al hacer click en "Guardar Cambios" y refrescar la página los cambios no se mantienen.]

---

Módulo Producto

**Módulo:** [Producto]
**ID de Prueba:** [PR-01]
**Título / Descripción:** [Crear Producto]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se realizó la creación de un nuevo producto.]
* **Resultado Esperado:** [Los campos deberían ser obligatorios.]
* **Resultado Obtenido (Error):** [Te deja cargar el producto por mas que no cargues ningun valor en los campos.]

---

**Módulo:** [Producto]
**ID de Prueba:** [PR-02]
**Título / Descripción:** [Editar Producto]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Quisiera editar el producto para agregar mas unidades por ejemplo.]
* **Resultado Esperado:** [No se encuentra el botón para editar el producto.]
* **Resultado Obtenido (Error):** [No existe el botón editar producto.]

---

**Módulo:** [Producto]
**ID de Prueba:** [PR-03]
**Título / Descripción:** [Categoría Producto]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Quiero ver la categoría del producto.]
* **Resultado Esperado:** [Los productos no poseen la categoría.]
* **Resultado Obtenido (Error):** [La columna de categoría esta vacía.]

---

**Módulo:** [Producto]
**ID de Prueba:** [PR-04]
**Título / Descripción:** [Crear Producto]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se realizó la operación de "Crear Producto".]
* **Resultado Esperado:** [Los productos deberían mostrarse luego de confirmar la creación.]
* **Resultado Obtenido (Error):** [Algunos campos salen vacíos a pesar de haberlos cargados, por ejemplo: stock, precio.]

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

**Respuesta del servidor:**
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

---

**Módulo:** [Producto]
**ID de Prueba:** [PR-05]
**Título / Descripción:** [Crear Producto]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se hizo click en confirmar la operación de "Crear Producto".]
* **Resultado Esperado:** [Debería salir un cartel que el producto fué creado exitosamente.]
* **Resultado Obtenido (Error):** [No aparece ningún cartel que el producto fué creado exitosamente.]

---

**Módulo:** [Producto]
**ID de Prueba:** [PR-06]
**Título / Descripción:** [Crear Producto]
### 1. Contexto de la Prueba
* **Acción Realizada:** [Se hizo click en "Crear Producto".]
* **Resultado Esperado:** [Debería estar deshabilitado el botón de "Guardar Producto" hasta llenar los campos.]
* **Resultado Obtenido (Error):** [El botón de "Guardar Cambios" esta habilitado aunque no se hayan completado los cambios.]
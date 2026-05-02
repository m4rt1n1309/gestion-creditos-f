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
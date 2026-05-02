# Documento de Pruebas QA - Sistema PadelSys

**Propósito:** Registrar los casos de uso, validar el comportamiento esperado (Frontend y Backend) y documentar los errores para la generación de prompts de corrección.

## 🟢 1. Módulo: Crédito

| ID | Caso de Uso / Prueba | Acción Realizada | Resultado Esperado (Éxito) | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **CR-01** | Operación Crédito | Click en "Enviar para Aprobación". | Debería enviar la operación para ser aprobada. | Error 400
| **CR-02** | Operación Crédito | En fecha de primer pago puse una fecha anterior a la actual. | Debería estar deshabilitadas las fechas fechas anteriores a la actual. | Error
| **CR-03** | Operación Crédito | Click en "Tipo de operación" y "Préstamo personal". | Debería desaparecer los productos. | Error 
| **CR-04** | Operación Crédito | Escribí "aire" en "Buscar productos". | Debería filtrar la búsqueda por el nombre. | Error 
| **CR-05** | Configuración del Crédito | Click en "Siguiente" sin elegir "Fecha de primer pago". | Debería estar deshabilitado el botón "Siguiente". | Error 
| **CR-06** | Operación Crédito - Declaraciones y Autorizaciones | Dejé sin marcar la casilla "Autorizo el desembolso inmediato". | Debería estar deshabilitado el botón "Siguiente" hasta marcar la casilla. | Error
| **CR-07** | Operación Crédito - Operaciones | Click en "Activo" para filtrar las operaciones. | Debería filtrar las operaciones. | Error
| **CR-08** | Operación Crédito - Operaciones | Escribí "Perez" en el buscador. | Debería filtrar los clientes. | Error

## 🟢 

| ID | Caso de Uso / Prueba | Acción Realizada | Resultado Esperado (Éxito) | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **CL-01** | Crear Cliente | Se realizó la creación de un cliente. | Debería salir un mensaje que el cliente se gaurdó correctamente. | Error 
| **CL-02** | Ver Cliente | Click en "Ver" en un cleinte. | Debería mostrar los datos del cliente. | Error 
| **CL-0#** | Gestión de Clientes | Click en "Editar" en un cliente. | Los cambios deberían guardarse en la DB. | Error



## 🟢 

| ID | Caso de Uso / Prueba | Acción Realizada | Resultado Esperado (Éxito) | Estado |
| :--- | :--- | :--- | :--- | :--- |


## 🟢 

| ID | Caso de Uso / Prueba | Acción Realizada | Resultado Esperado (Éxito) | Estado |
| :--- | :--- | :--- | :--- | :--- |

## 🟢 

| ID | Caso de Uso / Prueba | Acción Realizada | Resultado Esperado (Éxito) | Estado |
| :--- | :--- | :--- | :--- | :--- |

# Issue Log — SisCreditos · Auditoría QA Cypress

Fecha: 2026-04-26  
Revisor: DG (QA Automation)  
Scope: Análisis de código fuente para escritura de pruebas E2E

---

## ISSUE-001 ✅ SOLUCIONADO
| Campo | Valor |
|-------|-------|
| **Tipo** | Arquitectura |
| **Severidad** | Alta |
| **Componente** | Global — todos los componentes |
| **Estado** | ✅ Solucionado — 2026-04-26 |
| **Descripción** | El proyecto no tiene ningún archivo `cypress.config.ts` ni directorio `cypress/`. Cypress está instalado como dependencia (v13.17.0) pero nunca fue configurado. No existe ninguna prueba E2E. |
| **Recomendación** | Agregar `cypress.config.ts` en la raíz del proyecto (ya generado en esta sesión). Añadir script `"e2e": "cypress open"` en `package.json`. Configurar `specPattern`, `baseUrl` y `supportFile`. |
| **Solución aplicada** | Creados: `cypress.config.ts`, `cypress/support/e2e.ts`, `cypress/support/commands.ts`, 4 specs en `cypress/e2e/`. Scripts `"e2e"` y `"e2e:run"` agregados a `package.json`. Cypress binary v13.17.0 verificado. |

---

## ISSUE-002 ✅ SOLUCIONADO
| Campo | Valor |
|-------|-------|
| **Tipo** | Arquitectura |
| **Severidad** | Alta |
| **Componente** | Todos los componentes excepto Login y Sidebar |
| **Estado** | ✅ Solucionado — 2026-04-26 |
| **Descripción** | Solo 4 elementos en toda la aplicación tienen atributos `data-testid` (input-dni, input-password, login-error, btn-login) y 1 tiene `data-cy` (none — ninguno usa `data-cy`). El resto de la app carece de atributos de prueba, obligando al uso de selectores frágiles basados en texto, clases CSS o posición DOM. |
| **Recomendación** | Añadir `data-cy` (convención Cypress) a todos los elementos interactivos clave: botones de acción en tablas (`data-cy="btn-ver-cliente"`, `data-cy="btn-editar-cliente"`), campos de búsqueda, dropdowns de filtro, ítems de navegación del sidebar, botones Siguiente/Anterior/Cancelar del wizard, y checkboxes de confirmación. Ejemplo: `<button [attr.data-cy]="'btn-ver-' + client.id">Ver</button>`. |
| **Solución aplicada** | `data-cy` agregados en 6 archivos HTML. Tests actualizados para usar nuevos selectores. |

---

## ISSUE-003 ✅ SOLUCIONADO
| Campo | Valor |
|-------|-------|
| **Tipo** | Visual |
| **Severidad** | Media |
| **Componente** | `shared/clients/clients.component.html` — Botones Ver/Editar/Créditos |
| **Estado** | ✅ Solucionado — 2026-04-26 |
| **Descripción** | Los botones de acción en la tabla de clientes usan `style=""` inline para colores y padding en lugar de las clases utilitarias de Tailwind o las variantes de severidad de PrimeNG. Esto dificulta el mantenimiento, rompe la coherencia visual del tema, e impide que el theming de PrimeNG afecte a estos botones. Además, usar `pButton` como atributo en lugar de `p-button` como componente es un patrón mezclado. |
| **Recomendación** | Reemplazar `<button pButton style="...">` por `<p-button label="Ver" severity="secondary" size="small" styleClass="..."/>` usando las variantes de PrimeNG. Eliminar todos los estilos inline de colores. |
| **Solución aplicada** | Los tres botones reemplazados por `<p-button>` con severidades PrimeNG: `info` (Ver), `success` (Editar), `warning` (Créditos). Todos con `size="small"`, `[outlined]="true"`. Eliminados todos los `style=""` inline y las clases CSS legacy. |

---

## ISSUE-004 ✅ SOLUCIONADO
| Campo | Valor |
|-------|-------|
| **Tipo** | Funcional |
| **Severidad** | Media |
| **Componente** | `shared/clients/clients.component.html` — Modal "Créditos" |
| **Estado** | ✅ Solucionado — 2026-04-26 |
| **Descripción** | El modal de Créditos solo muestra un mensaje estático: "Cliente tiene X crédito(s) activo(s). Detalle de créditos próximamente." No hay una vista real del historial crediticio del cliente. Si un usuario hace clic en "Créditos" espera ver el listado de créditos. |
| **Recomendación** | Implementar la vista de créditos del cliente usando el componente `client-credits` que ya existe en `shared/clients/client-detail/tabs/client-credits/`. O bien, navegar a la ruta `/admin/clients/:dni` que muestra el detalle completo con tabs. Retirar el placeholder "próximamente". |
| **Solución aplicada** | Modal placeholder eliminado. `openCredits()` ya navegaba a `base/clients/:dni` (detalle con tabs reales). Se eliminó también el flag `showCreditsModal` del TS. |

---

## ISSUE-005 ✅ SOLUCIONADO
| Campo | Valor |
|-------|-------|
| **Tipo** | Funcional |
| **Severidad** | Media |
| **Componente** | `shared/operations/new-operation/steps/step-client/step-client.component.html` |
| **Estado** | ✅ Solucionado — 2026-04-26 |
| **Descripción** | El email del cliente en el panel de detalle está hardcodeado como `cliente&#64;email.com` en lugar de mostrar el email real del objeto `client`. Esto causa que todos los clientes muestren el mismo correo electrónico ficticio. |
| **Recomendación** | Reemplazar `cliente&#64;email.com` con `{{ client.email }}` y asegurarse que el modelo `Client` expone el campo `email`. |
| **Solución aplicada** | Campo `email` agregado a la interfaz `Client` en `operation-form.service.ts`. Mock data actualizado con emails reales por cliente. Template reemplazado con `{{ client.email }}`. |

---

## ISSUE-006 ✅ SOLUCIONADO
| Campo | Valor |
|-------|-------|
| **Tipo** | Funcional |
| **Severidad** | Media |
| **Componente** | `shared/operations/new-operation/steps/step-client/step-client.component.html` |
| **Estado** | ✅ Solucionado — 2026-04-26 |
| **Descripción** | Los valores "3 créditos · sin mora" y "$2,400 / mes" están hardcodeados. No se leen de la entidad `Client`. Un cliente con mora o capacidad diferente mostraría datos incorrectos. |
| **Recomendación** | Vincular estos valores a propiedades del objeto `client` (ej. `client.previousCredits`, `client.delinquency`, `client.paymentCapacity`). Agregar estos campos al modelo `Client` si no existen. |
| **Solución aplicada** | Campos `previousCredits`, `delinquency` y `paymentCapacity` agregados a la interfaz `Client` en `operation-form.service.ts`. Mock data actualizado. Template vinculado a `{{ client.previousCredits }}`, `{{ client.delinquency }}` y `{{ client.paymentCapacity \| currency }}`. `CommonModule` agregado a `StepClientComponent`. |

---

## ISSUE-007 ✅ SOLUCIONADO
| Campo | Valor |
|-------|-------|
| **Tipo** | Arquitectura |
| **Severidad** | Media |
| **Componente** | `core/auth/mock-auth.service.ts` |
| **Estado** | ✅ Solucionado — 2026-04-26 |
| **Descripción** | El `MockAuthService` acepta cualquier contraseña siempre que el DNI exista. Solo valida el DNI. Esto puede generar una falsa sensación de seguridad en el entorno de desarrollo y confundir a los testers que asuman que la contraseña también se valida. |
| **Recomendación** | Documentar explícitamente (en README o en un comentario visible) que la contraseña no se valida en modo mock. Considerar añadir una contraseña mock consistente (`password: '1234'`) para hacer el mock más fiel al comportamiento del servicio real. |
| **Solución aplicada** | Constante `MOCK_PASSWORD = '1234'` exportada. `login()` ahora valida `credentials.password !== MOCK_PASSWORD` además del DNI — error 401 si no coincide. Comentario de cabecera documenta las credenciales mock. Todos los usuarios usan la misma contraseña `'1234'`. |

---

## ISSUE-008 ✅ SOLUCIONADO
| Campo | Valor |
|-------|-------|
| **Tipo** | Visual |
| **Severidad** | Baja |
| **Componente** | `shared/layout/sidebar/sidebar.component.html` |
| **Estado** | ✅ Solucionado — 2026-04-26 |
| **Descripción** | El link "Mi Perfil" en el footer del sidebar apunta a `routerLink="/profile"` pero esa ruta no está definida en ningún archivo de rutas (`app.routes.ts`, `admin.routes.ts`, etc.). Clicking ese link no navegará a ninguna parte o lanzará un error de consola. |
| **Recomendación** | Crear la ruta `/profile` con su componente correspondiente, o temporalmente reemplazar el link por `[routerLink]="null"` con un tooltip "Próximamente" para evitar la navegación rota. |
| **Solución aplicada** | `routerLink="/profile"` reemplazado por `[routerLink]="null"`. Cursor cambiado a `cursor-not-allowed` con opacidad reducida. Tooltip "Próximamente" agregado via `pTooltip`. `TooltipModule` importado en `SidebarComponent`. |

---

## ISSUE-009 ✅ SOLUCIONADO
| Campo | Valor |
|-------|-------|
| **Tipo** | Arquitectura |
| **Severidad** | Baja |
| **Componente** | `shared/operations/new-operation/steps/step-conditions/step-conditions.component.html` |
| **Estado** | ✅ Solucionado — 2026-04-26 |
| **Descripción** | El componente `p-calendar` para la fecha del primer pago no tiene `data-testid` ni un `id` estable. En PrimeNG, el `p-calendar` renderiza un input interno con clases dinámicas. Para interactuar con él desde Cypress de forma fiable se necesita un selector estable. |
| **Recomendación** | Agregar `inputId="first-due-date"` y `[attr.data-cy]="'input-first-due-date'"` al `p-calendar`. En Cypress, seleccionar via `cy.get('#first-due-date')` o `cy.get('[data-cy="input-first-due-date"]')`. |
| **Solución aplicada** | `inputId="first-due-date"` y `data-cy="input-first-due-date"` ya presentes en el template al momento de la auditoría. Issue verificado como resuelto. |

---

## ISSUE-010 ✅ SOLUCIONADO
| Campo | Valor |
|-------|-------|
| **Tipo** | Funcional |
| **Severidad** | Baja |
| **Componente** | `shared/operations/new-operation/new-operation.component.html` |
| **Estado** | ✅ Solucionado — 2026-04-26 |
| **Descripción** | El botón "Enviar para Aprobación" llama a `finish()` pero no hay evidencia de feedback posterior (toast de éxito, redirección, ni estado de loading). Si el servicio falla silenciosamente el usuario no recibe confirmación. |
| **Recomendación** | Implementar: (1) estado `[loading]="submitting"` en el botón durante el envío, (2) `p-toast` con mensaje de éxito/error al completar, (3) redirección a `/admin/operations` o a la operación recién creada. |
| **Solución aplicada** | Flag `submitting` agregado al componente. Botón usa `[loading]="submitting"` y `[disabled]="!isConfirmed \|\| submitting"`. `<p-toast>` agregado al template. `finish()` simula llamada async (1s), muestra toast de éxito y redirige a la lista de operaciones. `ToastModule` y `MessageService` importados/provistos en el componente. |

---

## Resumen ejecutivo

| Tipo | Alta | Media | Baja |
|------|------|-------|------|
| Funcional | 0 | 3 | 1 |
| Visual | 0 | 1 | 1 |
| Arquitectura | 2 | 1 | 1 |
| **Total** | **2** | **5** | **3** |

**Prioridad 1 (bloquea testing):** ~~ISSUE-001~~ ✅, ~~ISSUE-002~~ ✅  
**Prioridad 2 (datos incorrectos):** ~~ISSUE-004~~ ✅, ~~ISSUE-005~~ ✅, ~~ISSUE-006~~ ✅  
**Prioridad 3 (calidad y UX):** ~~ISSUE-003~~ ✅, ~~ISSUE-007~~ ✅, ~~ISSUE-008~~ ✅, ~~ISSUE-009~~ ✅, ~~ISSUE-010~~ ✅

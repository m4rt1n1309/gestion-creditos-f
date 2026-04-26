# finFlow — Gestión de Créditos

Frontend de la plataforma de gestión de créditos y cobros, construida con Angular 18 (Standalone Components).

---

## Stack

| Tecnología          | Versión       |
| ------------------- | ------------- |
| Angular             | 18.2.x        |
| TypeScript          | 5.5.2         |
| Tailwind CSS        | 3.4.19        |
| PrimeNG             | 17.18.15      |
| RxJS                | 7.8.0         |
| chart.js            | 4.5.1         |
| date-fns            | 3.6.0         |
| jsPDF + html2canvas | 4.2.1 / 1.4.1 |

---

## Módulos

### Admin (`/admin/*`)

| Ruta                         | Descripción                                          |
| ---------------------------- | ---------------------------------------------------- |
| `/admin/dashboard`           | KPIs y resumen de operaciones recientes              |
| `/admin/operations`          | Listado y creación de operaciones                    |
| `/admin/clients/:dni`        | Detalle de cliente (créditos, documentos, historial) |
| `/admin/users`               | CRUD de usuarios y roles                             |
| `/admin/approvals`           | Flujo de aprobación de créditos                      |
| `/admin/delinquency`         | Seguimiento de mora                                  |
| `/admin/cash-register`       | Caja y movimientos de pago                           |
| `/admin/sheet`               | Planilla de cobro (exportable a PDF)                 |
| `/admin/collections`         | Planillas de cobro generadas                         |
| `/admin/collections/new`     | Generar nueva planilla de cobro                      |
| `/admin/collections/:id`     | Detalle de planilla de cobro                         |
| `/admin/payments`            | Pagos recibidos                                      |
| `/admin/commissions`         | Comisiones de vendedores y cobradores                |
| `/admin/reports`             | Reportes                                             |
| `/admin/config`              | Configuración de empresa, tasas, notificaciones      |

### Seller (`/seller/*`)

| Ruta                        | Descripción                         |
| --------------------------- | ----------------------------------- |
| `/seller/clients`           | Directorio de clientes con filtros  |
| `/seller/clients/new`       | Alta de nuevo cliente               |
| `/seller/clients/:dni`      | Detalle y edición de cliente        |
| `/seller/operations`        | Listado de operaciones del vendedor |
| `/seller/operations/new`    | Crear nueva operación               |
| `/seller/operations/:id`    | Detalle de operación                |
| `/seller/products`          | Catálogo de productos               |
| `/seller/products/new`      | Crear producto (solo ADMIN)         |
| `/seller/products/:id`      | Detalle de producto                 |
| `/seller/products/:id/edit` | Editar producto (solo ADMIN)        |
| `/seller/commissions`       | Comisiones del vendedor             |

### Collector (`/collector/*`)

| Ruta                       | Descripción                         |
| -------------------------- | ----------------------------------- |
| `/collector/route`         | Ruta de cobro asignada              |
| `/collector/route/:sheetId`| Detalle de planilla de cobro        |
| `/collector/payments`      | Pagos registrados por el cobrador   |
| `/collector/commissions`   | Comisiones del cobrador             |

### Portal cliente (`/portal/*`)

| Ruta                    | Descripción                        |
| ----------------------- | ---------------------------------- |
| `/portal/login`         | Acceso del cliente (sin auth admin)|
| `/portal/dashboard`     | Resumen de cuenta del cliente      |
| `/portal/credits`       | Listado de créditos del cliente    |
| `/portal/credits/:id`   | Detalle de crédito                 |

### Público

| Ruta               | Descripción                |
| ------------------ | -------------------------- |
| `/login`           | Autenticación admin/roles  |
| `/forgot-password` | Recuperación de contraseña |
| `/change-password` | Cambio de contraseña (auth requerida) |

---

## Arquitectura

```
src/app/
├── core/                  # Servicios singleton, auth, HTTP
│   ├── auth/              # Guards (authGuard, roleGuard, noAuthGuard)
│   ├── http/              # ApiHttpService (wrapper REST genérico)
│   ├── interceptors/      # JWT, loading, error
│   ├── models/            # AuthUser, ApiResponse<T>, UserRole
│   └── services/          # DateService, HeaderService, LoadingService
├── features/
│   ├── admin/             # Dashboard, aprobaciones, caja, usuarios, colecciones, pagos, comisiones, config
│   ├── seller/            # Clientes, operaciones, productos, comisiones
│   ├── collector/         # Ruta de cobro, pagos, comisiones
│   ├── portal/            # Portal cliente (login, dashboard, créditos)
│   └── public/            # Login admin, recuperación/cambio de contraseña
├── shared/
│   ├── components/        # TempPasswordDialog
│   ├── layout/            # Header, Sidebar
│   ├── clients/           # ClientDetailComponent (tabs: créditos, docs, historial)
│   ├── operations/        # Wizard multi-paso (cliente → productos → condiciones → confirmación)
│   ├── products/          # Catálogo de productos
│   ├── states/            # LoadingState, EmptyState, ErrorState
│   ├── models/            # Interfaces compartidas, enums (AppRoutes, UserRoleEnum)
│   └── utils/             # nav-config y utilidades
└── mocks/                 # MockAuthService, MockDataService
```

### Patrones clave

- **Standalone Components** — sin NgModules
- **Lazy loading** — cada feature route carga bajo demanda
- **Signals** — estado reactivo moderno (Angular Signals + RxJS)
- **Adapter pattern** — servicios convierten `snake_case` (backend) ↔ `camelCase` (frontend)
- **Guard composition** — `authGuard` + `roleGuard` apilados por ruta
- **SSR habilitado** — Express server (`server.ts`)

---

## Roles

| Rol                | Acceso                       |
| ------------------ | ---------------------------- |
| `ADMIN`            | Todo                         |
| `SELLER`           | `/seller/*`                  |
| `COLLECTOR`        | `/collector/*`               |
| `SELLER_COLLECTOR` | `/seller/*` + `/collector/*` |
| `CASHIER`          | Por definir                  |

---

## Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
ng serve
# → http://localhost:4200

# Build producción
ng build

# Tests unitarios
ng test

# Tests e2e (Cypress)
npx cypress open
```

---

## Variables de entorno

Configurar en `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiBaseUrl: "http://localhost:3000",
  tokenKey: "finflow_token",
};
```

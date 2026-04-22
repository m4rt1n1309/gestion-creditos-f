import { AppRoutes } from '../models/enums/routes.enum';
import { NavItem } from '../models/interface/nav-item';

export const NAV_CONFIG: NavItem[] = [
  {
    label: 'Principal',
    requiredRoles: ['ADMIN'],
    isGroupLabel: true,
  },
  {
    label: 'Dashboard',
    icon: 'pi pi-th-large',
    route: `/${AppRoutes.ADMIN}/${AppRoutes.DASHBOARD}`,
    requiredRoles: ['ADMIN'],
  },

  {
    label: 'Gestión',
    requiredRoles: ['ADMIN', 'SELLER'],
    isGroupLabel: true,
  },
  {
    label: 'Operaciones',
    icon: 'pi pi-file-edit',
    route: (role) => `/${role.toLowerCase()}/${AppRoutes.OPERATIONS}`,
    requiredRoles: ['ADMIN', 'SELLER'],
  },
  {
    label: 'Clientes',
    icon: 'pi pi-users',
    route: (role) => `/${role.toLowerCase()}/${AppRoutes.CLIENTS}`,
    requiredRoles: ['ADMIN', 'SELLER'],
  },
  {
    label: 'Productos',
    icon: 'pi pi-box',
    route: (role) => `/${role.toLowerCase()}/${AppRoutes.PRODUCTS}`,
    requiredRoles: ['ADMIN', 'SELLER'],
  },

  {
    label: 'Administración',
    requiredRoles: ['ADMIN'],
    isGroupLabel: true,
  },
  {
    label: 'Usuarios',
    icon: 'pi pi-user',
    route: `/${AppRoutes.ADMIN}/${AppRoutes.USERS}`,
    requiredRoles: ['ADMIN'],
  },
  {
    label: 'Aprobaciones',
    icon: 'pi pi-check-square',
    route: `/${AppRoutes.ADMIN}/${AppRoutes.APPROVALS}`,
    requiredRoles: ['ADMIN'],
    badge: 3,
    testId: 'nav-aprobaciones',
  },
  {
    label: 'Mora y Canc.',
    icon: 'pi pi-exclamation-triangle',
    route: `/${AppRoutes.ADMIN}/${AppRoutes.DELINQUENCY}`,
    requiredRoles: ['ADMIN'],
  },
  {
    label: 'Planilla',
    icon: 'pi pi-list',
    route: `/${AppRoutes.ADMIN}/${AppRoutes.SHEET}`,
    requiredRoles: ['ADMIN'],
  },
  {
    label: 'Caja',
    icon: 'pi pi-wallet',
    route: `/${AppRoutes.ADMIN}/${AppRoutes.CASH_REGISTER}`,
    requiredRoles: ['ADMIN'],
    dividerAfter: true,
  },

  {
    label: 'Sistema',
    requiredRoles: ['ADMIN'],
    isGroupLabel: true,
  },
  {
    label: 'Reportes',
    icon: 'pi pi-chart-bar',
    route: `/${AppRoutes.ADMIN}/${AppRoutes.REPORTS}`,
    requiredRoles: ['ADMIN'],
  },
  {
    label: 'Configuración',
    icon: 'pi pi-cog',
    route: `/${AppRoutes.ADMIN}/${AppRoutes.CONFIG}`,
    requiredRoles: ['ADMIN'],
  },

  {
    label: 'Cobranza en campo',
    requiredRoles: ['COLLECTOR'],
    isGroupLabel: true,
  },
  {
    label: 'Mi Ruta',
    icon: 'pi pi-map',
    route: AppRoutes.ROUTE,
    requiredRoles: ['COLLECTOR'],
  },
];

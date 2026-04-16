export enum AppRoutes {
  // Rutas específicas:
  LOGIN = 'login',
  ADMIN = 'admin',
  SELLER = 'seller',
  COLLECTOR = 'collector',

  // Rutas internas:
  // ADMIN:
  ADMIN_DASHBOARD = '/admin/dashboard',
  ADMIN_APPROVALS = '/admin/approvals',
  ADMIN_DELINQUENCY = '/admin/delinquency',
  ADMIN_SHEET = '/admin/sheet',
  ADMIN_CASH_REGISTER = '/admin/cash-register',
  ADMIN_REPORTS = '/admin/reports',
  ADMIN_CONFIG = '/admin/config',

  // SELLER:
  SELLER_OPERATIONS = '/seller/operations',
  SELLER_CLIENTS = '/seller/clients',
  SELLER_PRODUCTS = '/seller/products',

  // COLLECTOR:
  COLLECTOR_ROUTE = '/collector/route',
}

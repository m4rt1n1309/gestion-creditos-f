import { UserRole } from '../../../core/models/types/user-role';

export interface NavItem {
  label: string;
  icon?: string;
  route?: string | ((role: string) => string);
  requiredRoles: UserRole[];
  badge?: number;
  dividerAfter?: boolean;
  isGroupLabel?: boolean;
  testId?: string;
}

export interface ResolvedNavItem extends Omit<NavItem, 'route'> {
  route?: string;
}

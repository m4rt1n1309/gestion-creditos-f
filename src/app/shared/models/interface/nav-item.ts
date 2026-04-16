import { UserRole } from "../../../core/models/types/user-role";

export interface NavItem {
  label: string;
  icon?: string;
  route?: string;
  requiredRoles: UserRole[];
  badge?: number;
  dividerAfter?: boolean;
  isGroupLabel?: boolean;
}

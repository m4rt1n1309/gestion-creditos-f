import { UserRole } from '../../../../core/models/types/user-role';

export interface UserRaw {
  id: string;
  full_name: string;
  dni: string;
  email: string | null;
  address: string | null;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  is_temp_password: boolean;
  failed_attempts: number;
  locked_at: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface UserDetailRaw extends UserRaw {
  updated_at: string;
}

export interface CreateResponseRaw {
  user: UserDetailRaw;
  tempPassword: string;
}

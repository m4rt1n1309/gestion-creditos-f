import { UserRole } from "../types/user-role";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roles: UserRole[];
  token: string;
}

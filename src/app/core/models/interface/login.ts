export interface LoginUserPayload {
  id: string;
  full_name: string;
  dni?: string;
  role: string;
  is_temp_password: boolean;
}

export interface LoginResponseData {
  token: string;
  user: LoginUserPayload;
}

export interface MeResponseData {
  id: string;
  full_name: string;
  dni?: string;
  role: string;
  status: string;
  is_temp_password: boolean;
  force_relogin_at: string | null;
  pending_approvals_count?: number;
}

export interface LoginCredentials {
  dni: string;
  password: string;
}

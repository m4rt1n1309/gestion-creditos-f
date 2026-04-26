export interface LoginResponseRaw {
  token: string;
  customer: {
    id: string;
    full_name: string;
    dni: string;
    portal_is_temp_password: boolean;
  };
}

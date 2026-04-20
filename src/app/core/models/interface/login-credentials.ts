export interface LoginCredentials {
  /** DNI del usuario — el backend autentica por DNI, no por email. */
  dni: string;
  password: string;
}

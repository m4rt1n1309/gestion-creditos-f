import { HttpErrorResponse } from '@angular/common/http';

export interface AppError {
  status: number;
  message: string;
  code?: string;
  errors?: unknown;
}

export function toAppError(err: HttpErrorResponse): AppError {
  // El backend devuelve { ok: false, message: string, errors?: unknown }
  if (err.error && typeof err.error === 'object' && 'message' in err.error) {
    return {
      status: err.status,
      message: err.error.message as string,
      errors: (err.error as { errors?: unknown }).errors,
    };
  }

  // Errores de red / CORS / timeout (status 0)
  if (err.status === 0) {
    return {
      status: 0,
      message: 'No se pudo conectar con el servidor. Verificá tu conexión.',
    };
  }

  return {
    status: err.status,
    message: err.message || 'Error inesperado del servidor.',
  };
}

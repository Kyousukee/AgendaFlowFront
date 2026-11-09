import { RegisterRequest } from '../../features/auth/interfaces/register-request.interface';
import { LoginApiResponse } from './auth-response.interface';

/** Datos que la API extrae del `credential` de Google cuando la cuenta aún no existe. */
export interface PerfilGoogle {
  email: string;
  nombre?: string | null;
  apellido?: string | null;
  foto?: string | null;
}

export interface RequiereRegistroGoogle {
  requiereRegistro: true;
  perfil: PerfilGoogle;
}

/** `POST /auth/google`: inicia sesión si la cuenta existe, o pide completar el registro. */
export type GoogleAuthResponse = LoginApiResponse | RequiereRegistroGoogle;

/** `POST /auth/google/registro`: como el registro normal, sin email ni contraseña. */
export type GoogleRegistroRequest = Omit<RegisterRequest, 'email' | 'password'> & {
  credential: string;
};

/** Registro con Google a medio camino. Vive solo en memoria: el `credential` no se persiste. */
export interface RegistroGooglePendiente {
  credential: string;
  perfil: PerfilGoogle;
}

export function requiereRegistroGoogle(
  respuesta: GoogleAuthResponse,
): respuesta is RequiereRegistroGoogle {
  return 'requiereRegistro' in respuesta && respuesta.requiereRegistro === true;
}

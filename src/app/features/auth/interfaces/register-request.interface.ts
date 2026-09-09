import { AuthResponse } from '../../../core/interfaces/auth-response.interface';

/**
 * Plano, no anidado: el RegisterDto del backend lo es, y su ValidationPipe
 * corre con forbidNonWhitelisted, asi que cualquier propiedad de mas
 * (confirmPassword incluida) devuelve 400.
 *
 * Los tres grupos del formulario de registro mapean 1:1 sobre esta interfaz.
 */
export interface RegisterRequest {
  // Paso 1 - cuenta de usuario
  nombre: string;
  apellido?: string;
  email: string;
  password: string;

  // Paso 2 - datos del negocio
  empresaNombre: string;
  nombreComercial?: string;
  empresaEmail?: string;
  telefono?: string;

  // Paso 3 - primera sucursal
  sucursalNombre?: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
  pais?: string;
  latitud?: number | null;
  longitud?: number | null;
}

export type RegisterResponse = AuthResponse;

import { AuthResponse } from '../../../core/interfaces/auth-response.interface';

export interface RegisterEmpresaRequest {
  nombre: string;
  nombreComercial?: string;
  email?: string;
  telefono?: string;
}

export interface RegisterUsuarioRequest {
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface RegisterSucursalRequest {
  nombre?: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
  pais?: string;
  latitud?: number;
  longitud?: number;
}

export interface RegisterRequest {
  empresa: RegisterEmpresaRequest;
  usuario: RegisterUsuarioRequest;
  sucursal: RegisterSucursalRequest;
}

export type RegisterResponse = AuthResponse;

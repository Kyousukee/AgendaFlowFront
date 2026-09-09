import { Empresa } from './empresa.interface';
import { Sucursal } from './sucursal.interface';
import { Empleado } from './empleado.interface';

export interface UserData {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  /**
   * El backend emite un id numerico de rol, no un string.
   * 1 = Administrador (los controladores protegidos llevan @Roles(1)).
   */
  rolId: number;
  telefono?: string;
  empleado: Empleado | null;
}

export interface AuthResponse {
  /** Access token emitido por Supabase Auth. */
  accessToken: string;
  /** Se intercambia en POST /auth/refresh cuando el access token caduca. */
  refreshToken: string;
  /** Unix epoch en segundos. */
  expiresAt: number;
  empresa: Empresa | null;
  sucursales: Sucursal[];
  user: UserData;
}

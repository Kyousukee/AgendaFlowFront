import { Empresa } from './empresa.interface';
import { Sucursal } from './sucursal.interface';
import { Empleado } from './empleado.interface';

export interface UserData {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  empresaId: number;
  rol: string;
  telefono?: string;
}

export interface AuthResponse {
  token: string;
  usuario: UserData;
  empresa: Empresa;
  sucursales: Sucursal[];
  empleado: Empleado;
}

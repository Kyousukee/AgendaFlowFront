import { Cliente } from './cliente.interface';
import { Empleado } from './empleado.interface';
import { Empresa } from './empresa.interface';
import { Estado } from './estado.interface';
import { Servicio } from './servicio.interface';
import { Sucursal } from './sucursal.interface';

export interface Reserva {
  id: number;
  codigo: string;
  empresa: Empresa;
  sucursal: Sucursal;
  cliente: Cliente;
  empleado: Empleado;
  servicio: Servicio;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  precio: number;
  observacion?: string;
  fechaCreacion: string;
  estado: Estado;
}

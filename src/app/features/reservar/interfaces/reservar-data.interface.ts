import { Servicio } from '../../../core/interfaces/servicio.interface';
import { Empleado } from '../../../core/interfaces/empleado.interface';

export interface PasoServicio {
  servicio: Servicio | null;
}

export interface PasoEmpleadoFecha {
  empleado: Empleado | null;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface PasoCliente {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  observacion: string;
}

export interface ReservarWizardData {
  servicio: Servicio | null;
  empleado: Empleado | null;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  clienteNombre: string;
  clienteApellido: string;
  clienteEmail: string;
  clienteTelefono: string;
  observacion: string;
}

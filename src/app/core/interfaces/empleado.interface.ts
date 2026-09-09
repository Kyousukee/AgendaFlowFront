export interface ServicioEmpleadoResponse {
  id: number;
  servicio: {
    id: number;
    nombre: string;
    descripcion?: string;
    duracionMinutos: number;
    precio: number;
    color?: string;
    activo: boolean;
    fechaCreacion: string;
  };
}

export interface Empleado {
  id: number;
  sucursalId?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  foto?: string | null;
  descripcion?: string | null;
  activo: boolean;
  fechaCreacion: string;
  serviciosEmpleados?: ServicioEmpleadoResponse[];
}

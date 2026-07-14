export interface Empleado {
  id: number;
  sucursalId: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  foto?: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: string;
}

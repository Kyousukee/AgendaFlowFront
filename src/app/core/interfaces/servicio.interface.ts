export interface Servicio {
  id: number;
  empresaId: number;
  nombre?: string;
  descripcion?: string;
  duracionMinutos: number;
  precio: number;
  color?: string;
  activo: boolean;
  fechaCreacion: string;
}

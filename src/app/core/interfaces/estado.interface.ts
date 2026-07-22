export interface Estado {
  id: number;
  tipo?: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden?: number;
  activo?: boolean;
  fechaCreacion?: string;
}

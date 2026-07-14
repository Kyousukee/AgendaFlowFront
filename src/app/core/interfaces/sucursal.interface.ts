export interface Sucursal {
  id: number;
  empresaId: number;
  nombre?: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
  pais?: string;
  latitud?: number;
  longitud?: number;
  telefono?: string;
  activo: boolean;
  fechaCreacion: string;
}

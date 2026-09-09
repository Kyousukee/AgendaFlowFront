export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  empresaNombre: string;
  nombreComercial?: string;
  empresaEmail?: string;
  telefono?: string;
  sucursalNombre?: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
  pais?: string;
  latitud?: number | null;
  longitud?: number | null;
}

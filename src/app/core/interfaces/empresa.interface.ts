export interface Empresa {
  id: number;
  nombre: string;
  nombreComercial?: string;
  slug: string;
  descripcion?: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  sitioWeb?: string;
  logo?: string;
  banner?: string;
  colorPrincipal?: string;
  colorSecundario?: string;
  activo: boolean;
  fechaCreacion: string;
}

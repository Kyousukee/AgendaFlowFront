import { TipoAnticipo } from './configuracion-empresa.interface';

/** SPEC 06: configuración pública de cobro al reservar (GET /reservar/empresa-slug/:slug). */
export interface PagoOnlinePublico {
  activo: boolean;
  obligatorio: boolean;
  tipo: TipoAnticipo | null;
  /** CLP fijo (Monto) o porcentaje (Porcentaje). null en Completo o si no está activo. */
  monto: number | null;
}

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
  logo?: string | null;
  banner?: string;
  colorPrincipal?: string;
  colorSecundario?: string;
  activo: boolean;
  fechaCreacion: string;
  /** SPEC 06: solo en la respuesta pública de la página de reservas. */
  pagoOnline?: PagoOnlinePublico;
}

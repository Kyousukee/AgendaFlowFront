export interface Servicio {
  id: number;
  empresaId: number;
  nombre?: string;
  descripcion?: string;
  duracionMinutos: number;
  precio: number;
  color?: string;
  activo: boolean;
  desactivadoPorSuscripcion?: boolean;
  fechaCreacion: string;
  /** SPEC 06: abono a pagar al reservar (solo en la página pública). null = sin cobro. */
  abono?: number | null;
}

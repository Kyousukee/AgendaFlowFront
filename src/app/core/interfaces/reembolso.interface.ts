/** SPEC 07: quien pidió el reembolso. */
export type OrigenReembolso = 'Cliente' | 'Panel';

/** POST /pagos/:id/reembolso. Sin `monto`, el back devuelve todo el reembolsable. */
export interface SolicitarReembolsoDto {
  monto?: number;
  cancelarReserva: boolean;
}

/** Respuesta 201 de POST /pagos/:id/reembolso. */
export interface ReembolsoSolicitado {
  reembolso: { id: number; monto: number; estado: string };
  reserva: { estado: string | null };
}

/** Un elemento de GET /pagos/:id/reembolsos (más reciente primero). */
export interface ReembolsoHistorial {
  id: number;
  monto: number;
  origen: OrigenReembolso;
  /** Estado de tipo 'Pago': Pendiente, Reembolsado o Rechazado. */
  estado: { id: number; nombre: string; color?: string } | null;
  comisionFlow: number | null;
  error: string | null;
  fechaCreacion: string;
  fechaResolucion: string | null;
}

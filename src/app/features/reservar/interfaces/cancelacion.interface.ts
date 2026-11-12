/** SPEC 07: por qué una reserva no se puede cancelar desde el enlace. */
export type MotivoNoCancelable = 'FUERA_DE_PLAZO' | 'YA_CANCELADA' | 'NO_CANCELABLE';

/** GET /reservar/cancelacion/:token. No trae datos del cliente. */
export interface CancelacionVista {
  reserva: {
    /** AAAA-MM-DD */
    fecha: string;
    /** HH:mm */
    horaInicio: string;
    servicio: string | null;
    sucursal: string | null;
    empresa: string | null;
    estado: string | null;
  };
  puedeCancelar: boolean;
  motivo: MotivoNoCancelable | null;
  /** ISO 8601: hasta cuándo se puede cancelar online. */
  limite: string;
  plazoHoras: number;
  /** Lo que se devolvería ahora (neto que recibió el local). null sin abono Flow. */
  reembolso: { monto: number } | null;
}

/** Respuesta 200 de POST /reservar/cancelacion/:token. */
export interface CancelacionRealizada {
  estado: 'Cancelada';
  reembolso: { monto: number; estado: string } | null;
}

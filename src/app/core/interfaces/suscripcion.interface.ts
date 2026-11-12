export type PlanSuscripcion = 'Prueba' | 'Gratis' | 'Pro';
export type RecursoLimitado = 'sucursales' | 'empleados' | 'servicios';

export interface Suscripcion {
  plan: PlanSuscripcion;
  sinVencimiento: boolean;
  fechaFin: string | null;
  diasRestantes: number | null;
  porVencer: boolean;
  aviso: string | null;
  limites: Record<RecursoLimitado, number | null>; // null = ilimitado
  uso: Record<RecursoLimitado, number>;
}

/** SPEC 06: `pagosOnline` llega al activar el cobro al reservar en un plan sin pagos online. */
export type RecursoLimiteError = RecursoLimitado | 'pagosOnline';

export interface SuscripcionLimiteError {
  statusCode: 403;
  code: 'SUSCRIPCION_LIMITE';
  plan: PlanSuscripcion;
  recurso: RecursoLimiteError;
  limite: number;
  actual: number;
  message: string;
}

/** SPEC 06: respuesta de POST /suscripcion/pagar. */
export interface PagoMensualidadIniciado {
  urlPago: string;
  pagoId: number;
}

/** SPEC 06: un pago de la mensualidad Pro (GET /suscripcion/pagos). */
export interface PagoMensualidad {
  id: number;
  monto: number;
  dias: number;
  estado: { nombre: string; color: string | null } | null;
  fechaCreacion: string;
  fechaPago: string | null;
  finNuevo: string | null;
}

/** SPEC 06: lo que informa el back al volver de Flow a /suscripcion/pago. */
export type ResultadoPagoMensualidad = 'pagado' | 'rechazado' | 'pendiente';

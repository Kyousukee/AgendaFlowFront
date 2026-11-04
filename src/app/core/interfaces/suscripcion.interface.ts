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

export interface SuscripcionLimiteError {
  statusCode: 403;
  code: 'SUSCRIPCION_LIMITE';
  plan: PlanSuscripcion;
  recurso: RecursoLimitado;
  limite: number;
  actual: number;
  message: string;
}

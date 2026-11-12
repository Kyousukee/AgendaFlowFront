import { HttpErrorResponse } from '@angular/common/http';
import { Pago } from '../../../core/interfaces/pago.interface';
import { esPagoFlow } from '../../../shared/components/metodo-pago/metodo-pago.component';

const ESTADO_PAGADO = 'Pagado';

export function formatearPesos(monto: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto);
}

/** El `message` de un error de NestJS: un texto o, en validaciones, una lista. */
export function mensajeDeError(error: HttpErrorResponse): string | null {
  const cuerpo: unknown = error.error;
  if (!cuerpo || typeof cuerpo !== 'object' || !('message' in cuerpo)) return null;
  const { message } = cuerpo as { message: unknown };
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.filter((m) => typeof m === 'string').join('. ');
  return null;
}

/** SPEC 07: pago cobrado con Flow (cuenta Flow o método Flow). */
export function esPagoConFlow(pago: Pago): boolean {
  return pago.cuentaFlowId != null || esPagoFlow(pago.metodoPago);
}

/** SPEC 07: los abonos Flow `Pagado` se reembolsan desde el panel mientras quede saldo. */
export function puedeReembolsar(pago: Pago): boolean {
  if (!esPagoConFlow(pago) || pago.estado?.nombre !== ESTADO_PAGADO) return false;
  if (pago.montoNeto == null) return true;
  return pago.montoNeto - (pago.montoReembolsado ?? 0) > 0;
}

import { Estado } from './estado.interface';
import { Reserva } from './reserva.interface';

export interface Pago {
  id: number;
  reserva_id: number;
  reserva: Reserva;
  monto: number;
  metodoPago: string;
  codigoTransaccion: string;
  fechaPago: string;
  estado: Estado;
  /** SPEC 06: cuenta Flow que cobró el abono. null en los pagos manuales. */
  cuentaFlowId?: number | null;
  /** SPEC 07: lo que recibió el local de Flow (monto menos comisión). null si aún no se conoce. */
  montoNeto?: number | null;
  /** SPEC 07: suma de los reembolsos ya confirmados por Flow. */
  montoReembolsado?: number;
}

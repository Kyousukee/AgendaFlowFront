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
}

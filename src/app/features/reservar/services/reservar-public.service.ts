import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Empresa } from '../../../core/interfaces/empresa.interface';
import { Sucursal } from '../../../core/interfaces/sucursal.interface';
import { Servicio } from '../../../core/interfaces/servicio.interface';
import { Empleado } from '../../../core/interfaces/empleado.interface';
import { HorarioSucursal } from '../../admin/interfaces/horario-sucursal.interface';
import { BloqueoAgenda } from '../../../core/interfaces/bloqueo-agenda.interface';
import { ServicioEmpleado } from '../../../core/interfaces/servicio-empleado.interface';
import { environment } from '../../../../environments/environment';
import { CancelacionRealizada, CancelacionVista } from '../interfaces/cancelacion.interface';

interface BloqueoBackend {
  id: number;
  empleadoId?: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface OcupacionReserva {
  empleadoId?: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

/** SPEC 06: cobro creado en Flow. La hora queda retenida hasta `expiraEn` (15 minutos). */
export interface PagoIniciado {
  monto: number;
  urlPago: string;
  expiraEn: string;
}

export interface ReservaCreada {
  id: number;
  codigo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  precio: number;
  /** SPEC 06: Pendiente mientras se paga en Flow; Programada sin cobro. */
  estado?: 'Pendiente' | 'Programada';
  /** SPEC 06: fuente de verdad. null = sin cobro (confirmación de siempre). */
  pago?: PagoIniciado | null;
}

/** SPEC 06: GET /reservar/reservas/:codigo/pago. */
export interface EstadoPagoReserva {
  estadoReserva: string | null;
  /** Pendiente, Pagado o Rechazado. */
  estadoPago: string | null;
  monto: number;
  expiraEn: string | null;
}

export interface CrearReservaDto {
  empresaId: number;
  sucursalId: number;
  servicioId: number;
  empleadoId: number;
  fecha: string;
  horaInicio: string;
  observacion?: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  /** SPEC 06: solo se envía si el negocio deja elegir pagar en el local. */
  pagarAhora?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReservarPublicService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservar`;

  getEmpresaBySlug(slug: string): Observable<Empresa | undefined> {
    return this.http.get<Empresa>(`${this.apiUrl}/empresa-slug/${slug}`);
  }

  getSucursal(id: number): Observable<Sucursal | undefined> {
    return this.http.get<Sucursal>(`${this.apiUrl}/sucursal/${id}`);
  }

  getServiciosByEmpresa(empresaId: number): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.apiUrl}/servicios/${empresaId}`);
  }

  getEmpleadosBySucursal(sucursalId: number): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.apiUrl}/empleados/${sucursalId}`);
  }

  getHorariosBySucursal(sucursalId: number): Observable<HorarioSucursal[]> {
    return this.http.get<any[]>(`${this.apiUrl}/horarios/${sucursalId}`).pipe(
      map((items) =>
        items.map((item) => ({
          id: item.id,
          sucursalId: item.sucursalId ?? sucursalId,
          diaSemana: item.diaSemana ?? item.dia ?? 0,
          horaInicio: (item.horaInicio ?? '').substring(0, 5),
          horaFin: (item.horaFin ?? '').substring(0, 5),
          abierto: item.abierto ?? true,
        })),
      ),
    );
  }

  getBloqueosBySucursal(sucursalId: number): Observable<BloqueoAgenda[]> {
    return this.http.get<BloqueoBackend[]>(`${this.apiUrl}/bloqueos/${sucursalId}`).pipe(
      map((bloqueos) =>
        bloqueos.map((b) => ({
          id: b.id,
          empleadoId: b.empleadoId ?? 0,
          fecha: b.fecha,
          horaInicio: b.horaInicio.substring(0, 5),
          horaFin: b.horaFin.substring(0, 5),
        })),
      ),
    );
  }

  getServiciosEmpleados(sucursalId: number): Observable<ServicioEmpleado[]> {
    return this.http.get<any[]>(`${this.apiUrl}/servicios-empleados/${sucursalId}`).pipe(
      map((items) =>
        items.map((item) => ({
          id: item.id,
          servicioId: item.servicioId ?? item.servicio?.id ?? 0,
          empleadoId: item.empleadoId ?? item.empleado?.id ?? 0,
        })),
      ),
    );
  }

  getHorariosDisponibles(
    sucursalId: number,
    empleadoId: number,
    servicioId: number,
    fecha: string,
    servicios: Servicio[],
    horarios: HorarioSucursal[],
    bloqueos: BloqueoAgenda[],
    ocupacion: OcupacionReserva[] = [],
  ): Observable<string[]> {
    const servicio = servicios.find((s) => s.id === servicioId);
    if (!servicio) return of([]);

    const date = new Date(fecha + 'T12:00:00');
    const diaSemana = date.getDay() === 0 ? 7 : date.getDay();

    const horario = horarios.find(
      (h) => h.diaSemana === diaSemana && h.abierto,
    );
    if (!horario) return of([]);

    const bloqueosDelDia = bloqueos.filter(
      (b) => b.empleadoId === empleadoId && b.fecha === fecha,
    );

    const reservasDelDia = ocupacion.filter(
      (r) => r.empleadoId === empleadoId && r.fecha === fecha,
    );

    const horas: string[] = [];
    const [aperturaH, aperturaM] = horario.horaInicio.split(':').map(Number);
    const [cierreH, cierreM] = horario.horaFin.split(':').map(Number);
    const duracion = servicio.duracionMinutos;

    const ahora = new Date();
    const esHoy = fecha === `${ahora.getFullYear()}-${(ahora.getMonth() + 1).toString().padStart(2, '0')}-${ahora.getDate().toString().padStart(2, '0')}`;
    const minutosAhora = esHoy ? ahora.getHours() * 60 + ahora.getMinutes() : 0;

    let actual = aperturaH * 60 + aperturaM;
    const fin = cierreH * 60 + cierreM;

    while (actual + duracion <= fin) {
      if (actual > minutosAhora) {
        const h = Math.floor(actual / 60);
        const m = actual % 60;
        const horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

        const ocupadoPorBloqueo = bloqueosDelDia.some((b) => {
          const bInicio = this.timeToMinutes(b.horaInicio);
          const bFin = this.timeToMinutes(b.horaFin);
          return actual < bFin && actual + duracion > bInicio;
        });

        const ocupadoPorReserva = reservasDelDia.some((r) => {
          const rInicio = this.timeToMinutes(r.horaInicio);
          const rFin = this.timeToMinutes(r.horaFin);
          return actual < rFin && actual + duracion > rInicio;
        });

        if (!ocupadoPorBloqueo && !ocupadoPorReserva) {
          horas.push(horaStr);
        }
      }

      actual += 30;
    }

    return of(horas);
  }

  /** Horas tomadas de la sucursal. No incluye datos de clientes. */
  getOcupacion(sucursalId: number): Observable<OcupacionReserva[]> {
    return this.http.get<OcupacionReserva[]>(`${this.apiUrl}/ocupacion/${sucursalId}`).pipe(
      map((items) =>
        items.map((item) => ({
          ...item,
          horaInicio: (item.horaInicio ?? '').substring(0, 5),
          horaFin: (item.horaFin ?? '').substring(0, 5),
        })),
      ),
    );
  }

  crearReserva(data: CrearReservaDto): Observable<ReservaCreada> {
    return this.http.post<ReservaCreada>(this.apiUrl, data);
  }

  /** SPEC 06: resultado del pago online de una reserva. 404 si no existe o no tiene pago Flow. */
  getEstadoPago(codigo: string): Observable<EstadoPagoReserva> {
    return this.http.get<EstadoPagoReserva>(
      `${this.apiUrl}/reservas/${encodeURIComponent(codigo)}/pago`,
    );
  }

  /** SPEC 07: reserva y plazo del enlace de cancelación del correo. 404 si el token no existe. */
  getCancelacion(token: string): Observable<CancelacionVista> {
    return this.http.get<CancelacionVista>(
      `${this.apiUrl}/cancelacion/${encodeURIComponent(token)}`,
    );
  }

  /** SPEC 07: cancela la reserva y reembolsa el abono Flow, si lo hay. 409 con `motivo`, 502. */
  cancelarReserva(token: string): Observable<CancelacionRealizada> {
    return this.http.post<CancelacionRealizada>(
      `${this.apiUrl}/cancelacion/${encodeURIComponent(token)}`,
      {},
    );
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}

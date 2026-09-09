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
import { Reserva } from '../../../core/interfaces/reserva.interface';
import { environment } from '../../../../environments/environment';

interface BloqueoBackend {
  id: number;
  empleadoId?: number;
  empleado?: { id: number; nombre: string; apellido?: string };
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}

export interface CrearReservaDto {
  empresaId: number;
  sucursalId: number;
  servicioId: number;
  empleadoId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  precio: number;
  observacion?: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
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
          empleadoId: b.empleadoId ?? b.empleado?.id ?? 0,
          empleadoNombre: b.empleado
            ? [b.empleado.nombre, b.empleado.apellido].filter(Boolean).join(' ')
            : '',
          fecha: b.fecha,
          horaInicio: b.horaInicio.substring(0, 5),
          horaFin: b.horaFin.substring(0, 5),
          motivo: b.motivo,
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
    reservas: Reserva[] = [],
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

    const reservasDelDia = reservas.filter(
      (r) => r.empleado?.id === empleadoId && r.fecha === fecha,
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

  getReservasBySucursal(sucursalId: number): Observable<Reserva[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservas/${sucursalId}`).pipe(
      map((items) =>
        items.map((item) => ({
          id: item.id,
          codigo: item.codigo,
          empresa: item.empresa,
          sucursal: item.sucursal,
          cliente: item.cliente,
          empleado: item.empleado,
          servicio: item.servicio,
          fecha: item.fecha,
          horaInicio: (item.horaInicio ?? '').substring(0, 5),
          horaFin: (item.horaFin ?? '').substring(0, 5),
          precio: item.precio,
          observacion: item.observacion,
          fechaCreacion: item.fechaCreacion,
          estado: item.estado,
          pagos: item.pagos ?? [],
        })),
      ),
    );
  }

  crearReserva(data: CrearReservaDto): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, data);
  }

  actualizarEstadoReserva(reservaId: number, estadoId: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/reservas/${reservaId}/estado`, { estadoId });
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}

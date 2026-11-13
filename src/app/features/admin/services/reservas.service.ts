import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reserva } from '../../../core/interfaces/reserva.interface';
import {
  CrearReservaPanelDto,
  ProximaHoraResponse,
  ReservaPanelCreada,
} from '../../../core/interfaces/reserva-panel.interface';
import { environment } from '../../../../environments/environment';

/**
 * Reservas del panel: requieren sesión y solo devuelven las de la empresa del usuario.
 * SPEC 08: el recepcionista (rol 2) las usa sobre su sucursal.
 */
@Injectable({ providedIn: 'root' })
export class ReservasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservas`;

  getBySucursal(sucursalId: number): Observable<Reserva[]> {
    return this.http
      .get<Reserva[]>(this.apiUrl, { params: { sucursalId: sucursalId.toString() } })
      .pipe(
        map((reservas) =>
          reservas.map((reserva) => ({
            ...reserva,
            horaInicio: (reserva.horaInicio ?? '').substring(0, 5),
            horaFin: (reserva.horaFin ?? '').substring(0, 5),
            pagos: reserva.pagos ?? [],
          })),
        ),
      );
  }

  actualizarEstado(reservaId: number, estadoId: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${reservaId}/estado`, { estadoId });
  }

  /**
   * SPEC 08: primer hueco de cada barbero que ofrece el servicio, con su cola. `fecha` por
   * defecto es hoy en el negocio; no puede ser anterior a hoy (`400`).
   */
  proximaHora(
    sucursalId: number,
    servicioId: number,
    fecha?: string,
  ): Observable<ProximaHoraResponse> {
    const params: Record<string, string> = {
      sucursalId: sucursalId.toString(),
      servicioId: servicioId.toString(),
    };
    if (fecha) params['fecha'] = fecha;
    return this.http.get<ProximaHoraResponse>(`${this.apiUrl}/proxima-hora`, { params }).pipe(
      map((respuesta) => ({
        ...respuesta,
        empleados: respuesta.empleados.map((e) => ({
          ...e,
          horaInicio: e.horaInicio?.substring(0, 5) ?? null,
          horaFin: e.horaFin?.substring(0, 5) ?? null,
        })),
      })),
    );
  }

  /**
   * SPEC 08: reserva presencial o telefónica. No recalcula la hora: guarda la enviada o responde
   * `409` si se acaba de ocupar.
   */
  crearDesdePanel(datos: CrearReservaPanelDto): Observable<ReservaPanelCreada> {
    return this.http.post<ReservaPanelCreada>(this.apiUrl, datos);
  }
}

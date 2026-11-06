import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reserva } from '../../../core/interfaces/reserva.interface';
import { environment } from '../../../../environments/environment';

/** Reservas del panel: requieren sesión y solo devuelven las de la empresa del usuario. */
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
}

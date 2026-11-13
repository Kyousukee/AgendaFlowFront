import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ActualizarMiembroDto,
  InvitarMiembroDto,
  MiembroEquipo,
} from '../../../core/interfaces/equipo.interface';
import { environment } from '../../../../environments/environment';

/** SPEC 08: recepcionistas de la empresa. Solo el dueño (rol 1). */
@Injectable({ providedIn: 'root' })
export class EquipoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/equipo`;

  listar(): Observable<MiembroEquipo[]> {
    return this.http.get<MiembroEquipo[]>(this.apiUrl);
  }

  /** `409` si el email ya tiene cuenta; `403 SUSCRIPCION_LIMITE` en el plan Gratis. */
  invitar(datos: InvitarMiembroDto): Observable<MiembroEquipo> {
    return this.http.post<MiembroEquipo>(this.apiUrl, datos);
  }

  actualizar(id: number, cambios: ActualizarMiembroDto): Observable<MiembroEquipo> {
    return this.http.patch<MiembroEquipo>(`${this.apiUrl}/${id}`, cambios);
  }

  /** `204`. `429` si se reenvió hace menos de 1 minuto o más de 5 veces en una hora. */
  reenviarInvitacion(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reenviar-invitacion`, null);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BloqueoAgenda } from '../../../core/interfaces/bloqueo-agenda.interface';
import { environment } from '../../../../environments/environment';

export interface CreateBloqueoDto {
  empleadoId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}

@Injectable({ providedIn: 'root' })
export class BloqueosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bloqueos`;

  getBySucursal(): Observable<BloqueoAgenda[]> {
    return this.http.get<BloqueoAgenda[]>(this.apiUrl);
  }

  crear(bloqueo: CreateBloqueoDto): Observable<BloqueoAgenda> {
    return this.http.post<BloqueoAgenda>(this.apiUrl, bloqueo);
  }

  actualizar(id: number, data: CreateBloqueoDto): Observable<BloqueoAgenda> {
    return this.http.put<BloqueoAgenda>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

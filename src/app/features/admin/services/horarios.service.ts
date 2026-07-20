import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HorarioSucursal } from '../interfaces/horario-sucursal.interface';
import { environment } from '../../../../environments/environment';

const HORARIOS_POR_DEFECTO: HorarioSucursal[] = [
  { id: 0, sucursalId: 0, diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 0, sucursalId: 0, diaSemana: 2, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 0, sucursalId: 0, diaSemana: 3, horaInicio: '09:00', horaFin: '18:00', abierto: true },
  { id: 0, sucursalId: 0, diaSemana: 4, horaInicio: '09:00', horaFin: '19:00', abierto: true },
  { id: 0, sucursalId: 0, diaSemana: 5, horaInicio: '09:00', horaFin: '20:00', abierto: true },
  { id: 0, sucursalId: 0, diaSemana: 6, horaInicio: '10:00', horaFin: '15:00', abierto: true },
  { id: 0, sucursalId: 0, diaSemana: 7, horaInicio: '09:00', horaFin: '14:00', abierto: false },
];

@Injectable({ providedIn: 'root' })
export class HorariosService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getBySucursal(sucursalId: number): Observable<HorarioSucursal[]> {
    return this.http.get<HorarioSucursal[]>(`${this.apiUrl}/sucursales/${sucursalId}/horarios`).pipe(
      map((horarios) =>
        horarios.length > 0 ? horarios : HORARIOS_POR_DEFECTO.map((h) => ({ ...h, sucursalId })),
      ),
      catchError(() => of(HORARIOS_POR_DEFECTO.map((h) => ({ ...h, sucursalId })))),
    );
  }

  saveAll(sucursalId: number, horarios: Omit<HorarioSucursal, 'id' | 'sucursalId'>[]): Observable<HorarioSucursal[]> {
    console.log(`${this.apiUrl}/sucursales/${sucursalId}/horarios`);
    console.log(horarios);
    return this.http
      .post<HorarioSucursal[]>(`${this.apiUrl}/sucursales/${sucursalId}/horarios`, { horarios })
      .pipe(catchError(() => of([])));
  }
}

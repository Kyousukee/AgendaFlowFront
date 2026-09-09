import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

/**
 * Postgres devuelve las columnas TIME como "09:00:00", pero el desplegable de
 * la pantalla tiene opciones "09:00": sin recortar los segundos, el valor no
 * coincide con ningun <option> y el select aparece vacio.
 */
const aHoraCorta = (hora: string): string => (hora ?? '').slice(0, 5);

@Injectable({ providedIn: 'root' })
export class HorariosService {
  private http = inject(HttpClient);

  getBySucursal(sucursalId: number): Observable<HorarioSucursal[]> {
    return this.http
      .get<HorarioSucursal[]>(
        `${environment.apiUrl}/sucursales/${sucursalId}/horarios`,
      )
      .pipe(
        map((horarios) =>
          horarios.length > 0
            ? horarios.map((h) => ({
                ...h,
                horaInicio: aHoraCorta(h.horaInicio),
                horaFin: aHoraCorta(h.horaFin),
              }))
            : HORARIOS_POR_DEFECTO.map((h) => ({ ...h, sucursalId })),
        ),
      );
  }

  saveAll(
    sucursalId: number,
    horarios: HorarioSucursal[],
  ): Observable<HorarioSucursal[]> {
    // El backend valida con forbidNonWhitelisted: mandar id o sucursalId
    // dentro de cada horario devolveria 400. Solo van los cuatro campos
    // que declara CreateHorarioDto.
    const body = {
      horarios: horarios.map(({ diaSemana, horaInicio, horaFin, abierto }) => ({
        diaSemana,
        horaInicio,
        horaFin,
        abierto,
      })),
    };

    // POST y no PUT: el endpoint de lote borra los horarios de la sucursal y
    // vuelve a insertarlos.
    return this.http.post<HorarioSucursal[]>(
      `${environment.apiUrl}/sucursales/${sucursalId}/horarios`,
      body,
    );
  }
}

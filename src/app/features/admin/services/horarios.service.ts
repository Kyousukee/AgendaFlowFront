import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HorarioSucursal } from '../interfaces/horario-sucursal.interface';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HorariosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/horarios`;

  getBySucursal(sucursalId: number): Observable<HorarioSucursal[]> {
    return this.http.get<HorarioSucursal[]>(`${this.apiUrl}/sucursal/${sucursalId}`);
  }

  saveAll(sucursalId: number, horarios: HorarioSucursal[]): Observable<HorarioSucursal[]> {
    return this.http.put<HorarioSucursal[]>(`${this.apiUrl}/sucursal/${sucursalId}`, { horarios });
  }
}

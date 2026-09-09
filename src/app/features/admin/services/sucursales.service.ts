import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sucursal } from '../../../core/interfaces/sucursal.interface';
import { environment } from '../../../../environments/environment';

export interface CreateSucursalRequest {
  nombre: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
  pais?: string;
  latitud?: number | null;
  longitud?: number | null;
  telefono?: string;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SucursalesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sucursales`;

  getAll(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(this.apiUrl);
  }

  crear(data: CreateSucursalRequest): Observable<Sucursal> {
    return this.http.post<Sucursal>(this.apiUrl, data);
  }

  actualizar(id: number, data: Partial<CreateSucursalRequest>): Observable<Sucursal> {
    return this.http.put<Sucursal>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

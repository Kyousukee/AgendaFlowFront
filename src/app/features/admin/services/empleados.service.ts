import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empleado } from '../../../core/interfaces/empleado.interface';
import { environment } from '../../../../environments/environment';

export interface CreateEmpleadoDto {
  sucursalId: number;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  servicioIds?: number[];
  activo: boolean;
}

export interface UpdateEmpleadoDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  servicioIds?: number[];
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmpleadosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/empleados`;

  getBySucursal(sucursalId: number): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.apiUrl);
  }

  crear(empleado: CreateEmpleadoDto): Observable<Empleado> {
    return this.http.post<Empleado>(this.apiUrl, empleado);
  }

  actualizar(id: number, data: UpdateEmpleadoDto): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

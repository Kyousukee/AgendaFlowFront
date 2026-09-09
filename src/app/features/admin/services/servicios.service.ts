import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servicio } from '../../../core/interfaces/servicio.interface';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/servicios`;

  getByEmpresa(empresaId: number): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.apiUrl);
  }

  crear(servicio: Omit<Servicio, 'id' | 'fechaCreacion'>): Observable<Servicio> {
    console.log('Creando servicio:', servicio);
    return this.http.post<Servicio>(this.apiUrl, servicio);
  }

  actualizar(id: number, data: Partial<Omit<Servicio, 'id' | 'empresaId' | 'fechaCreacion'>>): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

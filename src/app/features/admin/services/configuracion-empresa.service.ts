import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfiguracionEmpresa } from '../../../core/interfaces/configuracion-empresa.interface';
import { environment } from '../../../../environments/environment';

export type SaveConfigDto = Omit<ConfiguracionEmpresa, 'id' | 'empresaId'>;

@Injectable({ providedIn: 'root' })
export class ConfiguracionEmpresaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/configuracion-empresa`;

  obtener(): Observable<ConfiguracionEmpresa> {
    return this.http.get<ConfiguracionEmpresa>(this.apiUrl);
  }

  crear(data: SaveConfigDto): Observable<ConfiguracionEmpresa> {
    return this.http.post<ConfiguracionEmpresa>(this.apiUrl, data);
  }

  actualizar(data: SaveConfigDto): Observable<ConfiguracionEmpresa> {
    return this.http.put<ConfiguracionEmpresa>(this.apiUrl, data);
  }
}

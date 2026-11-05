import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ConfiguracionEmpresa,
  EmpresaLogoResponse,
} from '../../../core/interfaces/configuracion-empresa.interface';
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

  /**
   * Sube o reemplaza el logo. Con FormData, HttpClient no fija Content-Type y el navegador
   * genera el multipart con su boundary.
   */
  uploadEmpresaLogo(file: File): Observable<EmpresaLogoResponse> {
    const body = new FormData();
    body.append('logo', file);
    return this.http.post<EmpresaLogoResponse>(`${this.apiUrl}/logo`, body);
  }

  deleteEmpresaLogo(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/logo`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estado } from '../../../core/interfaces/estado.interface';
import { Pago } from '../../../core/interfaces/pago.interface';
import { environment } from '../../../../environments/environment';

export interface CrearPagoDto {
  reservaId: number;
  monto: number;
  metodoPago: string;
  codigoTransaccion: string;
  fechaPago: string;
}

@Injectable({ providedIn: 'root' })
export class PagosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pagos`;

  /** Los IDs dependen de la base, así que el catálogo se pide a la API. */
  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.apiUrl}/estados`);
  }

  getBySucursal(sucursalId: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.apiUrl, {
      params: { sucursalId: sucursalId.toString() },
    });
  }

  getById(id: number): Observable<Pago | undefined> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`);
  }

  crear(data: CrearPagoDto): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, data);
  }

  actualizarEstado(pagoId: number, estadoId: number): Observable<Pago> {
    return this.http.patch<Pago>(`${this.apiUrl}/${pagoId}/estado`, { estadoId });
  }
}

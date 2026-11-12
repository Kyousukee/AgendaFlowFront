import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estado } from '../../../core/interfaces/estado.interface';
import { Pago } from '../../../core/interfaces/pago.interface';
import {
  ReembolsoHistorial,
  ReembolsoSolicitado,
  SolicitarReembolsoDto,
} from '../../../core/interfaces/reembolso.interface';
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

  /** Solo pagos manuales: en los de Flow, el back rechaza `Reembolsado` (SPEC 07). */
  actualizarEstado(pagoId: number, estadoId: number): Observable<Pago> {
    return this.http.patch<Pago>(`${this.apiUrl}/${pagoId}/estado`, { estadoId });
  }

  /** SPEC 07: reembolso total o parcial de un abono Flow `Pagado`. */
  reembolsar(pagoId: number, data: SolicitarReembolsoDto): Observable<ReembolsoSolicitado> {
    return this.http.post<ReembolsoSolicitado>(`${this.apiUrl}/${pagoId}/reembolso`, data);
  }

  /** SPEC 07: historial de reembolsos del pago. El back refresca antes los pendientes. */
  getReembolsos(pagoId: number): Observable<ReembolsoHistorial[]> {
    return this.http.get<ReembolsoHistorial[]>(`${this.apiUrl}/${pagoId}/reembolsos`);
  }
}

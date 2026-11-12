import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ReservaResumen } from '../interfaces/reserva-resumen.interface';

const PREFIJO = 'agendaflow_reserva_pago_';

/**
 * SPEC 06: lo que la página /reserva/pago necesita y la API no devuelve (qué se reservó y a qué
 * página volver). Se guarda antes de ir a Flow y vive solo en esta pestaña. No incluye datos
 * del cliente.
 */
export interface ContextoPagoReserva {
  resumen: ReservaResumen;
  empresaSlug: string;
  sucursalId: number;
  empresaNombre: string;
  sucursalNombre: string;
  direccion: string;
}

@Injectable({ providedIn: 'root' })
export class ReservaPagoContextoService {
  private platformId = inject(PLATFORM_ID);

  guardar(contexto: ContextoPagoReserva): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      sessionStorage.setItem(PREFIJO + contexto.resumen.codigo, JSON.stringify(contexto));
    } catch {
      // Sin almacenamiento (modo privado o lleno): la página de resultado funciona sin el detalle.
    }
  }

  leer(codigo: string): ContextoPagoReserva | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const guardado = sessionStorage.getItem(PREFIJO + codigo);
      return guardado ? (JSON.parse(guardado) as ContextoPagoReserva) : null;
    } catch {
      return null;
    }
  }
}

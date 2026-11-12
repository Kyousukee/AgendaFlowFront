import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { PagoMensualidad, PagoMensualidadIniciado } from '../interfaces/suscripcion.interface';
import { environment } from '../../../environments/environment';

/** Precio que muestra el botón. El back cobra su propia constante (PRECIO_PRO_CLP). */
export const PRECIO_PRO_TEXTO = '$19.990';
export const DIAS_POR_PAGO = 30;

/**
 * SPEC 06: mensualidad Pro cobrada con Flow. El front nunca llama a Flow: pide al back la URL
 * de pago y redirige. Lo usan Configuración, el banner de vencimiento y /suscripcion/pago.
 */
@Injectable({ providedIn: 'root' })
export class PagoSuscripcionService {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${environment.apiUrl}/suscripcion`;

  /** Mientras se crea el cobro (y mientras el navegador se va a Flow). */
  pagando = signal(false);
  /** false después de un 503: el back no tiene configurada la cuenta Flow de AgendaFlow. */
  pagosDisponibles = signal(true);

  historial(): Observable<PagoMensualidad[]> {
    return this.http.get<PagoMensualidad[]>(`${this.apiUrl}/pagos`);
  }

  pagar(): void {
    if (this.pagando() || !this.pagosDisponibles()) return;

    this.pagando.set(true);
    this.http.post<PagoMensualidadIniciado>(`${this.apiUrl}/pagar`, {}).subscribe({
      next: ({ urlPago }) => {
        // `pagando` queda en true: el botón no se vuelve a habilitar mientras la página se va.
        if (isPlatformBrowser(this.platformId)) {
          window.location.href = urlPago;
        }
      },
      error: (error: unknown) => {
        this.pagando.set(false);
        this.snackBar.open(this.mensajeError(error), 'Cerrar', { duration: 6000 });
      },
    });
  }

  private mensajeError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No pudimos iniciar el pago. Inténtalo de nuevo.';
    }
    switch (error.status) {
      case 409:
        return 'Tu plan Pro no tiene vencimiento';
      case 503:
        this.pagosDisponibles.set(false);
        return 'Pagos no disponibles por ahora';
      case 502:
        return 'No pudimos conectar con Flow, inténtalo de nuevo';
      case 0:
        return 'No se pudo conectar con el servidor.';
      default:
        return 'No pudimos iniciar el pago. Inténtalo de nuevo.';
    }
  }
}

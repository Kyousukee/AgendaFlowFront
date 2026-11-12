import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RecursoLimitado, Suscripcion } from '../interfaces/suscripcion.interface';
import { environment } from '../../../environments/environment';

const AVISO_CERRADO_KEY = 'agendaflow_aviso_suscripcion_cerrado';

/** SPEC 06: el aviso del back termina en "Contáctanos ...". Ese texto lo reemplaza el botón de pago. */
const CONTACTANOS = /\s*Contáctanos[^.]*\.?\s*$/;

@Injectable({ providedIn: 'root' })
export class SuscripcionService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  suscripcion = signal<Suscripcion | null>(null);
  avisoCerrado = signal<boolean>(this.leerAvisoCerrado());

  mostrarAviso = computed(() => this.suscripcion()?.aviso != null && !this.avisoCerrado());

  /** Texto del aviso sin el "Contáctanos ..." final. */
  avisoTexto = computed(() => (this.suscripcion()?.aviso ?? '').replace(CONTACTANOS, ''));

  /** SPEC 06: se puede pagar la mensualidad salvo con Pro sin vencimiento. */
  puedePagarPro = computed(() => {
    const s = this.suscripcion();
    return !!s && !(s.plan === 'Pro' && s.sinVencimiento);
  });

  etiquetaPlan = computed<string | null>(() => {
    const s = this.suscripcion();
    if (!s) {
      return null;
    }
    if (s.plan === 'Gratis' || s.sinVencimiento || s.diasRestantes === null) {
      return s.plan;
    }
    const dias = s.diasRestantes <= 0 ? 'vence hoy' : `${s.diasRestantes} días`;
    return `${s.plan} · ${dias}`;
  });

  limiteAlcanzado(recurso: RecursoLimitado): boolean {
    const s = this.suscripcion();
    if (!s) {
      return false;
    }
    const limite = s.limites[recurso];
    return limite !== null && s.uso[recurso] >= limite;
  }

  cargar(): void {
    this.recargar().subscribe({
      error: (error) => console.error('No se pudo cargar la suscripción', error),
    });
  }

  /** Como `cargar`, pero devuelve la respuesta (para reconsultar después de un pago). */
  recargar(): Observable<Suscripcion> {
    return this.http
      .get<Suscripcion>(`${environment.apiUrl}/suscripcion`)
      .pipe(tap((data) => this.suscripcion.set(data)));
  }

  cerrarAviso(): void {
    this.avisoCerrado.set(true);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(AVISO_CERRADO_KEY, 'true');
    }
  }

  limpiar(): void {
    this.suscripcion.set(null);
    this.avisoCerrado.set(false);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(AVISO_CERRADO_KEY);
    }
  }

  private leerAvisoCerrado(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return sessionStorage.getItem(AVISO_CERRADO_KEY) === 'true';
  }
}

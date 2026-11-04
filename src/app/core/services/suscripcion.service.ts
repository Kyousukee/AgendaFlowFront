import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RecursoLimitado, Suscripcion } from '../interfaces/suscripcion.interface';
import { environment } from '../../../environments/environment';

const AVISO_CERRADO_KEY = 'agendaflow_aviso_suscripcion_cerrado';

@Injectable({ providedIn: 'root' })
export class SuscripcionService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  suscripcion = signal<Suscripcion | null>(null);
  avisoCerrado = signal<boolean>(this.leerAvisoCerrado());

  mostrarAviso = computed(() => this.suscripcion()?.aviso != null && !this.avisoCerrado());

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
    this.http.get<Suscripcion>(`${environment.apiUrl}/suscripcion`).subscribe({
      next: (data) => this.suscripcion.set(data),
      error: (error) => console.error('No se pudo cargar la suscripción', error),
    });
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

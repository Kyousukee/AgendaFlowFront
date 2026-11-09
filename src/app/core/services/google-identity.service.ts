import { DOCUMENT, Injectable, NgZone, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { GoogleAccountsId, GoogleButtonOptions } from '../interfaces/google-identity.interface';

const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

/**
 * Carga Google Identity Services una sola vez y dibuja el botón "Continuar con Google".
 * El `credential` se entrega al último botón dibujado (solo hay uno por página).
 */
@Injectable({ providedIn: 'root' })
export class GoogleIdentityService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private zone = inject(NgZone);

  private carga: Promise<GoogleAccountsId> | null = null;
  private alRecibir: ((credential: string) => void) | null = null;
  private deshabilitado = signal(false);

  /** `false` sin client ID, si el script no cargó o si la API respondió 503. */
  readonly disponible = computed(
    () =>
      !!environment.GOOGLE_CLIENT_ID && isPlatformBrowser(this.platformId) && !this.deshabilitado(),
  );

  /** Oculta el botón en toda la app (p. ej. la API respondió 503: Google no está habilitado). */
  deshabilitar(): void {
    this.deshabilitado.set(true);
  }

  async renderizarBoton(
    elemento: HTMLElement,
    opciones: GoogleButtonOptions,
    alRecibir: (credential: string) => void,
  ): Promise<void> {
    const id = await this.cargar();
    this.alRecibir = alRecibir;
    id.renderButton(elemento, opciones);
  }

  /** Deja de entregar el `credential` a un botón que ya no está en pantalla. */
  soltar(alRecibir: (credential: string) => void): void {
    if (this.alRecibir === alRecibir) {
      this.alRecibir = null;
    }
  }

  private cargar(): Promise<GoogleAccountsId> {
    if (!this.disponible()) {
      return Promise.reject(new Error('Google Identity Services no está disponible'));
    }
    this.carga ??= new Promise<GoogleAccountsId>((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = GSI_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        const id = this.document.defaultView?.google?.accounts?.id;
        if (!id) {
          reject(new Error('Google Identity Services no se inicializó'));
          return;
        }
        id.initialize({
          client_id: environment.GOOGLE_CLIENT_ID,
          callback: ({ credential }) => this.zone.run(() => this.alRecibir?.(credential)),
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
          itp_support: true,
          use_fedcm_for_button: true,
        });
        resolve(id);
      };
      script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
      this.document.head.appendChild(script);
    }).catch((error: unknown) => {
      // Sin el script (bloqueador, sin red, CSP) el botón no se puede mostrar.
      this.deshabilitar();
      throw error;
    });
    return this.carga;
  }
}

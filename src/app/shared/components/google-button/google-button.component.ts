import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { GoogleButtonText } from '../../../core/interfaces/google-identity.interface';
import { GoogleIdentityService } from '../../../core/services/google-identity.service';

/** Ancho máximo que acepta el botón de Google. */
const ANCHO_MAXIMO = 400;
const ANCHO_MINIMO = 200;

/**
 * Botón oficial "Continuar con Google" (Google Identity Services). Se dibuja solo en el navegador.
 * Emite el `credential` (JWT de Google) o `noDisponible` si el script no se pudo cargar.
 */
@Component({
  selector: 'app-google-button',
  standalone: true,
  template: `<div #contenedor class="google-button"></div>`,
  styleUrl: './google-button.component.scss',
})
export class GoogleButtonComponent {
  private google = inject(GoogleIdentityService);

  texto = input<GoogleButtonText>('continue_with');
  credential = output<string>();
  noDisponible = output<void>();

  private contenedor = viewChild.required<ElementRef<HTMLElement>>('contenedor');
  private destruido = false;
  private readonly alRecibir = (credential: string): void => {
    if (!this.destruido) this.credential.emit(credential);
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destruido = true;
      this.google.soltar(this.alRecibir);
    });
    afterNextRender(() => this.renderizar());
  }

  private renderizar(): void {
    const elemento = this.contenedor().nativeElement;
    const ancho = Math.min(ANCHO_MAXIMO, Math.max(ANCHO_MINIMO, Math.floor(elemento.clientWidth)));
    this.google
      .renderizarBoton(
        elemento,
        {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: this.texto(),
          shape: 'rectangular',
          logo_alignment: 'center',
          width: ancho,
          locale: 'es',
        },
        this.alRecibir,
      )
      .catch(() => {
        if (!this.destruido) this.noDisponible.emit();
      });
  }
}

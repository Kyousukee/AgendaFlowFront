import { Component, inject, input, output, signal } from '@angular/core';
import { ErrorAutenticacion } from '../../../../core/errors/error-autenticacion';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleIdentityService } from '../../../../core/services/google-identity.service';
import { GoogleButtonComponent } from '../../../../shared/components/google-button/google-button.component';

/**
 * "Continuar con Google": dibuja el botón, envía el `credential` a la API y avisa a la página
 * para que muestre el error en su propio aviso. Mientras valida, el botón se oculta; si falla
 * vuelve a aparecer (un 503 lo oculta en toda la app).
 */
@Component({
  selector: 'app-acceso-google',
  standalone: true,
  imports: [GoogleButtonComponent],
  templateUrl: './acceso-google.component.html',
  styleUrl: './acceso-google.component.scss',
})
export class AccesoGoogleComponent {
  private auth = inject(AuthService);
  protected google = inject(GoogleIdentityService);

  /** Texto del separador bajo el botón; `null` lo quita. */
  separador = input<string | null>('o con tu correo');

  /** Se envió un `credential`: la página limpia sus avisos. */
  inicio = output<void>();
  /** La API aceptó el `credential` (inició sesión o dejó el registro pendiente). */
  listo = output<void>();
  error = output<ErrorAutenticacion>();

  validando = signal(false);

  onCredential(credential: string): void {
    if (this.validando()) return;
    this.inicio.emit();
    this.validando.set(true);
    this.auth.continuarConGoogle(credential).subscribe({
      next: () => {
        this.validando.set(false);
        this.listo.emit();
      },
      error: (err: ErrorAutenticacion) => {
        this.validando.set(false);
        this.error.emit(err);
      },
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleIdentityService } from '../../../../core/services/google-identity.service';
import { ErrorAutenticacion } from '../../../../core/errors/error-autenticacion';
import { AccesoGoogleComponent } from '../../components/acceso-google/acceso-google.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, AccesoGoogleComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  protected google = inject(GoogleIdentityService);

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  /** Login normal rechazado: puede ser una cuenta creada con Google, que no tiene contraseña. */
  sugerirAlternativas = signal(false);
  contrasenaRestablecida = signal(this.route.snapshot.queryParamMap.get('restablecida') === '1');
  /** SPEC 08: la API respondió 401 con la sesión abierta (vencida, desactivada o movida). */
  sesionTerminada = signal(this.route.snapshot.queryParamMap.get('sesion') === 'terminada');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  limpiarAvisos(): void {
    this.errorMessage.set('');
    this.sugerirAlternativas.set(false);
    this.contrasenaRestablecida.set(false);
    this.sesionTerminada.set(false);
  }

  onGoogleError(err: ErrorAutenticacion): void {
    this.errorMessage.set(err.message);
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.valid && !this.isLoading()) {
      this.limpiarAvisos();
      this.isLoading.set(true);

      const { email, password } = this.form.getRawValue();

      this.auth.login(email, password).subscribe({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err: ErrorAutenticacion) => {
          this.errorMessage.set(err.message);
          this.sugerirAlternativas.set(err.status === 401);
          this.isLoading.set(false);
        },
      });
    }
  }
}

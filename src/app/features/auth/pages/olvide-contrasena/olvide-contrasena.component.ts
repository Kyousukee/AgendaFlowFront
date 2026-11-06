import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CuentaService, mensajeErrorCuenta } from '../../../../core/services/cuenta.service';

@Component({
  selector: 'app-olvide-contrasena',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './olvide-contrasena.component.html',
  styleUrl: './olvide-contrasena.component.scss',
})
export class OlvideContrasenaComponent {
  private fb = inject(FormBuilder);
  private cuenta = inject(CuentaService);

  isLoading = signal(false);
  errorMessage = signal('');
  mensajeEnviado = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
  });

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading()) return;

    this.errorMessage.set('');
    this.isLoading.set(true);

    this.cuenta.olvideContrasena(this.form.getRawValue().email).subscribe({
      next: ({ message }) => {
        this.isLoading.set(false);
        this.mensajeEnviado.set(message);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        // El validador del navegador acepta correos como "a@b" que la API rechaza con 400.
        this.errorMessage.set(
          error.status === 400
            ? 'Escribe un correo válido, como nombre@correo.cl.'
            : mensajeErrorCuenta(error),
        );
      },
    });
  }
}

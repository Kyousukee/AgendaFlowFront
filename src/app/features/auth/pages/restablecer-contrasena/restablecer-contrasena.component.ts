import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { CuentaService, mensajeErrorCuenta } from '../../../../core/services/cuenta.service';

const MENSAJE_ENLACE_INVALIDO = 'El enlace no es válido o venció';

function contrasenasCoinciden(grupo: AbstractControl): ValidationErrors | null {
  return grupo.get('password')?.value === grupo.get('confirmPassword')?.value
    ? null
    : { noCoinciden: true };
}

@Component({
  selector: 'app-restablecer-contrasena',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './restablecer-contrasena.component.html',
  styleUrl: './restablecer-contrasena.component.scss',
})
export class RestablecerContrasenaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private cuenta = inject(CuentaService);

  /** Solo en memoria: no se guarda en el almacenamiento del navegador ni se registra. */
  private token: string | null = null;

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  enlaceInvalido = signal('');

  form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: contrasenasCoinciden },
  );

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.token = params.get('token');

    if (params.has('token')) {
      this.router.navigate([], { queryParams: {}, replaceUrl: true });
    }
    if (!this.token) {
      this.enlaceInvalido.set(MENSAJE_ENLACE_INVALIDO);
    }
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading() || !this.token) return;

    this.errorMessage.set('');
    this.isLoading.set(true);

    this.cuenta.restablecerContrasena(this.token, this.form.getRawValue().password).subscribe({
      next: () => {
        // logout(false): esta navegación lleva el aviso y no debe competir con la de logout().
        this.auth.logout(false);
        this.router.navigate(['/login'], { queryParams: { restablecida: '1' } });
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (error.status !== 400) {
          this.errorMessage.set(mensajeErrorCuenta(error));
          return;
        }
        // La API responde con un texto si el enlace falla, y con una lista si falla la validación.
        const mensaje: unknown = error.error?.message;
        if (Array.isArray(mensaje) && mensaje.every((m) => String(m).startsWith('password'))) {
          this.errorMessage.set('La contraseña debe tener entre 8 y 72 caracteres.');
          return;
        }
        this.token = null;
        this.enlaceInvalido.set(typeof mensaje === 'string' ? mensaje : MENSAJE_ENLACE_INVALIDO);
      },
    });
  }
}

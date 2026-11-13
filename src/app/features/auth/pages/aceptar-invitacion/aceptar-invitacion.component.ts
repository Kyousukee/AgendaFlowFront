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
import { InvitacionVista } from '../../../../core/interfaces/cuenta.interface';

const MENSAJE_ENLACE_INVALIDO =
  'El enlace no es válido o expiró. Pide al dueño que te reenvíe la invitación';

function contrasenasCoinciden(grupo: AbstractControl): ValidationErrors | null {
  return grupo.get('password')?.value === grupo.get('confirmPassword')?.value
    ? null
    : { noCoinciden: true };
}

/**
 * SPEC 08: el recepcionista llega desde el correo de invitación, define su contraseña (mismas
 * reglas que restablecer contraseña) y entra directo a la agenda.
 */
@Component({
  selector: 'app-aceptar-invitacion',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './aceptar-invitacion.component.html',
  styleUrl: './aceptar-invitacion.component.scss',
})
export class AceptarInvitacionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private cuenta = inject(CuentaService);

  /** Solo en memoria: no se guarda en el almacenamiento del navegador ni se registra. */
  private token: string | null = null;

  cargando = signal(true);
  invitacion = signal<InvitacionVista | null>(null);
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
      this.invalidar();
      return;
    }

    this.cuenta.getInvitacion(this.token).subscribe({
      next: (invitacion) => {
        this.invitacion.set(invitacion);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400 || error.status === 404) {
          this.invalidar();
        } else {
          this.cargando.set(false);
          this.errorMessage.set(mensajeErrorCuenta(error));
        }
      },
    });
  }

  /** "{empresa} — {sucursal}", sin los que el back no informe. */
  destino(invitacion: InvitacionVista): string {
    return [invitacion.empresa, invitacion.sucursal].filter(Boolean).join(' — ') || 'el equipo';
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading() || !this.token) return;

    this.errorMessage.set('');
    this.isLoading.set(true);

    // La respuesta es la del login: AuthService guarda la sesión y lleva a la agenda.
    this.auth.aceptarInvitacion(this.token, this.form.getRawValue().password).subscribe({
      next: () => {
        // El login del recepcionista no trae el nombre del negocio; la invitación sí.
        const empresa = this.invitacion()?.empresa;
        if (empresa) this.auth.actualizarEmpresa({ nombre: empresa });
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
        this.invalidar();
      },
    });
  }

  private invalidar(): void {
    this.token = null;
    this.cargando.set(false);
    this.enlaceInvalido.set(MENSAJE_ENLACE_INVALIDO);
  }
}

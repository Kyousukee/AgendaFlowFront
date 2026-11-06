import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CuentaService, mensajeErrorCuenta } from '../../../../core/services/cuenta.service';

type EstadoVerificacion = 'verificando' | 'exito' | 'invalido' | 'error';

@Component({
  selector: 'app-verificar-email',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verificar-email.component.html',
  styleUrl: './verificar-email.component.scss',
})
export class VerificarEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cuenta = inject(CuentaService);
  auth = inject(AuthService);

  estado = signal<EstadoVerificacion>('verificando');
  mensajeError = signal('');

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const token = params.get('token');

    if (params.has('token')) {
      this.router.navigate([], { queryParams: {}, replaceUrl: true });
    }
    if (!token) {
      this.estado.set('invalido');
      return;
    }

    this.cuenta.verificarEmail(token).subscribe({
      next: () => {
        this.auth.actualizarEmailVerificado(true);
        this.estado.set('exito');
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.estado.set('invalido');
        } else {
          // Un 429 o una caída de conexión no dicen nada del enlace: sigue sirviendo.
          this.mensajeError.set(mensajeErrorCuenta(error));
          this.estado.set('error');
        }
      },
    });
  }
}

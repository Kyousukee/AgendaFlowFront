import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, catchError, forkJoin, of, switchMap, take, timer } from 'rxjs';
import { SuscripcionService } from '../../../../core/services/suscripcion.service';
import { PagoSuscripcionService } from '../../../../core/services/pago-suscripcion.service';
import { ResultadoPagoMensualidad } from '../../../../core/interfaces/suscripcion.interface';

const INTERVALO_MS = 5000;
const ESPERA_MAXIMA_MS = 60_000;
const VOLVER_AL_PANEL_MS = 4000;

type Vista = ResultadoPagoMensualidad | 'sin-confirmar' | 'desconocido';

/**
 * SPEC 06: el back redirige aquí al volver de Flow con `?estado=pagado|rechazado|pendiente`.
 * Pendiente: reconsulta la suscripción cada 5 s, hasta 1 minuto.
 */
@Component({
  selector: 'app-suscripcion-pago',
  standalone: true,
  imports: [RouterLink, MatIconModule, DatePipe],
  templateUrl: './suscripcion-pago.component.html',
  styleUrl: './suscripcion-pago.component.scss',
})
export class SuscripcionPagoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  suscripcion = inject(SuscripcionService);
  pagoSuscripcion = inject(PagoSuscripcionService);

  vista = signal<Vista>('pendiente');
  private sondeo: Subscription | null = null;

  ngOnInit(): void {
    const estado = this.route.snapshot.queryParamMap.get('estado');
    switch (estado) {
      case 'pagado':
        this.confirmado();
        break;
      case 'rechazado':
        this.vista.set('rechazado');
        break;
      case 'pendiente':
        this.vista.set('pendiente');
        this.esperarConfirmacion();
        break;
      default:
        this.vista.set('desconocido');
    }
  }

  reintentar(): void {
    this.pagoSuscripcion.pagar();
  }

  private confirmado(): void {
    this.vista.set('pagado');
    this.suscripcion.cargar();
    timer(VOLVER_AL_PANEL_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.router.navigate(['/admin/configuracion']));
  }

  /**
   * Cada consulta trae la suscripción (GET /suscripcion) y el último pago de la mensualidad,
   * que dice si Flow ya confirmó. Se detiene al confirmarse, al rechazarse o al minuto.
   */
  private esperarConfirmacion(): void {
    const intentos = ESPERA_MAXIMA_MS / INTERVALO_MS;
    this.sondeo = timer(INTERVALO_MS, INTERVALO_MS)
      .pipe(
        take(intentos),
        switchMap(() =>
          forkJoin({
            suscripcion: this.suscripcion.recargar().pipe(catchError(() => of(null))),
            pagos: this.pagoSuscripcion.historial().pipe(catchError(() => of([]))),
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ pagos }) => {
          const estado = pagos[0]?.estado?.nombre;
          if (estado === 'Pagado') {
            this.detenerSondeo();
            this.confirmado();
          } else if (estado === 'Rechazado' || estado === 'Anulado') {
            this.detenerSondeo();
            this.vista.set('rechazado');
          }
        },
        complete: () => {
          if (this.vista() === 'pendiente') this.vista.set('sin-confirmar');
        },
      });
  }

  private detenerSondeo(): void {
    this.sondeo?.unsubscribe();
    this.sondeo = null;
  }
}

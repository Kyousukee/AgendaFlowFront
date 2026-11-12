import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { ReservarPublicService } from '../../services/reservar-public.service';
import {
  ContextoPagoReserva,
  ReservaPagoContextoService,
} from '../../services/reserva-pago-contexto.service';
import { ReservarConfirmacionComponent } from '../../components/reservar-confirmacion/reservar-confirmacion.component';

const INTERVALO_MS = 3000;
const ESPERA_MAXIMA_MS = 60_000;

type Vista =
  'cargando' | 'pagado' | 'rechazado' | 'pendiente' | 'sin-confirmar' | 'no-encontrada' | 'error';

/**
 * SPEC 06: el back redirige aquí al volver de Flow con `?codigo=` (UUID de la reserva).
 * Pendiente: reconsulta cada 3 s, hasta 1 minuto.
 */
@Component({
  selector: 'app-reserva-pago',
  standalone: true,
  imports: [RouterLink, ReservarConfirmacionComponent],
  templateUrl: './reserva-pago.component.html',
  styleUrls: [
    '../../components/reservar-page/reservar-page.component.scss',
    './reserva-pago.component.scss',
  ],
})
export class ReservaPagoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private reservarService = inject(ReservarPublicService);
  private pagoContexto = inject(ReservaPagoContextoService);

  vista = signal<Vista>('cargando');
  codigo = signal('');
  monto = signal<number | null>(null);
  contexto = signal<ContextoPagoReserva | null>(null);
  private inicioEspera = 0;
  private reintento: Subscription | null = null;

  /** "Volver a reservar" lleva a la página del negocio si se conoce; si no, al inicio. */
  linkReservar = computed(() => {
    const c = this.contexto();
    return c ? ['/reservar', c.empresaSlug, String(c.sucursalId)] : ['/'];
  });

  ngOnInit(): void {
    const codigo = this.route.snapshot.queryParamMap.get('codigo') ?? '';
    if (!codigo) {
      this.vista.set('no-encontrada');
      return;
    }
    this.codigo.set(codigo);
    this.contexto.set(this.pagoContexto.leer(codigo));
    this.inicioEspera = Date.now();
    this.consultar();
  }

  reintentar(): void {
    this.vista.set('cargando');
    this.inicioEspera = Date.now();
    this.consultar();
  }

  private consultar(): void {
    this.reservarService
      .getEstadoPago(this.codigo())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (estado) => {
          this.monto.set(estado.monto);
          switch (estado.estadoPago) {
            case 'Pagado':
              this.vista.set('pagado');
              break;
            case 'Rechazado':
              this.vista.set('rechazado');
              break;
            default:
              this.esperar();
          }
        },
        error: (error: unknown) => {
          const noExiste = error instanceof HttpErrorResponse && error.status === 404;
          this.vista.set(noExiste ? 'no-encontrada' : 'error');
        },
      });
  }

  private esperar(): void {
    if (Date.now() - this.inicioEspera >= ESPERA_MAXIMA_MS) {
      this.vista.set('sin-confirmar');
      return;
    }
    this.vista.set('pendiente');
    this.reintento?.unsubscribe();
    this.reintento = timer(INTERVALO_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.consultar());
  }

  formatearPrecio(monto: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(monto);
  }
}

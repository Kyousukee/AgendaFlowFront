import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReservarPublicService } from '../../services/reservar-public.service';
import {
  CancelacionRealizada,
  CancelacionVista,
  MotivoNoCancelable,
} from '../../interfaces/cancelacion.interface';

/** Fecha y hora de la reserva se guardan como hora local del negocio (SPEC 07). */
const ZONA_HORARIA_NEGOCIO = 'America/Santiago';

const MOTIVOS: readonly MotivoNoCancelable[] = ['FUERA_DE_PLAZO', 'YA_CANCELADA', 'NO_CANCELABLE'];

type Vista = 'cargando' | 'detalle' | 'cancelada' | 'enlace-invalido' | 'demasiados' | 'error';

/**
 * SPEC 07: el correo de confirmación trae `/reserva/cancelar?token=`. Muestra la reserva y el
 * plazo, y cancela (con reembolso del abono Flow, si lo hay) tras confirmar.
 */
@Component({
  selector: 'app-reserva-cancelar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './reserva-cancelar.component.html',
  styleUrls: [
    '../../components/reservar-page/reservar-page.component.scss',
    '../reserva-pago/reserva-pago.component.scss',
    './reserva-cancelar.component.scss',
  ],
})
export class ReservaCancelarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private reservarService = inject(ReservarPublicService);

  vista = signal<Vista>('cargando');
  detalle = signal<CancelacionVista | null>(null);
  resultado = signal<CancelacionRealizada | null>(null);
  /** Segundo paso: el cliente confirma antes del POST. */
  confirmando = signal(false);
  cancelando = signal(false);
  /** Error del POST que deja la reserva activa (502, 429, red). */
  errorCancelar = signal('');
  private token = '';

  empresa = computed(() => this.detalle()?.reserva.empresa || 'el local');

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.vista.set('enlace-invalido');
      return;
    }
    this.cargar();
  }

  cargar(): void {
    this.vista.set('cargando');
    this.reservarService
      .getCancelacion(this.token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detalle) => {
          this.detalle.set(detalle);
          this.vista.set('detalle');
        },
        error: (error: unknown) => this.vista.set(this.vistaDeError(error)),
      });
  }

  pedirConfirmacion(): void {
    this.errorCancelar.set('');
    this.confirmando.set(true);
  }

  volver(): void {
    this.confirmando.set(false);
  }

  cancelar(): void {
    if (this.cancelando()) return;
    this.cancelando.set(true);
    this.errorCancelar.set('');
    this.reservarService
      .cancelarReserva(this.token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => {
          this.cancelando.set(false);
          this.resultado.set(resultado);
          this.vista.set('cancelada');
        },
        error: (error: unknown) => {
          this.cancelando.set(false);
          this.confirmando.set(false);
          this.manejarErrorCancelar(error);
        },
      });
  }

  mensajeMotivo(motivo: MotivoNoCancelable): string {
    switch (motivo) {
      case 'FUERA_DE_PLAZO':
        return `Ya no puedes cancelar online. Contacta a ${this.empresa()}.`;
      case 'YA_CANCELADA':
        return 'Esta reserva ya está cancelada.';
      case 'NO_CANCELABLE':
        return 'Esta reserva no se puede cancelar online.';
    }
  }

  /** "martes 9 de diciembre de 2026" (la fecha viene como AAAA-MM-DD, sin zona). */
  formatearFecha(fecha: string): string {
    return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /** El límite es un instante: se muestra en la hora del negocio, no la del navegador. */
  formatearLimite(limite: string): string {
    const fecha = new Date(limite);
    const dia = fecha.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: ZONA_HORARIA_NEGOCIO,
    });
    const hora = fecha.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: ZONA_HORARIA_NEGOCIO,
    });
    return `${dia} a las ${hora}`;
  }

  formatearPrecio(monto: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(monto);
  }

  private manejarErrorCancelar(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      this.errorCancelar.set('No pudimos cancelar tu reserva. Inténtalo de nuevo.');
      return;
    }
    switch (error.status) {
      case 404:
        this.vista.set('enlace-invalido');
        return;
      case 409: {
        // El back dice por qué: se muestra el mismo mensaje que al abrir el enlace.
        const motivo = this.motivoDeError(error) ?? 'NO_CANCELABLE';
        this.detalle.update((d) => (d ? { ...d, puedeCancelar: false, motivo } : d));
        return;
      }
      case 502:
        this.errorCancelar.set(
          `No pudimos procesar el reembolso. Tu reserva sigue activa; contacta a ${this.empresa()}.`,
        );
        return;
      case 429:
        this.errorCancelar.set('Demasiados intentos. Espera un minuto e inténtalo de nuevo.');
        return;
      default:
        this.errorCancelar.set(
          'No pudimos cancelar tu reserva. Revisa tu conexión e inténtalo de nuevo.',
        );
    }
  }

  private motivoDeError(error: HttpErrorResponse): MotivoNoCancelable | null {
    const cuerpo: unknown = error.error;
    if (!cuerpo || typeof cuerpo !== 'object' || !('motivo' in cuerpo)) return null;
    const { motivo } = cuerpo as { motivo: unknown };
    return MOTIVOS.find((m) => m === motivo) ?? null;
  }

  private vistaDeError(error: unknown): Vista {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 404) return 'enlace-invalido';
      if (error.status === 429) return 'demasiados';
    }
    return 'error';
  }
}

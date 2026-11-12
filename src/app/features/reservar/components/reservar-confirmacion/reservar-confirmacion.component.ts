import { Component, Input } from '@angular/core';
import { ReservaResumen } from '../../interfaces/reserva-resumen.interface';

@Component({
  selector: 'app-reservar-confirmacion',
  standalone: true,
  template: `
    <div class="confirmacion" role="status">
      <span class="confirmacion__icon material-icons" aria-hidden="true">check</span>
      <h2 class="confirmacion__title">Reserva confirmada</h2>
      <p class="confirmacion__desc">Tu hora quedó registrada en la agenda del negocio.</p>

      <div class="confirmacion__codigo">
        <span class="codigo-label">Código de reserva</span>
        <span class="codigo-value">{{ resumen.codigo }}</span>
      </div>

      <!-- SPEC 04: el comprobante dice qué, cuándo, con quién y dónde. -->
      <dl class="confirmacion__detalle">
        <div><dt>Servicio</dt><dd>{{ resumen.servicio }}</dd></div>
        <div><dt>Cuándo</dt><dd>{{ resumen.fecha }}, de {{ resumen.horaInicio }} a {{ resumen.horaFin }}</dd></div>
        <div><dt>Con</dt><dd>{{ resumen.profesional }}</dd></div>
        @if (direccion) {
          <div><dt>Dónde</dt><dd>{{ sucursalNombre }}, {{ direccion }}</dd></div>
        }
        @if (montoPagado !== null) {
          <div><dt>Pagado con Flow</dt><dd>{{ formatearPrecio(montoPagado) }}</dd></div>
        }
      </dl>

      <div class="confirmacion__info">
        <p>
          Guarda esta pantalla o toma una captura. Te pueden pedir el código al llegar a
          <strong>{{ empresaNombre }}</strong>, {{ sucursalNombre }}.
        </p>
      </div>
    </div>
  `,
  // Estilos en línea heredados: se restilizan en su lugar (SPEC 03, Decisiones).
  styles: `
    .confirmacion__detalle {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 480px;
      margin: 4px 0;
    }

    .confirmacion__detalle div {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
    }

    .confirmacion__detalle dt {
      color: var(--text-secondary);
    }

    .confirmacion__detalle dd {
      font-weight: 600;
      text-align: right;
    }

    .confirmacion {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      padding: 8px 0;
      animation: confirmacion-in 320ms var(--ease-out);
    }

    @keyframes confirmacion-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    .confirmacion__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      margin-bottom: 8px;
      border-radius: 50%;
      background: var(--gold);
      color: var(--on-gold);
      font-size: 30px;
    }

    .confirmacion__title {
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(2rem, 5vw, 3rem);
      line-height: 1;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }

    .confirmacion__desc {
      font-size: 1.0625rem;
      color: var(--text-secondary);
    }

    .confirmacion__codigo {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
      margin-top: 16px;
      padding: 20px 24px;
      background: var(--bg-surface);
    }

    .codigo-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .codigo-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--gold-light);
      font-variant-numeric: tabular-nums;
      word-break: break-all;
    }

    .confirmacion__info {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;

      p {
        font-size: 1rem;
        line-height: 1.5;
        color: var(--text-secondary);
      }

      strong {
        color: var(--text-primary);
      }
    }
  `,
})
export class ReservarConfirmacionComponent {
  @Input({ required: true }) resumen!: ReservaResumen;
  @Input() direccion = '';
  @Input({ required: true }) empresaNombre = '';
  @Input({ required: true }) sucursalNombre = '';
  /** SPEC 06: abono pagado online, para la confirmación que llega desde Flow. */
  @Input() montoPagado: number | null = null;

  formatearPrecio(monto: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(monto);
  }
}

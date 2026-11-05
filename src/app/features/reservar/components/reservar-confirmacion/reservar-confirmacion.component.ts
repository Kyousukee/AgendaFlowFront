import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-reservar-confirmacion',
  standalone: true,
  template: `
    <div class="confirmacion">
      <span class="confirmacion__icon material-icons" aria-hidden="true">check</span>
      <h2 class="confirmacion__title">Reserva confirmada</h2>
      <p class="confirmacion__desc">Tu reserva quedó registrada.</p>

      <div class="confirmacion__codigo">
        <span class="codigo-label">Código de reserva</span>
        <span class="codigo-value">{{ codigo }}</span>
      </div>

      <div class="confirmacion__info">
        <p>Recibirás una confirmación en tu correo electrónico.</p>
        <p>Presenta este código al momento de tu cita en <strong>{{ empresaNombre }}</strong> - {{ sucursalNombre }}.</p>
      </div>
    </div>
  `,
  // Estilos en línea heredados: se restilizan en su lugar (SPEC 03, Decisiones).
  styles: `
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
  @Input({ required: true }) codigo = '';
  @Input({ required: true }) empresaNombre = '';
  @Input({ required: true }) sucursalNombre = '';
}

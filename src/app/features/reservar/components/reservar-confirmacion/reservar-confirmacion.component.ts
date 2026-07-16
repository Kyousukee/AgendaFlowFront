import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-reservar-confirmacion',
  standalone: true,
  template: `
    <div class="confirmacion">
      <div class="confirmacion__icon">✓</div>
      <h2 class="confirmacion__title">Reserva confirmada</h2>
      <p class="confirmacion__desc">Tu reserva ha sido registrada exitosamente</p>

      <div class="confirmacion__codigo">
        <span class="codigo-label">Codigo de reserva</span>
        <span class="codigo-value">{{ codigo }}</span>
      </div>

      <div class="confirmacion__info">
        <p>Recibirás una confirmación en tu correo electronico.</p>
        <p>Presenta este codigo al momento de tu cita en <strong>{{ empresaNombre }}</strong> - {{ sucursalNombre }}.</p>
      </div>
    </div>
  `,
  styles: `
    .confirmacion {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2rem 0;
      gap: 0.75rem;
    }

    .confirmacion__icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .confirmacion__title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .confirmacion__desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin: 0;
    }

    .confirmacion__codigo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem 2rem;
      margin-top: 1rem;
    }

    .codigo-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .codigo-value {
      font-size: 1rem;
      font-weight: 700;
      color: var(--gold);
      font-family: monospace;
      word-break: break-all;
      text-align: center;
    }

    .confirmacion__info {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;

      p {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.5;
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

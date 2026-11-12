import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Método con que se cobró un pago (SPEC 06). Los de Flow llevan su ícono. */
export const METODO_PAGO_FLOW = 'Flow';

export function esPagoFlow(metodoPago: string | null | undefined): boolean {
  return metodoPago === METODO_PAGO_FLOW;
}

/** SPEC 06: el método de pago, con el ícono de Flow para los cobros online. */
@Component({
  selector: 'app-metodo-pago',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './metodo-pago.component.html',
  styleUrl: './metodo-pago.component.scss',
})
export class MetodoPagoComponent {
  @Input({ required: true }) metodo: string | null | undefined = '';

  get esFlow(): boolean {
    return esPagoFlow(this.metodo);
  }
}

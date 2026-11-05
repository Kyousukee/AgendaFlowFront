import { Component, computed, signal } from '@angular/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import {
  hora,
  horasLibres,
  NEGOCIO,
  pesos,
  RESERVAS,
  Salida,
  SALIDAS,
  SERVICIOS,
  ServicioDemo,
} from './showcase.data';

/**
 * Showcase — índice de salidas y hoja viva. El visitante elige qué hoja de la app ver.
 * En la página de reservas, elegir un servicio recalcula las horas libres según su duración,
 * y "Confirmar" lleva a la confirmación con lo elegido.
 */
@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
})
export class ShowcaseComponent {
  readonly salidas = SALIDAS;
  readonly servicios = SERVICIOS;
  readonly negocio = NEGOCIO;
  readonly reservas = RESERVAS;
  readonly hora = hora;
  readonly pesos = pesos;

  readonly salida = signal<Salida>('reservas');
  readonly servicioId = signal<string>('corte-barba');
  private readonly horaElegidaManual = signal<number | null>(null);

  readonly servicio = computed<ServicioDemo>(
    () => SERVICIOS.find((s) => s.id === this.servicioId()) ?? SERVICIOS[0],
  );
  readonly libres = computed(() => horasLibres(this.servicio().duracion).slice(0, 8));
  readonly horaElegida = computed(() => {
    const manual = this.horaElegidaManual();
    const libres = this.libres();
    return manual !== null && libres.includes(manual) ? manual : (libres[0] ?? null);
  });

  readonly citas = RESERVAS.filter((r) => r.cliente !== null);
  readonly totalDia = this.citas.reduce((acc, r) => acc + r.precio, 0);
  readonly cobrado = this.citas.filter((r) => r.pago).reduce((acc, r) => acc + r.precio, 0);
  readonly pendiente = this.totalDia - this.cobrado;

  elegirSalida(id: Salida): void {
    this.salida.set(id);
  }

  elegirServicio(id: string): void {
    this.servicioId.set(id);
    this.horaElegidaManual.set(null);
  }

  elegirHora(min: number): void {
    this.horaElegidaManual.set(min);
  }

  confirmar(): void {
    this.salida.set('confirmacion');
  }
}

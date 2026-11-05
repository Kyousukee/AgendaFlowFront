import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface Etapa {
  duracion: string;
  texto: string;
  tono: 'bone' | 'char' | 'gold';
}

/** Cómo funciona — las etapas como una sola barra de progreso, proporcional a su duración. */
@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss',
})
export class HowItWorksComponent {
  readonly etapas: Etapa[] = [
    {
      duracion: 'Dos minutos',
      texto: 'Primero, creas la cuenta con tu correo y el nombre del negocio.',
      tono: 'bone',
    },
    {
      duracion: 'Una tarde',
      texto: 'Después, cargas servicios, equipo, sucursales y horarios.',
      tono: 'char',
    },
    {
      duracion: 'Desde ese día',
      texto: 'Y desde entonces, tus clientes reservan solos con tu enlace.',
      tono: 'gold',
    },
  ];
}

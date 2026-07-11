import { Component } from '@angular/core';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss',
})
export class HowItWorksComponent {
  steps = [
    {
      number: '01',
      title: 'Crea tu cuenta',
      description: 'Registrate en menos de 2 minutos. Importa tus clientes y servicios existentes con un solo clic.',
    },
    {
      number: '02',
      title: 'Configura tu horario',
      description: 'Define horas de trabajo, duracion de servicios y disponibilidad del personal. Nuestra IA optimiza tu calendario.',
    },
    {
      number: '03',
      title: 'Comparte tu enlace de reservas',
      description: 'Envia a tus clientes tu pagina de reservas con marca propia. Reservan cuando quieran &mdash; tu recibes la notificacion al instante.',
    },
    {
      number: '04',
      title: 'Haz crecer tu negocio',
      description: 'Observa las analiticas, reduce inasistencias y concentrate en lo que mejor haces mientras nosotros nos encargamos del resto.',
    },
  ];
}

import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface Comparacion {
  capacidad: string;
  agendaflow: string;
  libreta: string;
  whatsapp: string;
}

/** Funciones — comparación escrita en palabras. Solo lista lo que la app hace hoy. */
@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.scss',
})
export class FeaturesSectionComponent {
  readonly columnas = ['AgendaFlow', 'Libreta', 'WhatsApp'] as const;

  readonly filas: Comparacion[] = [
    {
      capacidad: 'Reservas a cualquier hora',
      agendaflow: 'Sí, 24/7 desde tu enlace',
      libreta: 'Solo con el local abierto',
      whatsapp: 'Cuando alguien contesta',
    },
    {
      capacidad: 'Horas libres según el servicio',
      agendaflow: 'Sí, por la duración de cada uno',
      libreta: 'Se calculan a ojo',
      whatsapp: 'Se calculan a ojo',
    },
    {
      capacidad: 'Precio y duración a la vista',
      agendaflow: 'Sí, antes de reservar',
      libreta: 'En una pizarra del local',
      whatsapp: 'Se preguntan por chat',
    },
    {
      capacidad: 'Agenda por cada profesional',
      agendaflow: 'Sí, con sus servicios',
      libreta: 'Columnas hechas a mano',
      whatsapp: 'No',
    },
    {
      capacidad: 'Varias sucursales',
      agendaflow: 'Sí, cada una con su horario',
      libreta: 'Una libreta por local',
      whatsapp: 'Un chat por local',
    },
    {
      capacidad: 'Almuerzo, vacaciones y feriados',
      agendaflow: 'Se bloquean y dejan de ofrecerse',
      libreta: 'Se tachan a mano',
      whatsapp: 'Se avisa uno por uno',
    },
    {
      capacidad: 'Registro de pagos',
      agendaflow: 'Sí, por cada reserva',
      libreta: 'En otra libreta',
      whatsapp: 'No',
    },
    {
      capacidad: 'El día completo de un vistazo',
      agendaflow: 'Sí, en el panel',
      libreta: 'Hojeando páginas',
      whatsapp: 'Buscando mensajes',
    },
  ];
}

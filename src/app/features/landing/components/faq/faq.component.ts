import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface Pregunta {
  pregunta: string;
  respuesta: string;
}

/** Preguntas — respuestas como texto corrido en dos columnas, sin acordeón. */
@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  readonly preguntas: Pregunta[] = [
    {
      pregunta: '¿Cómo reservan mis clientes?',
      respuesta:
        'Con el enlace de tu sucursal. Eligen el servicio, el profesional, el día y una hora libre, y dejan su nombre, correo y teléfono. No necesitan crear una cuenta.',
    },
    {
      pregunta: '¿Tengo que instalar algo?',
      respuesta:
        'No. AgendaFlow funciona en el navegador, en el computador del local o en el teléfono.',
    },
    {
      pregunta: '¿Cómo se calculan las horas libres?',
      respuesta:
        'Con la duración de cada servicio, el horario de la sucursal, los servicios que hace cada profesional y los bloqueos que cargues.',
    },
    {
      pregunta: '¿Qué pasa con el almuerzo o las vacaciones?',
      respuesta: 'Creas un bloqueo en la agenda y esas horas dejan de ofrecerse a tus clientes.',
    },
    {
      pregunta: '¿Puedo tener varias sucursales?',
      respuesta:
        'Sí. Cada sucursal tiene su dirección, su horario, su equipo y su propio enlace de reservas.',
    },
    {
      pregunta: '¿Mis clientes ven los precios?',
      respuesta: 'Sí. Cada servicio muestra su duración y su precio antes de reservar.',
    },
    {
      pregunta: '¿Qué incluye el plan Gratis?',
      respuesta:
        'Reservas en línea y recordatorios básicos, con un límite de horarios y servicios. No vence.',
    },
    {
      pregunta: '¿Qué pasa cuando termina la prueba?',
      respuesta:
        'Tu cuenta sigue en el plan Gratis. Lo que pase del límite del plan queda desactivado, no borrado, y vuelve al activar Pro.',
    },
    {
      pregunta: '¿Cómo activo el plan Pro?',
      respuesta: 'En Configuración ves tu plan y su uso. Para activar Pro, escríbenos.',
    },
    {
      pregunta: '¿Sirve para tatuajes, uñas o spa?',
      respuesta:
        'Sí. Sirve para cualquier negocio que trabaje con hora agendada: estudios de tatuaje, centros de uñas, cosmetología, spa y masajes.',
    },
  ];
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent {
  testimonials = [
    {
      quote: "AgendaFlow redujo nuestras inasistencias en un 70% en el primer mes. Los recordatorios automaticos son revolucionarios.",
      author: 'Maria Gonzalez',
      role: 'Fundadora, Glow Beauty Studio',
      initials: 'MG',
      color: '#7C3AED',
    },
    {
      quote: "Antes gastaba horas organizando la agenda. Ahora solo me enfoco en mis clientes. La mejor inversion para mi barberia.",
      author: 'Carlos Ramirez',
      role: 'Barbero, The Fade Room',
      initials: 'CR',
      color: '#059669',
    },
    {
      quote: "Las analiticas por si solas valen la pena. Puedo ver exactamente cuales servicios generan mas ingresos y ajustar en consecuencia.",
      author: 'Sophia Chen',
      role: 'Gerente, Luxe Nail Bar',
      initials: 'SC',
      color: '#DC2626',
    },
  ];
}

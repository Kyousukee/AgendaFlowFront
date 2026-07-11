import { Component } from '@angular/core';

@Component({
  selector: 'app-features-section',
  standalone: true,
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.scss',
})
export class FeaturesSectionComponent {
  features = [
    {
      icon: 'calendar',
      title: 'Agenda Inteligente',
      description: 'Reservas con IA que llenan huecos, previenen doble reservacion y envian recordatorios automaticos a los clientes.',
    },
    {
      icon: 'users',
      title: 'Gestion de Clientes',
      description: 'Manten perfiles detallados, historial de citas y preferencias de cada cliente en un solo lugar.',
    },
    {
      icon: 'chart',
      title: 'Analiticas del Negocio',
      description: 'Rastrea ingresos, horas pico y rendimiento del personal con paneles y reportes en tiempo real.',
    },
    {
      icon: 'credit-card',
      title: 'Pagos y Punto de Venta',
      description: 'Acepta tarjetas, divide cuentas, administra propinas y controla inventario &mdash; todo integrado en la plataforma.',
    },
    {
      icon: 'bell',
      title: 'Recordatorios Automaticos',
      description: 'Reduce inasistencias en un 80% con recordatorios por SMS y correo enviados automaticamente antes de cada cita.',
    },
    {
      icon: 'globe',
      title: 'Reservas en Linea',
      description: 'Dale a tus clientes una pagina de reservas con marca propia que pueden usar 24/7. Incrustala en tu sitio web.',
    },
  ];
}

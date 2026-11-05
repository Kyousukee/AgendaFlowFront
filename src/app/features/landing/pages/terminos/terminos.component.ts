import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LegalPageComponent, SeccionLegal } from '../legal-page/legal-page.component';

/** Términos y condiciones de uso de AgendaFlow. */
@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [LegalPageComponent, RouterLink],
  templateUrl: './terminos.component.html',
})
export class TerminosComponent {
  readonly secciones: SeccionLegal[] = [
    { id: 'servicio', titulo: 'Qué es AgendaFlow' },
    { id: 'aceptacion', titulo: 'Aceptación' },
    { id: 'cuentas', titulo: 'Cuentas' },
    { id: 'planes', titulo: 'Planes y precios' },
    { id: 'uso', titulo: 'Uso aceptable' },
    { id: 'reservas', titulo: 'Reservas' },
    { id: 'pagos', titulo: 'Pagos' },
    { id: 'disponibilidad', titulo: 'Disponibilidad del servicio' },
    { id: 'propiedad', titulo: 'Propiedad intelectual' },
    { id: 'responsabilidad', titulo: 'Responsabilidad' },
    { id: 'termino', titulo: 'Término de la cuenta' },
    { id: 'ley', titulo: 'Ley aplicable' },
    { id: 'contacto', titulo: 'Contacto' },
  ];

  constructor() {
    inject(Title).setTitle('Términos y condiciones · AgendaFlow');
  }
}

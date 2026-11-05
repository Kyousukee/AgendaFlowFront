import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

export interface SeccionLegal {
  id: string;
  titulo: string;
}

/**
 * Layout de las páginas legales: navbar, título con fecha de actualización, índice de secciones
 * en la zona del eje (sticky en desktop) y el texto a la derecha. El contenido llega por ng-content.
 */
@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './legal-page.component.html',
  styleUrl: './legal-page.component.scss',
})
export class LegalPageComponent {
  readonly titulo = input.required<string>();
  readonly actualizado = input.required<string>();
  readonly secciones = input.required<SeccionLegal[]>();
  readonly rutaActual = input.required<string>();
}

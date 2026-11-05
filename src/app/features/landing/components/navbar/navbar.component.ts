import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavLink {
  label: string;
  fragment: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  // Enlaces a secciones de la landing; usan routerLink="/" + fragment para funcionar
  // también desde /privacidad y /terminos.
  readonly links: NavLink[] = [
    { label: 'Cómo se ve', fragment: 'showcase' },
    { label: 'Funciones', fragment: 'features' },
    { label: 'Precios', fragment: 'pricing' },
    { label: 'Preguntas', fragment: 'faq' },
  ];

  mobileMenuOpen = signal(false);

  toggleMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }
}

import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  mobileMenuOpen = signal(false);

  toggleMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  get menuLabel(): string {
    return this.mobileMenuOpen() ? 'Cerrar menu' : 'Abrir menu';
  }
}

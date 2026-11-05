import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

/** Cierre — la idea del hero vuelve invertida: campo hueso, tinta negra, botón dorado. */
@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './cta.component.html',
  styleUrl: './cta.component.scss',
})
export class CtaComponent {}

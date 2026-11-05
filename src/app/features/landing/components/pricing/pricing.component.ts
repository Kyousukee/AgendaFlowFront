import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

/** Precios — dos planes como dos campos de color que se tocan. Planes y precios sin cambios. */
@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {}

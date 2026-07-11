import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { FeaturesSectionComponent } from './components/features-section/features-section.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { CtaComponent } from './components/cta/cta.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    FeaturesSectionComponent,
    HowItWorksComponent,
    TestimonialsComponent,
    PricingComponent,
    CtaComponent,
    FooterComponent,
  ],
  templateUrl: './landing.component.html',
})
export class LandingComponent {}

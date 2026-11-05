import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { ShowcaseComponent } from './components/showcase/showcase.component';
import { FeaturesSectionComponent } from './components/features-section/features-section.component';
import { RubrosComponent } from './components/rubros/rubros.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { FaqComponent } from './components/faq/faq.component';
import { CtaComponent } from './components/cta/cta.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    ShowcaseComponent,
    FeaturesSectionComponent,
    RubrosComponent,
    HowItWorksComponent,
    PricingComponent,
    FaqComponent,
    CtaComponent,
    FooterComponent,
  ],
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  constructor() {
    // Las páginas legales cambian el título; al volver a la landing se restaura.
    inject(Title).setTitle('AgendaFlow · Agenda online para barberías y peluquerías');
  }
}

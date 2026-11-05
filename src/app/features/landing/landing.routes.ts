import { Routes } from '@angular/router';
import { LandingComponent } from './landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'privacidad',
    loadComponent: () =>
      import('./pages/privacidad/privacidad.component').then((m) => m.PrivacidadComponent),
  },
  {
    path: 'terminos',
    loadComponent: () =>
      import('./pages/terminos/terminos.component').then((m) => m.TerminosComponent),
  },
];

import { Routes } from '@angular/router';
import { ReservarPageComponent } from './components/reservar-page/reservar-page.component';

export const routes: Routes = [
  { path: ':empresaSlug/:sucursalId', component: ReservarPageComponent },
];

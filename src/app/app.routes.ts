import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/landing/landing.routes').then((m) => m.routes),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.routes),
  },
  {
    path: 'reservar',
    loadChildren: () =>
      import('./features/reservar/reservar.routes').then((m) => m.routes),
  },
  // SPEC 06: el back redirige aquí al volver de Flow con el pago de una reserva (pública).
  {
    path: 'reserva/pago',
    loadComponent: () =>
      import('./features/reservar/pages/reserva-pago/reserva-pago.component').then(
        (m) => m.ReservaPagoComponent,
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.routes),
  },
];

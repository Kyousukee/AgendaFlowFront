import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * SPEC 08: empleados, servicios, horarios, bloqueos, sucursales, configuración, suscripción y
 * equipo son del dueño. El recepcionista que entra por URL vuelve a la agenda; la API igual le
 * respondería 403.
 */
export const soloAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.esRecepcionista() ? inject(Router).createUrlTree(['/admin/home']) : true;
};

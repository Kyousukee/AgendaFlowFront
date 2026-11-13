import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { esApiPropia } from './auth.interceptor';

// Un 401 de estas rutas es un dato mal ingresado, un credential de Google vencido o un enlace de
// invitación que no sirve (SPEC 08), no una sesión vencida.
const EXCLUDE_URLS = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/invitacion',
  '/auth/aceptar-invitacion',
];

export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      // Un 401 de un servicio externo no dice nada sobre nuestra sesión.
      if (
        error.status === 401 &&
        esApiPropia(req.url) &&
        !EXCLUDE_URLS.some((url) => req.url.includes(url))
      ) {
        // SPEC 08: también llega cuando el dueño desactiva o mueve a un recepcionista.
        authService.cerrarSesionTerminada();
      }
      return throwError(() => error);
    }),
  );
};

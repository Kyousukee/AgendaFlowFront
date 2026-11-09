import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { esApiPropia } from './auth.interceptor';

// Un 401 de estas rutas es un dato mal ingresado o un credential de Google vencido, no una sesión vencida.
const EXCLUDE_URLS = ['/auth/login', '/auth/register', '/auth/google'];

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
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Adjunta el Bearer token a las peticiones al API y, ante un 401, intenta
 * refrescar la sesion una vez antes de rendirse.
 *
 * Rutas excluidas: los propios endpoints de auth (aun no hay token, y mandarlo
 * en /auth/refresh confundiria al backend) y todo /reservar/*, que es el flujo
 * publico de reservas y no lleva autenticacion.
 */
const RUTAS_PUBLICAS = /\/auth\/(login|register|refresh)$|\/reservar\//;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const esPublica = RUTAS_PUBLICAS.test(req.url);
  const token = auth.getToken();

  const peticion =
    token && !esPublica
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || esPublica || !auth.getRefreshToken()) {
        return throwError(() => err);
      }

      return auth.refresh().pipe(
        switchMap((res) =>
          next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` },
            }),
          ),
        ),
        catchError((errRefresh) => {
          // El refresh token tambien caduco: no hay forma de recuperarse.
          auth.logout();
          return throwError(() => errRefresh);
        }),
      );
    }),
  );
};

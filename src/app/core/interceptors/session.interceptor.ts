import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const EXCLUDE_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

/**
 * Ante un 401 intenta renovar la sesion una vez y reintenta la peticion.
 * Solo cierra sesion si el refresco tambien falla.
 *
 * Antes cerraba sesion directamente, lo que expulsaba al usuario a mitad de
 * trabajo en cuanto caducaba el access token (1 h por defecto en Supabase).
 */
export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const excluida = EXCLUDE_URLS.some((url) => req.url.includes(url));

  return next(req).pipe(
    catchError((error) => {
      if (error.status !== 401 || excluida) {
        return throwError(() => error);
      }

      // Sin refresh token no hay nada que renovar.
      if (!authService.getRefreshToken()) {
        authService.logout();
        return throwError(() => error);
      }

      return authService.refresh().pipe(
        switchMap((sesion) =>
          next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${sesion.accessToken}` },
            }),
          ),
        ),
        catchError((errorRefresh) => {
          authService.logout();
          return throwError(() => errorRefresh);
        }),
      );
    }),
  );
};

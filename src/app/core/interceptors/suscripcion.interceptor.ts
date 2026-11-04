import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { SuscripcionService } from '../services/suscripcion.service';
import { SuscripcionLimiteError } from '../interfaces/suscripcion.interface';

function esLimiteSuscripcion(
  error: unknown,
): error is HttpErrorResponse & { error: SuscripcionLimiteError } {
  return (
    error instanceof HttpErrorResponse &&
    error.status === 403 &&
    error.error?.code === 'SUSCRIPCION_LIMITE'
  );
}

export const suscripcionInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);
  const suscripcionService = inject(SuscripcionService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (esLimiteSuscripcion(error)) {
        snackBar
          .open(error.error.message, 'Ver plan', { duration: 6000 })
          .onAction()
          .subscribe(() => router.navigate(['/admin/configuracion']));
        suscripcionService.cargar();
      }
      return throwError(() => error);
    }),
  );
};

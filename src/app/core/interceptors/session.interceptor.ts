import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const EXCLUDE_URLS = ['/auth/login', '/auth/register'];

export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && !EXCLUDE_URLS.some((url) => req.url.includes(url))) {
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};

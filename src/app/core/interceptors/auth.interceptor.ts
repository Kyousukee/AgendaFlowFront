import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Indica si la URL pertenece a nuestra API. Compara hasta la "/" para que un dominio como
 * `api.agendaflow.cl.otro.com` no pase por bueno.
 */
export function esApiPropia(url: string): boolean {
  return url === environment.apiUrl || url.startsWith(`${environment.apiUrl}/`);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // El token solo viaja a nuestra API, nunca a terceros como Nominatim.
  if (!esApiPropia(req.url)) {
    return next(req);
  }

  const token = inject(AuthService).getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};

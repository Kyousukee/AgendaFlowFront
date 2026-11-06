import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { sessionInterceptor } from './core/interceptors/session.interceptor';
import { suscripcionInterceptor } from './core/interceptors/suscripcion.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    // Sin hidratación incremental no se inyectan los scripts inline de event replay, que la CSP
    // bloquearía: las páginas prerenderizadas no pueden llevar nonce.
    provideClientHydration(withNoIncrementalHydration()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, sessionInterceptor, suscripcionInterceptor]),
    ),
  ],
};

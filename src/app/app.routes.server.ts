import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // La sesión vive en localStorage: al prerenderizar, authGuard siempre vería "sin sesión" y
  // guardaría una redirección a /login. El guard debe decidir en el navegador.
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'reservar/**',
    renderMode: RenderMode.Client,
  },
  // El token llega en la URL: al prerenderizar no existiría y la llamada a la API correría en el
  // servidor. Estas páginas solo se renderizan en el navegador.
  {
    path: 'verificar-email',
    renderMode: RenderMode.Client,
  },
  {
    path: 'restablecer-contrasena',
    renderMode: RenderMode.Client,
  },
  // Depende del registro con Google pendiente, que solo existe en la memoria del navegador.
  {
    path: 'registro-google',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

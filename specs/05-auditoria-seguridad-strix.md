# SPEC 05: Auditoría de seguridad Strix (front)

**Fecha:** 2026-11-06 · **Rama:** `security/strix-auditoria` · **Informe de la API:** `agenda-flow-api/specs/03-auditoria-seguridad-strix.md`

Modo `strix-standard`, white-box, con pruebas en Chrome solo en local. Este repositorio es público, así que el informe no incluye pasos de explotación.

## Despliegue

Esta rama y la de la API **deben desplegarse juntas**: el front actual deja de funcionar contra la API nueva, y al revés.

- **`allowedHosts`:** se configuró `agendaflow.cl` y `www.agendaflow.cl`, deducidos de `api.agendaflow.cl`. **Hay que confirmar el dominio real.** Para probar el SSR en local: `NG_ALLOWED_HOSTS=localhost`.
- **Cabeceras de seguridad:** las envía `server.ts` solo cuando corre como servidor propio. Un despliegue que importe `reqHandler` (por ejemplo, Cloud Functions) debe enviarlas por su cuenta.

## Hallazgos

| ID | Severidad | Hallazgo | Corrección |
|---|---|---|---|
| C1 | Crítica | La página pública descargaba todas las reservas con datos de clientes y las imprimía en la consola | Usa `/reservar/ocupacion`, que solo trae las horas tomadas |
| C2 | Crítica | El panel cambiaba estados por una ruta pública | Nuevo `ReservasService` del panel, con sesión |
| A2 | Alta | El front enviaba `precio` y `horaFin`, y la API confiaba en ellos | Ya no se envían; los calcula la API |
| A3 | Alta, latente | `authInterceptor` adjuntaba el JWT a todas las peticiones, incluido Nominatim | El token solo viaja a `environment.apiUrl`; un 401 externo ya no cierra la sesión |
| M4 | Media | El SSR no enviaba cabeceras de seguridad | CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy` y HSTS en producción |
| M6 | Media | Faltaba `fileReplacements`: la build de producción apuntaba a `http://localhost:3000` | Añadido; el bundle usa `api.agendaflow.cl` |
| B1 | Baja | `console.log` con datos de negocio | Eliminados |

**Sobre A3:** Nominatim acepta `Authorization` en el preflight, así que la petición saldría con el token. Hoy no se dispara desde la interfaz porque el mapa está roto (ver "Otros bugs"). Arreglar el mapa sin esta corrección habría activado la fuga.

### Decisiones sobre la CSP

La CSP queda **en modo estricto, sin `Report-Only`**. Para lograrlo, en producción:

- **`provideClientHydration(withNoIncrementalHydration())`:** Angular inyectaba scripts inline de *event replay*, y las páginas prerenderizadas no pueden llevar nonce. **Efecto:** un clic hecho antes de que termine la hidratación ya no se reproduce después.
- **`inlineCritical: false`:** el CSS crítico inline carga las hojas de estilo con un manejador `onload`, que la CSP bloquearía. **Efecto:** el primer pintado puede tardar algo más.

`style-src` mantiene `'unsafe-inline'` porque Angular y Leaflet usan estilos en línea. `script-src` no lo permite.

## Verificación

- **Chrome, build de desarrollo contra API local:** reserva completa, hora ocupada no ofrecida, login, listado y cambio de estado en el panel, y petición a Nominatim sin `Authorization`.
- **Chrome, build de producción:** `/`, `/login`, `/register`, `/terminos` y `/privacidad` sin violaciones de CSP y con estilos cargados. Con la API de producción bloqueada, no se probó la CSP en el panel ni en la reserva sobre esta build.
- **`ng test`:** 6 de 7. Falla `app.spec.ts`, que busca un "Hello" de la plantilla inicial; ni el test ni `app.html` cambian en esta rama.
- **`npm audit --omit=dev`:** 0 vulnerabilidades.
- **Sin sinks XSS:** no se usa `innerHTML` ni `bypassSecurityTrust`.

## Límites de la auditoría

`semgrep`, `gitleaks` y `trivy` no estaban instalados; se sustituyeron por revisión manual y búsquedas por regex. No se probó producción.

## Pendiente

- **JWT en `localStorage`:** sin sinks XSS y con la CSP el riesgo baja, pero un XSS futuro podría leerlo. Decidir las cookies HttpOnly junto con la rama `feat/supabase-auth`, que también modifica `session.interceptor.ts` y tendrá conflicto con esta rama.

## Otros bugs encontrados (no son de seguridad y no se corrigieron)

1. **El mapa no funciona (`L.map is not a function`)**, ni en desarrollo ni en producción: `map-picker.component.ts` usa `await import('leaflet')`, y el módulo solo expone `default`. Rompe el selector de ubicación en el registro y en sucursales.
2. **Estados de reserva con IDs equivocados:** `home.component.html` tiene fijos los valores 1 a 5, que no coinciden con `schema.sql`. Elegir "Cancelada" envía el 3, que es **Pagado**; "Completada" envía el 4, **Pendiente**; "No asistió" envía el 5, **Cancelada**. El aviso "la hora vuelve a quedar libre" también usa el 3.
3. **Recargar `/admin/*` lleva a `/login` aunque haya sesión:** las rutas se prerenderizan y `authGuard` se evalúa sin sesión, así que queda guardada una redirección. Se resuelve con `RenderMode.Client` para esas rutas.

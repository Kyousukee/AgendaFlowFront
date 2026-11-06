# SPEC 05: Auditoría de seguridad Strix (front)

**Fecha:** 2026-11-06 · **Rama:** `security/strix-auditoria` · **Informe de la API:** `agenda-flow-api/specs/03-auditoria-seguridad-strix.md`

Modo `strix-standard`, white-box, con pruebas en Chrome solo en local. Este repositorio es público, así que el informe no incluye pasos de explotación.

## Despliegue

Esta rama y la de la API **deben desplegarse juntas**: el front actual deja de funcionar contra la API nueva, y al revés.

- **`allowedHosts`:** se configuró `agendaflow.cl` y `www.agendaflow.cl`, deducidos de `api.agendaflow.cl`. **Hay que confirmar el dominio real.** Para probar el SSR en local: `NG_ALLOWED_HOSTS=localhost`.
- **Cabeceras de seguridad:** las envía `server.ts` solo cuando corre como servidor propio. Un despliegue que importe `reqHandler` (por ejemplo, Cloud Functions) debe enviarlas por su cuenta.

## Hallazgos de seguridad (corregidos)

| ID | Severidad | Hallazgo | Corrección |
|---|---|---|---|
| C1 | Crítica | La página pública descargaba todas las reservas con datos de clientes y las imprimía en la consola | Usa `/reservar/ocupacion`, que solo trae las horas tomadas |
| C2 | Crítica | El panel cambiaba estados por una ruta pública | Nuevo `ReservasService` del panel, con sesión |
| A2 | Alta | El front enviaba `precio` y `horaFin`, y la API confiaba en ellos | Ya no se envían; los calcula la API |
| A3 | Alta | `authInterceptor` adjuntaba el JWT a todas las peticiones, incluido Nominatim | El token solo viaja a `environment.apiUrl`; un 401 externo ya no cierra la sesión |
| M4 | Media | El SSR no enviaba cabeceras de seguridad | CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy` y HSTS en producción |
| M6 | Media | Faltaba `fileReplacements`: la build de producción apuntaba a `http://localhost:3000` | Añadido; el bundle usa `api.agendaflow.cl` |
| B1 | Baja | `console.log` con datos de negocio | Eliminados |

**Sobre A3:** la fuga era latente porque el mapa estaba roto y geocoding no se disparaba desde la interfaz. Con el mapa ya arreglado, se comprobó en el flujo real que la petición a Nominatim sale sin token.

### Decisiones sobre la CSP

La CSP queda **en modo estricto, sin `Report-Only`**. Para lograrlo, en producción:

- **`provideClientHydration(withNoIncrementalHydration())`:** Angular inyectaba scripts inline de *event replay*, y las páginas prerenderizadas no pueden llevar nonce. **Efecto:** un clic hecho antes de que termine la hidratación ya no se reproduce después.
- **`inlineCritical: false`:** el CSS crítico inline carga las hojas de estilo con un manejador `onload`, que la CSP bloquearía. **Efecto:** el primer pintado puede tardar algo más.

`style-src` mantiene `'unsafe-inline'` porque Angular y Leaflet usan estilos en línea. `script-src` no lo permite.

## Bugs funcionales (corregidos)

1. **Mapa roto (`L.map is not a function`):** `import('leaflet')` solo expone `default`, Leaflet se montaba en el host en lugar de en `#mapContainer`, y el icono del marcador no cargaba. Corregidos los tres.
2. **IDs de estado de reserva equivocados:** las opciones del panel no coincidían con `schema.sql`. Ahora salen de `core/constants/estados-reserva.ts`, con los nombres reales del catálogo. "Confirmada" y "No asistió" desaparecen porque no existen en la base. Las tres opciones que liberan la hora piden confirmación.
3. **Recargar `/admin/*` llevaba a `/login`:** las rutas se prerenderizaban con `authGuard` sin sesión. Ahora usan `RenderMode.Client` y el guard decide en el navegador.

## Verificación

- **Chrome, build de desarrollo contra API local:** reserva completa, hora ocupada no ofrecida, login, listado en el panel, Cancelada guardada como tal y hora liberada.
- **Chrome, build de producción contra API local:** recarga y acceso directo a `/admin/*`, mapa con clic y dirección rellenada, Nominatim sin `Authorization`, y panel sin violaciones de CSP.
- **Chrome, build de producción, páginas públicas:** `/`, `/login`, `/register`, `/terminos` y `/privacidad` sin violaciones de CSP y con estilos cargados.
- **`ng test`:** 9 de 10. Falla `app.spec.ts`, que busca un "Hello" de la plantilla inicial; ni el test ni `app.html` cambian en esta rama.
- **`npm audit --omit=dev`:** 0 vulnerabilidades.
- **Sin sinks XSS:** no se usa `innerHTML` ni `bypassSecurityTrust`.

**Sin probar:** el flujo de reserva pública bajo la CSP en la build de producción (sí en desarrollo, con la misma política) y el mapa en la pantalla de registro (mismo componente, probado en sucursales).

## Límites de la auditoría

`semgrep`, `gitleaks` y `trivy` no estaban instalados; se sustituyeron por revisión manual y búsquedas por regex. No se probó producción.

## Pendiente

- **Estados de pago:** mismo problema que el de reservas, pero **sin corregir**, porque el catálogo no tiene estados de tipo `Pago`. El panel envía los IDs 6 a 9, que son Rechazado, Anulado, Usuario/Activo y Usuario/Inactivo, y cada pago nuevo se guarda con el ID 1 (Programada). Requiere añadir esos estados en la API y la base, y una decisión sobre los pagos ya guardados.
- **Datos ya guardados:** las reservas que se marcaron con las opciones antiguas conservan el estado equivocado (por ejemplo, "Cancelada" quedó como Pagado). No se pueden distinguir automáticamente de los pagos reales, así que hay que revisarlas a mano.
- **JWT en `localStorage`:** sin sinks XSS y con la CSP el riesgo baja, pero un XSS futuro podría leerlo. Decidir las cookies HttpOnly junto con la rama `feat/supabase-auth`, que también modifica `session.interceptor.ts` y tendrá conflicto con esta rama.

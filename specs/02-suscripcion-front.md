# SPEC 02 — Suscripción en el front: avisos, errores de límite y estado del plan

> **Estado:** Aprobado
> **Depende de:** SPEC 01 (`agenda-flow-api/specs/01-suscripciones-y-limites.md`)
> **Fecha:** 2026-11-03
> **Objetivo:** Que el panel de administración muestre el plan vigente, avise cuando está por vencer, explique los errores de límite y marque lo desactivado por la suscripción, consumiendo lo que expone el back del SPEC 01.

## Por qué existe este spec

El SPEC 01 deja toda la lógica de suscripción en el back. Sin cambios en el front pasan dos cosas:

- Un `403 SUSCRIPCION_LIMITE` se pierde en silencio. Las páginas llaman a `crear(...).subscribe(() => ...)` sin manejar el error, y el diálogo ya se cerró.
- El dueño no se entera de que su prueba vence ni de por qué algunos registros quedaron inactivos.

Este spec solo **consume** el contrato del SPEC 01. No agrega lógica de negocio en el front.

## Alcance

**Entra:**

- Servicio `SuscripcionService` que carga `GET /suscripcion` y guarda el resultado en un signal.
- Interceptor `suscripcionInterceptor`: ante un `403` con `code === 'SUSCRIPCION_LIMITE'` muestra un `MatSnackBar` con el mensaje del back y una acción "Ver plan", y recarga la suscripción.
- Banner de aviso en el layout del admin, sobre el `<router-outlet>`, cuando `aviso !== null`. Se puede cerrar y no vuelve a aparecer hasta el próximo login.
- Indicador del plan en el footer del sidebar (chip con el plan y los días restantes) que lleva a Configuración.
- Sección "Tu plan" en Configuración: plan, fecha de fin y uso frente al límite de sucursales, empleados y servicios.
- Etiqueta "Desactivado por plan" en las listas de servicios, empleados y sucursales para los registros con `desactivadoPorSuscripcion === true`.
- Botón "Agregar" deshabilitado, con tooltip, cuando el uso del recurso llegó al límite del plan.
- Recargar la suscripción después de crear, editar o eliminar en esas tres páginas, para que el uso se mantenga al día.

**Fuera de alcance (para specs futuros):**

- Pago en línea o checkout. El texto solo dice "Contáctanos para activar el plan Pro", sin un enlace de pago.
- Canal de contacto concreto (WhatsApp o email) en el CTA de Pro.
- Cambios en la landing (`pricing.component`). Los límites mostrados ahí no se tocan.
- Cambios en la página pública de reservas. El back ya oculta la sucursal inactiva y los servicios y empleados inactivos.
- Manejo de errores genérico de las páginas para otros códigos (400, 500). Solo se trata `SUSCRIPCION_LIMITE`.
- Panel de superadmin.

## Modelo de datos

### `src/app/core/interfaces/suscripcion.interface.ts` (nuevo)

```ts
export type PlanSuscripcion = 'Prueba' | 'Gratis' | 'Pro';
export type RecursoLimitado = 'sucursales' | 'empleados' | 'servicios';

export interface Suscripcion {
  plan: PlanSuscripcion;
  sinVencimiento: boolean;
  fechaFin: string | null;
  diasRestantes: number | null;
  porVencer: boolean;
  aviso: string | null;
  limites: Record<RecursoLimitado, number | null>; // null = ilimitado
  uso: Record<RecursoLimitado, number>;
}

export interface SuscripcionLimiteError {
  statusCode: 403;
  code: 'SUSCRIPCION_LIMITE';
  plan: PlanSuscripcion;
  recurso: RecursoLimitado;
  limite: number;
  actual: number;
  message: string;
}
```

### Interfaces existentes (se modifican)

Se agrega `desactivadoPorSuscripcion?: boolean` a:

- `Servicio` (`core/interfaces/servicio.interface.ts`)
- `Empleado` (`core/interfaces/empleado.interface.ts`)
- `Sucursal` (`core/interfaces/sucursal.interface.ts`)

### `src/app/core/services/suscripcion.service.ts` (nuevo)

Estado público:

- `suscripcion = signal<Suscripcion | null>(null)`
- `avisoCerrado = signal<boolean>(...)`, inicializado desde `sessionStorage`.

Computados:

- `mostrarAviso`: es verdadero cuando `suscripcion()?.aviso` no es `null` y `!avisoCerrado()`.
- `limiteAlcanzado(recurso)`: es verdadero cuando `limites[recurso] !== null` y `uso[recurso] >= limites[recurso]`.
- `etiquetaPlan`: según el plan devuelve `'Prueba · N días'`, `'Pro · N días'`, `'Pro'` (sin vencimiento) o `'Gratis'`. Si `diasRestantes` es `0` o menos, muestra `'vence hoy'` en lugar de `'N días'`.

Métodos:

- `cargar()`: hace `GET ${environment.apiUrl}/suscripcion`. Un error se registra en consola y el signal no cambia.
- `cerrarAviso()`: pone `avisoCerrado` en `true` y lo guarda en `sessionStorage`.
- `limpiar()`: pone el signal en `null`, `avisoCerrado` en `false` y borra la clave de `sessionStorage`.

Clave en `sessionStorage`: `agendaflow_aviso_suscripcion_cerrado`. Todo acceso pasa por `isPlatformBrowser`, porque la app usa SSR.

### Integración con `AuthService`

- En `handleLoginResponse` (login y registro), llamar a `suscripcionService.limpiar()` y después a `suscripcionService.cargar()`.
- En el constructor, si ya hay sesión (`token && userJson`), llamar a `cargar()`.
- En `logout()`, llamar a `limpiar()`.

### `src/app/core/interceptors/suscripcion.interceptor.ts` (nuevo)

- Usa `catchError`. Si `error.status === 403 && error.error?.code === 'SUSCRIPCION_LIMITE'`:
  - abre un `MatSnackBar` con `error.error.message`, la acción `'Ver plan'` y una duración de 6000 ms;
  - la acción navega a `/admin/configuracion`;
  - llama a `suscripcionService.cargar()`.
- Siempre vuelve a lanzar el error (`throwError`), para no romper los `subscribe` existentes.
- Se registra en `app.config.ts` después de `sessionInterceptor`.

## Plan de implementación

1. **Interfaces.** Crear `suscripcion.interface.ts` y agregar `desactivadoPorSuscripcion?` a `Servicio`, `Empleado` y `Sucursal`. Compila sin cambios visibles.
2. **`SuscripcionService`.** Crear el servicio con `cargar`, `cerrarAviso`, `limpiar` y los computados. Integrarlo con `AuthService` (login, registro, constructor y logout). Verificar: después del login, la pestaña Network muestra `GET /suscripcion`.
3. **Interceptor.** Crear `suscripcion.interceptor.ts` y registrarlo en `app.config.ts`. Verificar: con la empresa en plan Gratis y 5 servicios, crear un sexto muestra el snackbar con el mensaje del back.
4. **Banner.** En `layout.component.html`, sobre `<router-outlet />`, mostrar el banner cuando `mostrarAviso()`. Lleva el texto de `aviso`, un enlace "Ver plan" a `/admin/configuracion` y un botón cerrar que llama a `cerrarAviso()`. Los estilos van en `layout.component.scss`.
5. **Chip en el sidebar.** En `sidebar__footer`, antes de los datos del usuario, agregar un chip con `etiquetaPlan()` que enlaza a `/admin/configuracion`. Tiene un color por plan: Prueba ámbar, Gratis gris y Pro dorado (el color principal de la app). Si `porVencer`, el chip va en rojo.
6. **Sección "Tu plan" en Configuración.** En `configuracion.component.html`, agregar arriba un bloque con:
   - el plan;
   - la fecha de fin formateada (`dd-MM-yyyy`) o "Sin vencimiento";
   - una fila por recurso con el texto `"3 de 5"` o `"3 · ilimitado"` y una barra de progreso (`mat-progress-bar`) solo cuando hay límite;
   - el texto "Contáctanos para activar el plan Pro" cuando el plan es Gratis o Prueba.
7. **Etiqueta "Desactivado por plan".** En `servicios.component.html`, `empleados.component.html` y `sucursales.component.html`, mostrar una etiqueta con el icono `lock` y el texto "Desactivado por plan" cuando `item.desactivadoPorSuscripcion`.
8. **"Agregar" deshabilitado.** En las tres páginas, los dos botones "Agregar" (cabecera y estado vacío) quedan con `[disabled]="suscripcion.limiteAlcanzado('<recurso>')"` y `matTooltip="Alcanzaste el límite del plan Gratis"` mientras estén deshabilitados.
9. **Refresco del uso.** En las tres páginas, después de cada `crear`, `actualizar` y `eliminar` exitoso, llamar a `suscripcionService.cargar()`.

## Criterios de aceptación

- [ ] Después del login se hace exactamente una llamada a `GET /suscripcion` y el signal queda con los datos.
- [ ] Al recargar la página con sesión iniciada, se vuelve a llamar a `GET /suscripcion`.
- [ ] Con `aviso` distinto de `null`, el banner aparece en todas las páginas del admin con el texto exacto del back.
- [ ] Con `aviso: null`, no aparece ningún banner.
- [ ] Después de cerrar el banner, deja de verse al navegar entre páginas y al recargar (F5).
- [ ] Al cerrar sesión y volver a entrar, el banner aparece de nuevo si el back sigue enviando `aviso`.
- [ ] En plan Gratis con 5 servicios activos, el botón "Agregar servicio" está deshabilitado y muestra el tooltip.
- [ ] En plan Gratis con 4 servicios activos, el botón "Agregar servicio" está habilitado.
- [ ] En Prueba o Pro, ningún botón "Agregar" se deshabilita por suscripción.
- [ ] Si el back responde `403 SUSCRIPCION_LIMITE` (por ejemplo, al reactivar un servicio desde editar), aparece un snackbar con el `message` del back y la acción "Ver plan" lleva a `/admin/configuracion`.
- [ ] Un `403` sin `code: 'SUSCRIPCION_LIMITE'` no muestra el snackbar.
- [ ] Un `403 SUSCRIPCION_LIMITE` no cierra la sesión.
- [ ] El chip del sidebar muestra "Prueba · N días", "Pro · N días", "Pro" o "Gratis" según la respuesta, y lleva a Configuración.
- [ ] Con `porVencer: true`, el chip se ve en rojo.
- [ ] Configuración muestra el plan, la fecha de fin (o "Sin vencimiento") y "X de Y" por recurso. Con límite `null` muestra "ilimitado" y no muestra barra.
- [ ] Los registros con `desactivadoPorSuscripcion: true` muestran la etiqueta "Desactivado por plan" en su lista.
- [ ] Después de crear un servicio, el uso de Configuración y el estado del botón "Agregar" se actualizan sin recargar.
- [ ] `ng build` termina sin errores y la app funciona con SSR (sin errores de `sessionStorage is not defined`).
- [ ] Si `GET /suscripcion` falla (por ejemplo, el back no tiene el SPEC 01 desplegado), el panel funciona igual: sin banner, sin chip y con los botones habilitados.

## Decisiones

- **Sí:** un interceptor global para `SUSCRIPCION_LIMITE`. Cubre las tres páginas y cualquier endpoint futuro sin tocar cada `subscribe`.
- **No:** un manejo de error en cada página. Repite código y es fácil olvidarlo en una página nueva.
- **Sí:** `MatSnackBar`. Angular Material ya está instalado y lo indica la convención de `AGENTS.md`.
- **No:** agregar Sonner u otra librería de toasts. Sería una dependencia nueva para un solo uso.
- **Sí:** el banner se cierra por sesión con `sessionStorage`, y `limpiar()` en login y logout lo resetea. Avisa sin volverse molesto.
- **No:** un banner fijo que no se puede cerrar.
- **Sí:** el front no calcula días, límites ni textos de aviso; los muestra tal como vienen. La fuente de verdad es el back (SPEC 01).
- **Sí:** el botón "Agregar" deshabilitado es solo una mejora de UX. El back sigue validando. Si el signal está desactualizado, el interceptor cubre el caso.
- **Sí:** `SuscripcionService` vive en `core/`, porque lo usan el layout, el interceptor, Configuración y tres páginas.
- **Sí:** el CTA de Pro es solo texto, sin enlace. El canal de contacto todavía no está definido y va en otro spec.
- **Sí:** `desactivadoPorSuscripcion` es opcional (`?`) en las interfaces, para no romper si el back aún no lo envía.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `sessionStorage` no existe en SSR | Todo acceso pasa por `isPlatformBrowser`. En el servidor `avisoCerrado` parte en `false` y no se muestra nada hasta que `cargar()` corre en el navegador. |
| El front se despliega antes que el back con el SPEC 01 | `cargar()` ignora el error y el signal queda en `null`. Banner, chip y bloqueos no se activan. |
| El signal queda desactualizado (otro usuario creó algo) | El back valida siempre. El interceptor muestra el error y recarga el signal. |
| El snackbar se abre dos veces por requests simultáneos | Se acepta. `MatSnackBar` reemplaza el snackbar anterior, así que solo queda uno visible. |

## Qué **no** entra en este spec

- Pago en línea o checkout.
- Canal de contacto (WhatsApp o email) en el CTA de Pro.
- Cambios en la landing o en la página pública de reservas.
- Manejo genérico de otros errores HTTP.
- Panel de superadmin.

Cada uno, si se hace, va en su propio spec.

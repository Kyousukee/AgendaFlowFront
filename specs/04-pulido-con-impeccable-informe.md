# SPEC 04 — Informe de impeccable

Anexo de `specs/04-pulido-con-impeccable.md`. Es el contrato de lo que se arregla en los pasos 5 a 9.

## Antes (2026-11-05)

### Cómo se hizo

- **Critique:** `Method: dual-agent`. Para cada área corrieron dos subagentes aislados:
  - **A**, la revisión de diseño, sin ver el detector.
  - **B**, el detector más la evidencia del navegador.

  La síntesis se hizo después, en el hilo principal.
- **Evidencia:** capturas a 375 y 1440 px de las 14 pantallas, con Chrome headless por CDP (`prefers-reduced-motion` activo). El admin se capturó con sesión real (`barberia-jose`) y navegando dentro de la app.
- **Métricas medidas en el navegador:**
  - contraste AA;
  - objetivos de menos de 44 y de 24 px;
  - campos sin label e imágenes sin alt;
  - botones sin nombre;
  - headings, landmarks y overflow horizontal.
- **Detectores:**
  - `impeccable detect --cdp` sobre cada página renderizada;
  - `impeccable detect --json src/app` sobre el código, con 175 hallazgos.
- **Lo que no se renderizó**, y por eso se evaluó solo desde el código:
  - los pasos 2 a 4 de la reserva y su confirmación;
  - los 5 diálogos y el modal de pago de Inicio;
  - Bloqueos con datos;
  - el selector con más de una sucursal.

### Falsos positivos descartados en todas las áreas

- **"text color rgb(0,0,0)"** (24 casos): el análisis estático no resuelve las variables CSS.
- **`broken-image`** (5 casos): son `<img [src]>` con binding de Angular y todos tienen `alt`.
- **`bounce-easing` en Configuración:** viene de los keyframes de `mat-progress-bar` indeterminado. La página usa el modo determinado.
- **Contraste de `how__text` en la landing:** el texto va absoluto sobre el segmento hueso y el contraste real es ~15:1.
- **"off the DESIGN.md type ramp" y radios de 8, 10 y 12 px** (~110 casos): casi todos son **huecos de documentación**. El frontmatter de `DESIGN.md` es más corto que la escala real. Se resuelve en el paso 5 documentando los valores. La deriva real se lista por área.

### Puntajes

| Área | Critique (heurísticas) | Audit (5 dimensiones) | P0 | P1 |
| --- | --- | --- | --- | --- |
| Landing | 22/32 (n/a: 7 y 10) | 14/20 | 0 | 3 |
| Legales | 22/32 (n/a: 5 y 9) | 16/20 | 0 | 0 |
| Auth | 23/40 | 11/20 | 0 | 6 |
| Reserva pública | 21/40 | 11/20 | 1 | 7 |
| Panel admin | 21/40 | 10/20 | 0 | 10 |

El audit puntúa de 0 a 4 cada dimensión, en este orden: A11y, Performance, Theming, Responsive e Integridad. El desglose está en cada área. Performance no se midió en profundidad: se estimó desde el código (imágenes WebP con lazy loading, sin animaciones de layout).

---

### Landing

- **Critique:** 22/32. Las heurísticas puntúan 3-3-3-2-2-3-n/a-3-3-n/a.
- **Audit:** 14/20. A11y 3 · Perf 3 · Theming 3 · Responsive 2 · Integridad 3.
- **Especificidad:** alta. La metáfora de la libreta llega a la estructura: el eje, la comparación contra la libreta y WhatsApp, y el showcase con HTML real. La excepción es el copy de pricing.

**Audit y critique:**

- **P1 → aceptado con motivo** — Pricing promete "analíticas avanzadas" y "soporte prioritario", que no están en las capacidades de PRODUCT.md. Describe los límites como "horarios", cuando los reales son sucursales, empleados y servicios. Además, Gratis dice "Para probar" aunque "no vence". — `pricing.component.html:8-11, 23-27` — **El usuario decidió no tocar pricing (2026-11-05).** Queda fuera de este spec.
- **P1 → aceptado con motivo (botón) / `clarify` (FAQ)** — "Empezar con Pro" lleva a `/register`, que no activa Pro, y "escríbenos" no dice a dónde. — `pricing.component.html:29-32` — El botón queda igual porque pricing no se toca. El canal de contacto, cuando el usuario lo confirme, va en el FAQ y en el footer. Cambiar el FAQ es [TS] y queda pendiente.
- **P1** — A 375 px, `.sheet` mide 560 px fijos y el showcase corta las opciones y el botón: dice "Confirmar corte + barba a las" sin la hora. En escritorio recorta ~110 px abajo. — `showcase.component.scss:59-71, 86-90, 349-363` — `adapt`
- **P2** — La página nunca explica la prueba: dice "Dos planes", pero el FAQ habla de "la prueba". — `pricing.component.html:2` — `onboard` (falta un dato: la duración)
- **P2** — `aria-live` está sobre toda la hoja del showcase, así que relee la hoja entera en cada toque. A la salida activa le falta `aria-current`. — `showcase.component.html:3-23` — `harden`
- **P2** — "Volver arriba" mide 81×21 y las pestañas del showcase miden 24 px de alto en móvil. — `footer.component.scss:88-90`, `showcase.component.scss:40-56` — `adapt`
- **P3** — El foco dorado no llega al menú móvil porque el selector está anidado en `.navbar`. — `navbar.component.scss:144-148` — `polish`
- **P3** — Hay enlaces de la navbar y del footer de 24 px de alto, el menú mide 56×38 y `hero__link` 27 px. Pasan AA por spacing. — `adapt`
- **P3** — Stragglers en `features__lead`, `faq__item` y `cta__text`. — `polish` (`text-wrap: pretty`)
- **P3** — Hay 7 hex sin token en la maqueta del showcase. El contraste pasa. — `showcase.component.scss` — `polish`
- **P3** — `aria-controls` apunta a un id que no existe con el menú cerrado. — `navbar.component.html:22` — `harden`
- **P3** — En móvil, `how__text` va absoluto y es frágil. — `how-it-works.component.scss:104-110` — `harden`
- **P3** — El botón deshabilitado del showcase dice "Elige otro servicio". Debería decir "Elige una hora". — `showcase.component.html:76` — `clarify`
- **P3** — Hay más de un campo dorado por pantalla en rubros (Cosmetología y Pestañas). — `rubros` — `polish`
- **P3** — El CTA del hero queda en el pliegue a 1440×900. — `hero.component.scss:15` — `adapt`
- **P3** — Copy: "Comenzar gratis" en lugar de "Empezar gratis", y "a la vista de todos" es ambiguo. "Volver arriba" usa `href="#"`. — `clarify`

### Legales

- **Critique:** 22/32. Las heurísticas puntúan 2-3-3-3-n/a-3-2-3-n/a-3.
- **Audit:** 16/20. A11y 3 · Perf 3 · Theming 3 · Responsive 3 · Integridad 4.
- **Especificidad:** media. El margen del eje solo sostiene un índice genérico.

**Audit y critique:**

- **P2** — En móvil, el índice abierto ocupa todo el primer viewport y no hay forma de volver a él. (A lo propuso como P1; B no encuentra violación AA. Queda en P2.) — `legal-page.component.html/.scss` — `adapt` (`<details>` y "Volver al índice")
- **P2** — El índice móvil tiene `border-radius: 10px`, lo que rompe la Regla de los Dos Registros, y sus enlaces miden ~23 px. — `legal-page.component.scss` — `polish` y `adapt`
- **P2** — `word-break: break-all` parte las claves de almacenamiento a la mitad. — `legal-page.component.scss` — `polish`
- **P3** — Los stragglers se resuelven con `text-wrap: pretty`, porque el texto legal no se edita. — `legal-page.component.scss:129-134` — `polish`
- **P3** — El h3 mide 1.0625 rem y es más chico que el cuerpo (1.125 rem). El cuerpo no usa `--step-body`. — `legal-page.component.scss:125-134, 216` — `polish`
- **P3** — Los enlaces del cuerpo no tienen el foco dorado. — `legal-page.component.scss:153-157` — `harden`
- **P3** — "Volver arriba", el botón de menú y el logo miden menos de 44 px. Es la misma causa que en la landing. — `adapt`
- **P3** — Falta `<time datetime>`, no hay cruce a la otra página legal (es copy de UI, no legal) y falta `@media print`. — `polish` y `clarify`
- **Escalado, no se toca:** Términos menciona "analíticas avanzadas", "soporte prioritario" y "recordatorios automáticos". Va para el abogado y el dueño.

### Auth

- **Critique:** 23/40. Las heurísticas puntúan 2-3-3-2-2-3-2-3-2-1.
- **Audit:** 11/20. A11y 1 · Perf 3 · Theming 3 · Responsive 2 · Integridad 2.
- **Especificidad:** el esqueleto es genérico (pantalla partida) y la piel es propia. Para Operate es correcto.

**Audit y critique:**

- **P1** — El toggle de contraseña no tiene nombre accesible y aparece 3 veces. — `login.component.html:53`, `register.component.html:111, 161` — `harden` (`aria-label` dinámico con el signal que ya existe, más `aria-pressed`)
- **P1** — El login comunica el error solo con color, sin texto. Si el formulario es inválido, el envío falla en silencio. — `login.component.html:24-51` — `harden` y `clarify` (en el template: `(ngSubmit)="form.markAllAsTouched(); onSubmit()"` y un `.form-error` por campo)
- **P1** — Los errores no están asociados al campo (faltan `aria-invalid` y `aria-describedby`) y los banners no tienen `role="alert"`. — login y register — `harden`
- **P1** — No hay ningún `autocomplete`, y el teléfono no tiene `inputmode`. Falla 1.3.5. — login y register — `harden`
- **P1** — Los enlaces de términos y privacidad se distinguen del texto gris solo por el color (~1.5:1, falla 1.4.1). El checkbox mide 12 a 18 px. — `_auth.scss:233-248` — `polish` y `adapt` (subrayado permanente; checkbox con `flex-shrink: 0` y etiqueta de 44 px)
- **P1** — "Recordarme" no hace nada y "¿Olvidaste tu contraseña?" apunta a `href="#"`. Contradice "solo se dice lo que existe". — `login.component.html:89-95` — `clarify` (falta un dato: el contacto)
- **P1 [requiere TS]** — El checkbox de términos no está en el formulario reactivo, así que **se puede crear una cuenta sin aceptarlos**. — `register.component.html:206-209`, `register.component.ts:67` → Pendientes con lógica
- **P2** — "Continuar" está deshabilitado y no explica qué falta. El error de la API del paso 3 aparece arriba, sin un camino de vuelta al paso 1. — `register.component.html:47, 211-218, 276-283` — `clarify` y `harden` (en el template: `(click)` con `markAllAsTouched` y el botón "Revisar mis datos")
- **P2** — Falta el landmark `main`. — `auth__right` — `harden`
- **P2** — El borde del input en reposo (#333) da 1.57:1 sobre el fondo y falla 1.4.11. — `_auth.scss:149` — `polish` (también en la base global)
- **P2** — El label del mapa no está asociado a nada. — `register.component.html:357` — `harden`
- **P2** — El requisito de la contraseña está solo en el placeholder. — `register.component.html:107` — `clarify`
- **P2** — El stepper no es semántico y el cambio de paso no se anuncia. — `register.component.html:22-45` — `onboard` (`aria-current` y `aria-live`; mover el foco es [TS])
- **P2** — A 375 px, la franja de foto (30svh) y el texto promocional empujan el formulario bajo el pliegue. — `_auth.scss:402` — `adapt`
- **P2 [requiere TS]** — Las dos rutas tienen el mismo `<title>`. — `auth.routes.ts` → Pendientes
- **P3** — Hay `.form-link`, `.auth__logo` y un checkbox sin foco dorado. Los colores de error no tienen token. "Bienvenido" tiene género y "credenciales" es jerga. "(opcional)" es inconsistente en el paso 3. No hay aviso de que el enlace abre una pestaña nueva. — `polish` y `clarify`

### Reserva pública

- **Critique:** 21/40. Las heurísticas puntúan 2-3-3-2-2-3-1-3-1-1.
- **Audit:** 11/20. A11y 2 · Perf 3 · Theming 3 · Responsive 2 · Integridad 1.
- **Especificidad:** la piel es específica y la forma es un stepper genérico. Para Operate es correcto.

**Audit y critique:**

- **P0 [requiere TS]** — Si falla `crearReserva`, solo se ejecuta `guardando.set(false)`. El cliente no sabe si reservó. — `reservar-form.component.ts:187-189` → **consultar al usuario** (riesgo del spec)
- **P1** — `src/index.html` tiene `lang="en"` y el contenido de toda la app está en español (3.1.1). — `harden` (base global)
- **P1** — Hay dos `[class.btn--hidden]` en "Siguiente", lo que anula la condición del paso 2 y deja avanzar sin profesional, con un falso "No hay horas". Además, `display:none` pierde el foco. — `reservar-form.component.html:308-316` — `harden` (en el template: un solo `[disabled]`)
- **P1** — La selección de servicio, profesional, día y hora no se expone (falta `aria-pressed`). — `reservar-form.component.html:96, 126, 156, 175` — `harden`
- **P1** — Los datos del cliente no tienen `autocomplete` ni `inputmode`. — `reservar-form.component.html:199-254` — `harden`
- **P1** — Los errores no están asociados al campo y lo obligatorio solo se marca con "*". — `reservar-form.component.html:199-254` — `harden`
- **P1** — A 375 px el header sticky mide ~126 px y `scroll-padding-top` mide 72 px, así que el foco queda tapado (2.4.11). — `reservar-page.component.scss:57-63` — `adapt`
- **P1** — "Confirmar" está deshabilitado y no explica qué falta. — `reservar-form.component.html:318-321` — `clarify` (pista visible con `@if (form.invalid)`)
- **P2** — Hay unas 26 fechas en 9 filas a 375 px, y las horas quedan bajo el pliegue. — `reservar-form.component.scss:231-235` — `adapt` (fila horizontal con scroll-snap)
- **P2** — El cambio de paso no se anuncia, el indicador no tiene `aria-current` y no existe una clase `.sr-only` global. — `reservar-form.component.html:62-86` — `harden`
- **P2** — Los labels "Fecha" y "Hora" no tienen control y los grupos de chips no tienen nombre. — `reservar-form.component.html:153, 169` — `harden`
- **P2** — Los bordes de inputs, tarjetas y chips dan 1.38 a 1.57:1 y fallan 1.4.11. — `reservar-form.component.scss:119, 247, 309` — `polish`
- **P2** — No hay `@empty` en servicios ni en fechas. — `harden` y `clarify`
- **P2** — La confirmación no se anuncia, no repite qué se reservó ni cuándo, y promete un correo (falta un dato: si el backend lo envía). — `reservar-confirmacion` — `clarify` (`role="status"`). Repetir el resumen y mover el foco es [TS].
- **P2** — Carga y error no tienen `role`, quedan fuera de `main`, el título del error es fijo y no hay botón de reintentar. — `reservar-page.component.html:2-11` — `harden` y `clarify`
- **P3** — "Empleado" en lugar de "profesional", "Email" en lugar de "correo", y la observación tiene un copy confuso. Las flechas "→" se leen en voz alta. El logo mide 48×48 con `contain`. Hay tokens de error y de hover sin definir. — `clarify` y `polish`

### Panel admin

- **Critique:** 21/40. Las heurísticas puntúan 2-3-2-2-1-3-1-3-2-2.
- **Audit:** 10/20. A11y 1 · Perf 3 · Theming 2 · Responsive 2 · Integridad 2.
- **Especificidad:** media. La identidad está en la piel y no llega a la composición.

**Audit y critique:**

- **P1** — Los botones de ícono editar y eliminar no tienen nombre accesible, porque el tooltip no cuenta como nombre. — `servicios.html:81, 84`, `empleados.html:89, 92`, `sucursales.html:87, 90`, `bloqueos.html:94, 97` — `harden`
- **P1** — Eliminar no pide confirmación ni maneja errores. — `servicios.ts:105`, `empleados.ts:134`, `sucursales.ts:88`, `bloqueos.ts:156` — **[requiere TS]** → consultar
- **P1** — El modal de pago de Inicio está hecho a mano: no tiene `role="dialog"`, no atrapa el foco, Esc no lo cierra y sus labels no tienen `for`. — `home.component.html:130-323` — `harden` (rol, Esc y labels en el template; atrapar el foco o migrarlo a MatDialog es [TS])
- **P1** — Hay `div[role=button]` que no se activan con teclado. — `home.component.html:101, 217` — `harden` (`keydown.enter` y `keydown.space`)
- **P1** — Hay labels sin `for`/`id` en los filtros de Pagos y Bloqueos, en Horarios (24 controles), en Configuración y en el modal de Inicio. — `harden`
- **P1** — Los `mat-slide-toggle` de Horarios no tienen nombre, el logout a 900 px o menos tampoco, y faltan nombre y estado en `modal__back` y en las muestras de color. — `harden`
- **P1** — El texto del servicio en la agenda usa el color del servicio, que da 3.60:1 con `#6B7280`. — `home.component.html:103` — `polish`
- **P1** — "Horario habitual" está escrito a mano en el template y muestra un horario falso. — `horarios.component.html:110-126` — `clarify` (quitarlo o generarlo con `@for` desde los datos)
- **P1** — A 375 px hay objetivos de menos de 44 px: `.btn` 36, `.btn--sm` 30, `.action-btn` y `.dialog__close` 32, filtros 36, el chip de plan 29, el cierre del aviso 32 y el logout 40. — `_admin.scss`, `layout.component.scss` — `adapt` (base global)
- **P2** — El motivo del límite de plan solo aparece en un tooltip que no se alcanza con teclado ni toque. — servicios, empleados y sucursales — `clarify` y `onboard` (nota visible)
- **P2** — Hay saltos de h1 a h3 en 7 páginas. — `polish` (cambiar a `h2`; los estilos van por clase)
- **P2** — `reserva-detail-dialog` no tiene botón de cierre visible ni `mat-dialog-title`. Los demás diálogos tampoco usan `mat-dialog-title`. — `harden`
- **P2** — Las filas de Servicios se rompen a 1440 (`mat-card` en columna) y los anchos máximos no coinciden (1080, 1152 y 1280). — `polish`
- **P2** — En Inicio, la línea de tiempo llega al 146 % del viewport y a 375 px "0 citas" queda al final. — `home.component.scss:96-114, 578-584` — `adapt`
- **P2** — Los vacíos de Pagos e Inicio no ofrecen un siguiente paso, y el copy de los vacíos de las listas suena a plantilla. — `onboard`
- **P2** — A 375 px hay ~330 px de chrome antes del título y "Configuración" sale truncada. — `layout.component.scss` — `adapt`
- **P3** — Hay deriva de radios (4, 11, 12 y 8 px en botones) y de tamaños (1.0625 rem, 22, 24 y 44 px, y `16px` mezclado con `1rem`). Hay rojos y ámbar fuera de la paleta (`#b91c1c`, `#dc2626` y `#f59e0b`). — `polish`
- **P3** — Varios elementos no tienen foco dorado: `.btn-copy`, `.modal__*`, los del aviso, `.filter-clear` y `.search-clear`. — `polish`
- **P3** — Copy: "Slots libres", "Link", "Gestión de…", "Crear" en lugar de "Agregar", "Actualizar" en lugar de "Guardar", el copy de Bloqueos y las tildes del diálogo de empleado. — `clarify`
- **P3** — `side-tab` en la agenda (`home.component.scss:269`): es intencional, porque el borde toma el color del servicio. **Se acepta.**

---

## Después (2026-11-05)

### Cómo se hizo

- Se usó el mismo método que en "Antes": `Method: dual-agent`, con 10 subagentes aislados. Las A no vieron el detector, las métricas ni este informe.
- Se volvieron a capturar las 14 pantallas a 375 y 1440 px, con el admin en sesión real.
- Se corrió el detector por CDP sobre cada pantalla y `detect --json src/app` sobre el código.
- Se probaron en el navegador los flujos de la auth y de la reserva (hasta el paso de datos, sin crear reservas), los diálogos con teclado y la confirmación al eliminar, cancelada, así que no se borró nada.
- Los P1 que aparecieron en la revisión final y se podían arreglar con template o copy se corrigieron en la misma pasada. Están anotados como "arreglado en el paso 10".

### Números globales

| Medida | Antes | Después |
| --- | --- | --- |
| Hallazgos del detector por CDP (14 pantallas) | 17 | **1** (`bounce-easing`, falso positivo) |
| Hallazgos del detector sobre el código (`src/app`) | 175 | **47** (casi todos falsos positivos: "rgb(0,0,0)" y `[src]`) |
| Pantallas con scroll horizontal a 375 | 0 | 0 |
| Textos bajo contraste AA | 1 (falso positivo) | 0 |
| Botones sin nombre accesible | 31 | **0** |
| Campos sin label | 66 | **0** |
| Objetivos de menos de 24 px | 21 | 2 (el cuadro del checkbox de términos: su label completo de 343×65 es el objetivo) |

### Puntajes

| Área | Critique antes | Critique después | Audit antes | Audit después | P0 | P1 que quedan |
| --- | --- | --- | --- | --- | --- | --- |
| Landing | 22/32 (69 %) | **27/36 (75 %)** | 14/20 | 17/20 | 0 | 0 |
| Legales | 22/32 (69 %) | **23/32 (72 %)** | 16/20 | 18/20 | 0 | 0 |
| Auth | 23/40 (57 %) | **27/40 (67 %)** | 11/20 | 16/20 | 0 | 0 (1 aceptado con motivo) |
| Reserva pública | 21/40 (52 %) | **27/40 (67 %)** | 11/20 | 17/20 | 0 | 0 |
| Panel admin | 21/40 (52 %) | **23/40 (57 %)** | 10/20 | 16/20 | 0 | 0 |

- En las 5 áreas el puntaje de critique subió.
- En la landing, el máximo aplicable cambió de /32 a /36, porque esta vez la heurística 10 sí aplica. Por eso se compara por porcentaje.

### Estado de los hallazgos de "Antes"

**Landing**

- Showcase cortado a 375: arreglado (paso 6).
- Objetivos táctiles de la navbar, el footer, el hero y el showcase: arreglados (paso 6).
- `aria-live` de la hoja, `aria-controls` y foco del menú móvil: arreglados (paso 6).
- Stragglers: arreglados (paso 5).
- `how__text` frágil: arreglado (paso 6).
- "Elige una hora": arreglado (paso 6).
- Tokens de la hoja: arreglados (paso 6).
- CTA del hero bajo el pliegue: arreglado (paso 6).
- "a la vista de todos": arreglado (paso 6).
- Pricing (las promesas, "Empezar con Pro" y "Comenzar gratis"): **aceptado con motivo**. El usuario decidió no tocarlo.
- Prueba sin explicar y canal de contacto en el FAQ: **pendiente**, porque falta el dato del usuario y es [TS].
- Dos campos dorados en rubros: **pendiente** [TS].

**Hallazgos nuevos del paso 10 en la landing:**

- Rubros prometía "abonos" y planes "por sesión": **arreglado en el paso 10**, con copy.
- El foco de la hoja del showcase daba 2.6:1: **arreglado en el paso 10**.
- Los enlaces de créditos no se distinguían del texto (1.4.1): **arreglado en el paso 10**.
- `aria-current` duplicado: **arreglado en el paso 10**.

**Legales**

- Índice en móvil (panel, radio y altura): arreglado (paso 6).
- Claves cortadas: arreglado (paso 6), aunque en escritorio todavía se cortan en la columna angosta (P3, pendiente).
- Jerarquía h3 y `--step-body`: arreglado (paso 6).
- Stragglers: arreglado (paso 5).
- "Ver también" e impresión: arreglado (paso 6).
- "Volver al índice": arreglado (paso 6).
- La reserva no enlazaba a los legales (P1 nuevo): **arreglado en el paso 10**, con una nota y enlaces en el paso de datos.
- El atajo fijo tapa texto y el foco no se mueve a la sección: **pendiente** (P2, [TS]).
- Lo que quedó en gris al imprimir: P3, pendiente.

**Auth**

- Toggle sin nombre: arreglado (paso 7).
- Errores silenciosos o solo por color: arreglado (paso 7).
- `role="alert"`, `aria-invalid` y `aria-describedby`: arreglado (paso 7).
- `autocomplete`: arreglado (paso 7).
- Enlaces solo por color: arreglado (paso 7).
- Checkbox de 12 a 18 px: arreglado (paso 7).
- `main`: arreglado (paso 7).
- Ayuda de contraseña: arreglado (paso 7).
- Stepper: arreglado (paso 7).
- "Continuar" mudo: arreglado (paso 7).
- Banner del paso 3: arreglado (paso 7).
- Franja de foto en móvil: arreglado (pasos 7 y 10).
- Términos que no bloqueaban el registro: arreglado (TS autorizado).
- "Recordarme" y "¿Olvidaste tu contraseña?" falsos: se quitaron (paso 7). **Queda un P1:** el login no tiene salida para quien olvidó su contraseña. No se puede arreglar sin un canal real de recuperación o de contacto, que el usuario no entregó.
- `<title>` por ruta: **pendiente** [TS].

**Reserva pública**

- P0 de la falla silenciosa al confirmar: arreglado (TS autorizado, `errorReserva` con `role="alert"`).
- Doble `btn--hidden`: arreglado (paso 7).
- `aria-pressed`, grupos con nombre y `@empty`: arreglado (paso 7).
- Errores asociados y `autocomplete`: arreglado (paso 7).
- Cabecera sticky que tapaba el foco: arreglado (paso 7).
- "Confirmar" mudo: arreglado (paso 7).
- Muro de fechas: arreglado (paso 7).
- Bordes 1.4.11: arreglado (paso 7).
- Carga y error sin `role`: arreglado (paso 7).
- Copy: arreglado (paso 7).
- Promesa de correo: se quitó.
- "Volver a intentar" con `href=""` llevaba a la landing por `<base href="/">`: **arreglado en el paso 10**, se quitó el enlace.
- Landmark de carga y error: **arreglado en el paso 10**.
- La confirmación no repetía qué se reservó ni cuándo (P1): **arreglado en la segunda ampliación**. `reservaCreada` emite un `ReservaResumen` y la confirmación muestra el servicio, cuándo, con quién y dónde. Se verificó en el navegador con la API interceptada, sin crear reservas reales. Con la falla simulada (500), aparece el aviso y se conservan los datos.

**Panel admin**

- Botones de ícono sin nombre: arreglado (pasos 8 y 9).
- Eliminar sin confirmación: arreglado (TS autorizado).
- Modal de pago no accesible: arreglado (paso 8 y TS autorizado `cdkTrapFocus`). Sus controles miden 44 px en móvil desde el paso 10.
- `div[role=button]` sin teclado: arreglado (paso 8).
- Labels huérfanos: arreglado (pasos 8 y 9).
- Toggles, cierre de sesión y muestras de color: arreglado (pasos 8 y 9).
- Contraste de `.slot__servicio`: arreglado (paso 8).
- "Horario habitual" falso: arreglado (paso 9).
- Objetivos de 44 px a ≤900: arreglado (pasos 5, 8 y 9).
- Límite del plan solo en tooltip: arreglado (paso 9). La nota se armaba mal en móvil: **arreglado en el paso 10**.
- Headings: arreglado (pasos 8 y 9).
- `reserva-detail-dialog` y `mat-dialog-title`: arreglado (pasos 8 y 9).
- Filas de Servicios: arreglado (paso 9).
- Inicio en móvil: arreglado (paso 8).
- Vacíos: arreglado (paso 9).
- Deriva de radios, tamaños y rojos: arreglado (pasos 5, 8 y 9).

**Los 3 P1 del diagnóstico final se arreglaron en la segunda ampliación (TS mínimo):**

1. Guardados y cargas silenciosos: Horarios y Configuración avisan con un snackbar y conservan los cambios en pantalla. Crear y editar en las 4 listas avisan si falla, sin duplicar el aviso de límite del interceptor. Las cargas fallidas de las listas avisan, e Inicio muestra "No pudimos cargar todo el día" con "Reintentar" en vez de una agenda libre. Los diálogos siguen cerrándose antes de la respuesta, pero el error ya no es silencioso (anotado en Pendientes).
2. El modal de pago ya no se cierra solo: muestra "Pago registrado" con "Listo" y guarda también el estado de la reserva si quedó elegido. "Guardar estado reserva" pasa a botón secundario, y cancelar una reserva pide confirmación.
3. Los errores de Inicio dicen qué pasó y qué hacer.

### Estado del criterio "sin P0 ni P1"

- **P0: ninguno.**
- **P1: ninguno abierto.** Los 4 que requerían TS se arreglaron en la segunda ampliación autorizada.
- El P1 del login sin recuperación de contraseña queda **aceptado con motivo** por decisión del usuario: no existe un flujo ni un canal confirmado.

Con esto se cumple el criterio "sin P0 ni P1".

### Para escalar (fuera de diseño)

- **Privacidad.** `reservar-page.component.ts` deja en producción un `console.log` con todas las reservas de la sucursal. El endpoint público `/reservar/reservas/:sucursalId` parece devolver datos de clientes. Hay que revisarlo con la Ley 19.628/21.719.
- **Promesas por verificar en Configuración.** "Enviar WhatsApp" y "Permitir pago anticipado" no figuran entre las capacidades de PRODUCT.md.
- **Términos y pricing** mencionan "analíticas avanzadas" y "soporte prioritario". Va para el abogado y el dueño.

## Cambios de tokens

| Token | Antes | Después | Motivo |
| --- | --- | --- | --- |
| `--border-field` (nuevo) | — (campos con `--border-light` #333, 1.57:1) | `#6b6b6b` (3.72:1 sobre tinta y 3.46:1 sobre superficie) | WCAG 1.4.11: el borde de los controles no llegaba a 3:1. `--border-light` se mantiene para las reglas decorativas. |
| `--border-field-hover` (nuevo) | `#4a4a4a` suelto | `#858a93` | Hover del borde de control; antes era un hex sin token. |
| Rol M3 `outline` | `#4a4a4a` | `var(--border-field)` | Los `mat-form-field` outline también tenían menos de 3:1 de contraste. |
| `--error`, `--error-text` y `--error-surface` (nuevos) | `#f87171`, `#fca5a5` y `rgba(239,68,68,.14)` sueltos | Los mismos valores, ahora como tokens | Higiene: había deriva de rojos (`#b91c1c` y `#dc2626` en Configuración). |
| `--warning`, `--success` y sus `*-surface`, más `--neutral-surface` (nuevos) | Valores sueltos en `_admin.scss` | Los mismos valores, ahora como tokens | Higiene de tokens de estado. |
| `--target-min` (nuevo) | — | `44px` | El objetivo táctil mínimo del SPEC 04. |
| `lang` de `index.html` | `en` | `es` | WCAG 3.1.1. Afecta a toda la app. |
| Foco global | Solo por componente | `:where(...):focus-visible` con 2px `--gold-light` | Cubre los controles que no tenían estilo propio. |
| `.btn`, `.action-btn`, filtros, `.form-input` y `.dialog__close` en el admin a 900px o menos | 30 a 40px | 44px | WCAG 2.5.8 y el criterio del spec. La densidad de escritorio no cambia. |
| DESIGN.md (frontmatter) | Escala corta | Se agregan `title-dialog`, `title-empty`, `body-ui`, `body-ui-sm`, `label-sm` y el radio `app-card` (8px) | Cierra ~110 advisories de documentación. Son valores que ya se usaban. |

## TS mínimo autorizado (ampliación del 2026-11-05)

El usuario autorizó arreglar estos cuatro hallazgos en esta rama:

- **P0** — La falla al confirmar la reserva es silenciosa. — `reservar-form.component.ts:187-189` — Se agrega una señal de error con `role="alert"`.
- **P1** — El checkbox de términos no bloquea el registro. — `register.component.ts:67` — Se agrega `terms: [false, Validators.requiredTrue]`.
- **P1** — Eliminar no pide confirmación ni maneja errores. — Las 4 listas del admin — Se agrega un diálogo de confirmación y `error:` con un aviso.
- **P1 (parcial)** — El modal de pago de Inicio no atrapa el foco. — `home.component.ts` — Se agrega `cdkTrapFocus` (`A11yModule`).

## Pendientes con lógica

Son hallazgos que solo se arreglan con TS y salen de este spec.

**P1 resueltos en la segunda ampliación (se conservan como registro):**

- **P1** — La confirmación de la reserva no muestra el servicio, el día, la hora, el profesional ni la dirección. — `reservar-form.component.ts` (`reservaCreada` emite solo el código), `reservar-confirmacion.component.ts` y `reservar-page.component.html`
- **P1** — Horarios y Configuración no avisan si falla el guardado. Los 4 diálogos se cierran con un `setTimeout` antes de que la API responda, y la página no maneja el error. Si la carga falla, se ve un estado vacío o una agenda "Disponible". — `horarios.component.ts:145`, `configuracion.component.ts:176`, `*-dialog.component.ts` y las 4 páginas de listas, `home.component.ts:234`
- **P1** — El modal de pago tiene dos guardados con dos botones dorados y se cierra solo 1,5 s después, descartando el estado elegido. Cambiar la reserva a "Cancelada" no pide confirmación. — `home.component.ts:372` y `home.component.html:290-334`
- **P1** — Los mensajes de error de Inicio son genéricos. — `home.component.ts:308, 345, 376`
- **P1 (dato del usuario)** — El login no ofrece ninguna salida para recuperar la contraseña. Hace falta un canal real (endpoint o contacto).

**P2 nuevos del paso 10:**

- **P2** — Los 4 diálogos de crear y editar se cierran antes de que responda la API. El error ahora se avisa, pero hay que volver a abrir el diálogo y escribir de nuevo. Hace falta mover la llamada dentro del diálogo. — `*-dialog.component.ts` y sus páginas

- **P2** — `passwordMatchValidator` deja pegado el error "no coinciden" si se corrige la contraseña en vez de la confirmación, y "Continuar" no avanza. — `register.component.ts:77-85`
- **P2** — El foco se pierde al cambiar de paso (registro y reserva), al confirmar y al validar vacío. — `register`, `reservar-form` y `reservar-confirmacion`
- **P2** — Los mensajes de error de la API de la auth van sin tildes ("contrasena", "esta registrado"). — `auth.service.ts:108-112, 267-273`
- **P2** — Tras un "hora tomada", la disponibilidad no se refresca. — `reservar-form.component.ts` y `reservar-page.component.ts`
- **P2** — El error de la página de reserva no distingue entre un enlace inválido y una falla de red, y no tiene reintento. — `reservar-page.component.ts`
- **P2** — En Inicio faltan "Hoy" y un salto de fecha. — `home.component.ts`

**Pendientes anteriores:**
- **P2** — La reserva muestra un falso "No hay horas" mientras carga, y la carga de horas no maneja errores. — `reservar-form.component.ts:102-106, 240-247`
- **P2** — Hay que mover el foco al cambiar de paso (reserva y registro) y al confirmar. — `reservar-form`, `register`, `reservar-confirmacion`
- **P2** — La confirmación tiene que repetir qué, cuándo, con quién y dónde. — Nuevos inputs en `reservar-confirmacion`
- **P2** — Faltan `title` por ruta en la auth y "Recordarme" no está conectado. — `auth.routes.ts`, `login.component.ts`
- **P2** — Los mensajes de la API vienen sin tildes ("contrasena", "esta registrado"). — `auth.service.ts:108-112, 267-273`
- **P2** — Hacer que el motivo del límite de plan sea alcanzable con `aria-disabled` requiere bloquear el clic. — servicios, empleados y sucursales
- **P3** — Faltan tildes en "Miercoles" y "Sabado" (hay que revisar si la API los usa como clave). — `horarios.component.ts:16, 19, 260, 287`
- **P3** — "Link de reserva invalido" va sin tilde. — `reservar-page.component.ts:48`
- **P3** — El badge "Programada" de Pagos sale en gris por `getEstadoClase`, y la hora se muestra en 12 h. — `pagos.component.ts`
- **P3** — Hay estilos inline en `reservar-confirmacion`, `servicio-dialog`, `empleado-dialog` y `map-picker`. — Pasarlos a `.scss` requiere `styleUrl`.
- **P3** — Esc y el foco del menú móvil de la landing. — `navbar.component.ts`
- **P3** — Rubros tiene dos baldosas doradas (Barbería y Cosmetología). El tono vive en los datos. — `rubros.component.ts:34, 56`
- **P3** — Falta "Rubros" en la navbar, que sí está en el footer. — `navbar.component.ts` (arreglo `links`)
- **P3** — La fecha de actualización de los legales debería ir en `<time datetime>`, pero el valor viene como texto. — `legal-page.component.ts`, `privacidad` y `terminos`
- **P2** — El índice legal no tiene scroll-spy ni mueve el foco a la sección. — `legal-page.component.ts`
- **P2** — Faltan el canal de contacto y la duración de la prueba en el FAQ. Los textos viven en `faq.component.ts` y además falta el dato del usuario.
- **P2** — Horarios acepta una apertura posterior al cierre y no avisa si hay cambios sin guardar. — `horarios.component.ts`
- **P3** — La confirmación al eliminar usa el `confirm()` nativo, que es el TS mínimo autorizado. Para que tenga la estética del sistema haría falta un diálogo propio, que sería un componente nuevo. — las 4 listas del admin
- **P3** — Los vacíos de Inicio y Bloqueos nombran la página ("**Servicios**", "**Empleados**") en vez de enlazarla, porque `RouterLink` no está importado en esos componentes. — `home.component.ts`, `bloqueos.component.ts`

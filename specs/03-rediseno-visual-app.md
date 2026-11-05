# SPEC 03 — Rediseño visual de la app con taste-skill

> **Estado:** Aprobado
> **Depende de:** SPEC 02 (`specs/02-suscripcion-front.md`)
> **Fecha:** 2026-11-04
> **Objetivo:** Rediseñar la landing, auth, la reserva pública y el panel admin con una dirección de arte nueva definida con taste-skill, manteniendo los iconos, el negro y el dorado, sin cambiar la lógica de la app.

## Por qué existe este spec

La app se ve como una plantilla "premium genérica": fondo negro, dorado, Inter con Playfair y cards iguales. Este spec define una dirección de arte propia y la aplica a toda la app.

El producto es sobre todo para barberías y peluquerías. También sirve para cualquier negocio que agenda horas, como estudios de tatuaje, cosmetología, uñas o spa. El diseño tiene que transmitir las dos cosas.

Se usa el skill `taste-skill` (design-taste-frontend). Sirve para elegir la dirección (idea, composición, tipografía, paleta, fotos y secciones), aplicar sus reglas anti-slop y revisar el resultado con su loop de screenshots.

## Alcance

**Entra:**

- **Dirección de arte.** Se elige con taste-skill y se registra al final de este spec, en la sección "Dirección elegida", antes de tocar código.
- **Tokens globales.** Colores, tipografía, espaciado, radios, sombras y duraciones van como variables en `:root`. Se mantienen los valores actuales de `--bg-primary` (`#0a0a0a`) y `--gold` (`#c9a84c`), y se pueden agregar neutros y variantes del dorado como tokens nuevos.
- **Tipografía nueva.** La elige la dirección de arte y se carga desde Google Fonts. Reemplaza a Inter y Playfair Display.
- **Tema M3 de Angular Material.** Se genera con `mat.theme` a partir del dorado y en modo oscuro. Reemplaza al prebuilt `pink-bluegrey`.
- **Landing reestructurada.** Se pueden reordenar, fusionar o agregar secciones y reescribir los textos.
- **Mensaje multi-rubro.** La barbería y la peluquería protagonizan el hero y la estética. Una sección propia muestra los demás rubros (tatuaje, cosmetología, uñas, spa) con foto y texto.
- **Fotos stock libres.** Se toman de Unsplash o Pexels, se descargan a `public/images/` y se optimizan (WebP, ancho máximo 1920px).
- **Motion rico en la landing.** Usa GSAP + ScrollTrigger para la secuencia de entrada del hero, los reveals al hacer scroll y el pin o el parallax donde la dirección lo pida.
- **Motion sobrio fuera de la landing.** En auth, reserva y admin solo hay transiciones CSS cortas (hover, focus, aparición de diálogos y estados).
- **Restyling de auth.** Login y registro cambian solo en template y SCSS.
- **Restyling de la reserva pública.** `reservar-page`, `reservar-form` y `reservar-confirmacion` cambian solo en template y estilos.
- **Restyling del panel admin.** Incluye el layout (sidebar, banner y chip de plan del SPEC 02), las 9 páginas y los 5 diálogos. Solo cambian template y estilos.
- **`prefers-reduced-motion`.** Se respeta en GSAP (con `gsap.matchMedia`) y en CSS.
- **Responsive.** Todas las páginas se ven bien a 375px y a 1440px, sin scroll horizontal.

**Fuera de alcance (para specs futuros):**

- Cambios de lógica TS: servicios, formularios reactivos, validaciones, rutas, guards e interceptores.
- Cambios en el flujo de la reserva pública, como el orden de pasos o los campos.
- Cambios en el flujo del admin, como la navegación o las páginas nuevas o fusionadas.
- Modo claro.
- Componentes UI compartidos nuevos en `shared/` (por ejemplo `app-page-header` o `app-empty-state`).
- Reemplazar los iconos. Se sigue usando Material Icons (`<mat-icon>`).
- Cambiar el logo (`public/logo.png`) o el favicon.
- Pasar a archivos `.html` y `.scss` los diálogos con template o estilos inline. Se restilizan en su lugar.
- Cambiar los planes, precios o límites de `pricing.component`. Se pueden rediseñar visualmente y mover de lugar, pero los datos quedan iguales.
- Fotos propias de clientes reales.
- Motion rico (GSAP) fuera de la landing.

## Modelo de datos

Este spec no introduce estructuras de datos de negocio ni cambia interfaces. Los cambios estructurales son de estilos y dependencias:

### Estilos globales

- `src/styles.css` pasa a `src/styles.scss`, porque `mat.theme` necesita SCSS. Se actualiza la entrada `styles` en `angular.json` y se quita `@angular/material/prebuilt-themes/pink-bluegrey.css`.
- Los tokens se mantienen en `:root`. Los nombres actuales se conservan para no romper los SCSS existentes:

```scss
:root {
  // Se mantienen (mismo valor)
  --bg-primary: #0a0a0a;
  --gold: #c9a84c;
  --gold-light: #e0c872;
  --gold-dark: #a8893d;

  // Se mantienen (el valor se puede ajustar dentro de la gama neutra oscura)
  --bg-surface: …;
  --bg-surface-elevated: …;
  --bg-surface-hover: …;
  --text-primary: …;
  --text-secondary: …;
  --text-muted: …;
  --border: …;
  --border-light: …;

  // Nuevos (los nombres exactos se fijan en "Dirección elegida")
  --font-display: …;
  --font-body: …;
  --radius-sm: …;
  --radius-md: …;
  --radius-lg: …;
  --space-*: …;
  --shadow-*: …;
  --ease-out: …;
  --duration-fast: …;
  --duration-base: …;
}
```

### Dependencias nuevas

- `gsap`, incluido `ScrollTrigger`. Solo se importa en componentes de `features/landing/`.

### Archivos nuevos

- `src/app/features/landing/directives/scroll-reveal.directive.ts`: directiva `appScrollReveal` que registra el reveal con ScrollTrigger solo en el navegador.
- `public/images/landing/*.webp`: fotos stock optimizadas, una por uso (hero, rubros y secciones).
- `public/images/landing/CREDITOS.md`: autor, fuente y URL de cada foto.

### Reglas de motion (landing)

- GSAP solo corre en el navegador, dentro de `afterNextRender`. Nunca se ejecuta en el render SSR.
- Cada componente que anima guarda su `gsap.context()` y llama a `revert()` en `DestroyRef.onDestroy`.
- Con `prefers-reduced-motion: reduce` no hay animaciones de entrada ni parallax: el contenido aparece en su estado final.
- El contenido es visible sin JS. El estado oculto inicial lo aplica GSAP, nunca el CSS.

## Plan de implementación

Cada fase deja la app compilando y usable. Las páginas que todavía no se rediseñaron conservan el estilo anterior, pero pasan a usar los tokens nuevos.

1. **Dirección de arte.** Correr taste-skill sobre la landing actual y elegir una dirección: idea, composición, par tipográfico, uso del negro y el dorado, tipo de fotografía y blueprint de secciones. Agregarla al final de este spec como "Dirección elegida", con el par tipográfico, los tokens nuevos y la lista de secciones de la landing. No se toca código.
2. **Base global.** Renombrar `styles.css` a `styles.scss`, actualizar `angular.json`, crear el tema M3 con `mat.theme` (oscuro, desde el dorado), quitar el prebuilt, agregar los tokens nuevos y cargar las fuentes nuevas. Quitar los overrides `!important` que el tema ya cubre (por ejemplo, `.dialog-panel`). Verificar: `ng build` pasa, y los diálogos, inputs y snackbars siguen siendo oscuros y dorados.
3. **GSAP.** Instalar `gsap` y crear `scroll-reveal.directive.ts` con soporte SSR y reduced-motion. Verificar: `ng build` pasa y el render SSR de `/` no tiene errores de `window is not defined`.
4. **Fotos.** Descargar, convertir a WebP y guardar las fotos en `public/images/landing/` con `CREDITOS.md`. Cada foto pesa como máximo 300 KB.
5. **Landing: navbar y hero.** Rediseñar `navbar` y `hero` según la dirección, con la secuencia de entrada en GSAP. Barbería y peluquería protagonistas.
6. **Landing: secciones de cuerpo.** Rediseñar o reestructurar `features-section`, `how-it-works` y `testimonials`, y agregar la sección de rubros (tatuaje, cosmetología, uñas, spa). Las secciones nuevas son componentes nuevos en `features/landing/components/`, y `landing.component.html` se actualiza con el orden nuevo.
7. **Landing: pricing, CTA y footer.** Rediseñar `pricing` (con los mismos planes y precios), `cta` y `footer`. Aplicar los reveals con `appScrollReveal`.
8. **Loop de revisión de la landing.** Tomar capturas a 375px y 1440px, revisarlas con el inspector de taste-skill y corregir hasta que no queden fallas.
9. **Auth.** Restilizar `login` y `register` con la dirección nueva y transiciones CSS.
10. **Reserva pública.** Restilizar `reservar-page`, `reservar-form` y `reservar-confirmacion`, sin cambiar pasos, campos ni validaciones.
11. **Admin: layout.** Restilizar el sidebar, el header, el banner de aviso y el chip de plan del SPEC 02. Se mantienen sus colores por estado (Prueba ámbar, Gratis gris, Pro dorado y por vencer rojo).
12. **Admin: home y pagos.** Restilizar `home` (dashboard de reservas) y `pagos`, con `reserva-detail-dialog`.
13. **Admin: listas.** Restilizar `servicios`, `empleados` y `sucursales` con sus diálogos. Se mantienen la etiqueta "Desactivado por plan" y el botón "Agregar" deshabilitado del SPEC 02.
14. **Admin: agenda y configuración.** Restilizar `horarios`, `bloqueos` (con `bloqueo-dialog`) y `configuracion`, incluida la sección "Tu plan" del SPEC 02.
15. **Loop de revisión de la app.** Tomar capturas a 375px y 1440px de auth, reserva y cada página del admin, revisarlas con el inspector de taste-skill (modo app screens) y corregir hasta que no queden fallas.

## Criterios de aceptación

- [ ] La sección "Dirección elegida" existe al final de este spec con el par tipográfico, los tokens nuevos y la lista de secciones de la landing.
- [ ] `--bg-primary` sigue siendo `#0a0a0a` y `--gold` sigue siendo `#c9a84c`.
- [ ] Ya no se cargan Inter ni Playfair Display, y se cargan las fuentes de la dirección elegida.
- [ ] `angular.json` ya no referencia `pink-bluegrey.css` y el tema se define con `mat.theme` en `src/styles.scss`.
- [ ] Todos los iconos siguen siendo `<mat-icon>` de Material Icons y no se agregó otra librería de iconos.
- [ ] La landing tiene una sección que nombra y muestra con foto al menos tatuaje, cosmetología y uñas o spa.
- [ ] El hero de la landing muestra barbería o peluquería como rubro principal.
- [ ] Todas las fotos de la landing están en `public/images/landing/` en WebP, pesan 300 KB o menos y figuran en `CREDITOS.md`.
- [ ] Al cargar `/`, el hero tiene una secuencia de entrada animada con GSAP y las secciones aparecen al hacer scroll.
- [ ] Con `prefers-reduced-motion: reduce` activado en el sistema, la landing no anima entradas ni parallax y todo el contenido es visible.
- [ ] El HTML que genera SSR para `/` contiene todo el texto de la landing visible (sin `opacity: 0` en línea).
- [ ] `gsap` no se importa en ningún archivo fuera de `src/app/features/landing/`.
- [ ] Los planes, precios y límites de `pricing` son los mismos que antes del rediseño.
- [ ] `git diff` no muestra cambios en archivos `*.service.ts`, `*.interceptor.ts`, `*.guard.ts`, `*.routes.ts` ni `src/app/core/interfaces/`.
- [ ] Login, registro, reserva pública completa, crear, editar y eliminar un servicio, y crear un bloqueo siguen funcionando igual que antes.
- [ ] El banner de aviso, el chip de plan con sus 4 colores, la sección "Tu plan", la etiqueta "Desactivado por plan" y el botón "Agregar" deshabilitado del SPEC 02 se siguen viendo y funcionando.
- [ ] Ninguna página tiene scroll horizontal a 375px.
- [ ] El inspector de taste-skill no reporta fallas en las capturas a 375px y 1440px de la landing, login, registro, reserva y cada página del admin.
- [ ] `ng build` termina sin errores.
- [ ] `node dist/AgendaFlow/server/server.mjs` sirve `/` sin errores en la consola del servidor.

## Decisiones

- **Sí:** toda la app en un solo spec, por decisión del usuario. El plan va en fases por área y cada fase deja la app funcionando.
- **No:** dividir en specs por área (landing, auth, reserva y admin). Se propuso y se descartó.
- **Sí:** la identidad (negro `#0a0a0a` y dorado `#c9a84c`) queda fija. Los neutros se pueden ajustar y se agregan tokens nuevos.
- **No:** usar solo las 12 variables actuales. Limita demasiado una dirección de arte nueva.
- **No:** modo claro. Duplica el trabajo de color y va en otro spec si se hace.
- **Sí:** tipografía libre según taste-skill. Inter con Playfair es el par "premium genérico" que se quiere dejar atrás.
- **Sí:** fotos stock libres descargadas al repo, con créditos. Muestran el carácter multi-rubro sin depender de un CDN externo.
- **No:** hotlinking a Unsplash. Depende de un tercero y es más lento.
- **Sí:** barbería y peluquería protagonistas, con una sección propia para los demás rubros. Es el público principal y no se pierde el multi-rubro.
- **No:** hero con rubro rotativo ni mensaje neutro. Diluyen el posicionamiento.
- **Sí:** en la landing se puede cambiar estructura y contenido. En el resto de la app solo cambian template y estilos.
- **No:** reorganizar los flujos del admin o de la reserva. Es un cambio de producto, no de diseño.
- **Sí:** GSAP + ScrollTrigger para el motion de la landing. Es sólido, agnóstico de framework y gratuito.
- **No:** Motion (motion.dev). Tiene menos ecosistema para secuencias y pins complejos.
- **Sí:** motion rico solo en la landing y CSS sobrio en el resto. En pantallas de trabajo la animación estorba.
- **Sí:** tema M3 propio con `mat.theme`. Elimina la mayoría de los overrides `!important` sobre el prebuilt.
- **Sí:** solo tokens y clases globales. Los diálogos inline se restilizan sin pasar a archivos separados, para no mezclar refactor con rediseño.
- **No:** crear componentes shared nuevos (`app-page-header`, `app-empty-state` y otros).
- **Sí:** se conservan los nombres actuales de las variables CSS, para que los SCSS que no se rediseñaron sigan funcionando entre fases.
- **Sí:** la dirección de arte se registra en este mismo spec antes de escribir código. Así la implementación sigue un contrato y no se improvisa.

### Ajustes después de la revisión del usuario (2026-11-04)

- **Sí:** navbar fija de la landing, una barra delgada y opaca (sin blur) con logo, enlaces, "Iniciar sesión" y el botón dorado "Empezar gratis". Reemplaza a los bloques pegados al mosaico, que no convencían. Los enlaces usan `routerLink="/"` con `fragment`, y `app.config.ts` activa `withInMemoryScrolling` para el scroll a anclas.
- **Sí:** footer compacto con la marca, las columnas Producto, Legal y Cuenta, y una fila con copyright y créditos de fotos. Sale el wordmark gigante.
- **Sí:** páginas `/privacidad` y `/terminos` en esta rama, por decisión del usuario. **Amplía el alcance:** agrega dos rutas en `features/landing/landing.routes.ts`, sin tocar `app.routes.ts`. El registro enlaza a ambas.
- **Sí:** no hay banner de cookies. La app no usa cookies ni analítica; solo almacenamiento estrictamente necesario (`localStorage` y `sessionStorage`), detallado en la sección "Cookies y almacenamiento" de la Política de privacidad.
- **Pendiente:** los textos legales son una base. Deben revisarlos un abogado antes de publicar. Marco citado: Ley 19.628, Ley 21.719 y Ley 19.496.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| GSAP se ejecuta en SSR y rompe el render | Solo corre dentro de `afterNextRender` y se importa solo en la landing. Lo verifica el criterio del render SSR. |
| El contenido queda invisible si falla el JS o en SSR | El estado oculto inicial lo aplica GSAP en el navegador, nunca el CSS. |
| Fugas de ScrollTrigger al navegar entre rutas | Cada componente guarda su `gsap.context()` y llama a `revert()` en `onDestroy`. |
| Al cambiar el tema M3, se rompe el look de diálogos, inputs y snackbars existentes | La fase 2 verifica esos componentes antes de seguir. Los overrides se quitan solo cuando el tema ya los cubre. |
| Un cambio de template rompe un binding o un formulario | Solo cambian estilos y estructura de marcado. Los bindings, `formControlName` y eventos se conservan. Lo verifican los flujos clave probados a mano. |
| Spec grande que queda a medio implementar | Las fases son independientes y cada una deja la app funcionando. Se puede pausar entre fases. |
| Las fotos stock pesan demasiado | WebP con ancho máximo de 1920px y 300 KB por foto, con `loading="lazy"` fuera del hero. |
| Licencia de las fotos | Solo se usan Unsplash o Pexels (licencia libre) y la fuente queda registrada en `CREDITOS.md`. |

## Qué **no** entra en este spec

- Cambios de lógica, servicios, rutas, guards, interceptores o interfaces.
- Cambios en el flujo de la reserva pública o del admin.
- Modo claro.
- Componentes UI compartidos nuevos.
- Otra librería de iconos, logo nuevo o favicon nuevo.
- Pasar a archivos `.html` y `.scss` los diálogos con template o estilos inline.
- Cambios en planes, precios o límites.
- Motion rico (GSAP) fuera de la landing.

Cada uno, si se hace, va en su propio spec.

## Dirección elegida

Registrada en el paso 1 con taste-skill (2026-11-04). La hoja completa está en `.taste-skill/direction.json` y se reimprime con `node ~/.claude/skills/taste-skill/scripts/draw.mjs --show`.

### Dirección

- **Nombre:** `editorial-report` — "The printed annual". Semilla `331362986`, sector `saas`, `--keep palette`, `--have product-ui`.
- **Descartadas:** `loud-flat-poster` (estridente para un SaaS que también vende a spas y cosmetología) y `colour-chapters` (necesita varios colores de campo y la paleta está fija en negro y dorado).
- **Idea:** en esta página, la columna de horas de la libreta de turnos del mostrador se convierte en el eje del 42%. La zona izquierda es el margen de las horas (notas, cifras, horarios) y el contenido se anota a la derecha, como un turno.
- **Lo vivo:** en la sección "showcase", el visitante elige qué ve: la página de reservas, la confirmación, la agenda del día o el pago. Una hoja real de la app, construida en HTML con datos que cuadran, cambia con un crossfade de 200 ms. En la hoja de la página de reservas, elegir un servicio (corte, corte + barba, color, tatuaje pequeño) recalcula las horas libres según la duración del servicio.
- **Gesto principal (motion):** titular enmascarado. Cada línea del h1 sube desde su línea base (900 ms, ease-out fuerte, la segunda 110 ms después). Después aparecen el texto de apoyo y el botón. El resto: entradas escalonadas por sección (60–90 ms, 16–32 px), feedback en todos los controles y una imagen en movimiento (scale lento o scroll-linked sobre una foto del mosaico).

### Antes (inspector sobre la landing actual)

`.taste-skill/before/`: 13 FAIL y 7 WARN. Eyebrows y pill badge, numeración 01–04, micro-labels en mayúsculas, gradientes y texto con gradiente, hairlines y cajas de 1 px, dos filas de icon-cards, cero fotos, el primer pantallazo sin elemento dominante (64 px = 4,4vw), página quieta y 12 tamaños de letra.

### Tipografía

- **Display:** Young Serif 400, tracking -0.02em, leading 0.95, sentence case.
- **Texto:** Source Serif 4, 400 cuerpo, 600 énfasis, itálica para citas, leading 1.55.
- Se carga desde Google Fonts:
  `https://fonts.googleapis.com/css2?family=Young+Serif:wght@400&family=Source+Serif+4:ital,wght@0,400;0,600;1,400;1,600&display=swap`
- Se usa el mismo par en toda la app (auth, reserva y admin) y se deja de cargar Inter y Playfair Display.

### Tokens nuevos

Se agregan a `:root` junto a los 12 actuales (que conservan nombre; `--bg-primary` y `--gold` conservan valor):

```scss
:root {
  // Tipografía
  --font-display: 'Young Serif', Georgia, serif;
  --font-body: 'Source Serif 4', Georgia, serif;
  --step-small: clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem); // 13–14px
  --step-body: clamp(1.125rem, 1.05rem + 0.3vw, 1.3125rem); // 18–21px (admin usa 16px)
  --step-lead: clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem); // 20–26px
  --step-head: clamp(2rem, 1.3rem + 3.2vw, 4rem); // 32–64px
  --step-display: clamp(4rem, 8.3vw, 8rem); // 64–128px

  // Campos de color (bloques planos, sin gradiente)
  --field-ink: #0a0a0a; // = --bg-primary
  --field-char: #161513; // carbón, un paso sobre el fondo
  --field-gold: #c9a84c; // = --gold, con texto en --on-gold
  --field-bone: #e6e4df; // neutro claro frío, solo como campo de sección
  --on-gold: #0a0a0a;
  --on-bone: #0a0a0a;

  // Geometría
  --axis: 42vw; // el eje; en móvil colapsa al margen
  --margin: clamp(16px, 2vw, 32px);
  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0; // esquinas rectas en botones, fotos y campos
  --space-section: clamp(120px, 14vw, 200px);

  // Motion
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 160ms;
  --duration-base: 240ms;
  --duration-reveal: 900ms;
}
```

- Sin sombras en reposo (`--shadow-*` solo para menús y diálogos que flotan).
- El dorado va en la acción principal y en un solo campo de color por pantalla.
- Fotos en escala de grises: `filter: grayscale(1) contrast(1.05)`.
- Botones rectangulares, 44 px o más de alto.

### Secciones de la landing, en orden

1. **Hero — mosaico de cabecera y título en el eje.** El 52% superior es un mosaico sin gutters de 6×2: cuatro fotos en gris (barbería y peluquería) y celdas planas en dorado, carbón y hueso. La barra se apoya sobre el mosaico: el logo en un bloque de tinta, una pestaña dorada con los enlaces y "Iniciar sesión" a la derecha. Abajo, el h1 en dos líneas en `--step-display` desde el eje, con el texto de apoyo y el botón "Empezar gratis". En móvil: mosaico de 3×2 y título a 13vw.
2. **Showcase — índice de salidas y hoja viva.** A la izquierda, cuatro botones grandes: "Tu página de reservas", "La confirmación", "La agenda del día" y "El pago". A la derecha, la hoja de la app (`data-ui`) recortada por el escenario. Es "lo vivo".
3. **Features — comparación como texto.** "AgendaFlow" frente a "Libreta" y "WhatsApp", en 7 a 9 filas, con respuestas en palabras. La columna de AgendaFlow es un bloque dorado. Solo se listan funciones que existen: reservas online 24/7, sucursales, empleados, servicios con duración y precio, horarios, bloqueos de agenda, pagos y panel del día.
4. **Gallery — muro de rubros.** Una grilla de 4 columnas de tiles cuadrados con palabras (Barbería, Peluquería, Tatuaje, Uñas, Cosmetología, Spa, Masajes, Cejas y pestañas), con una foto cada tres o cuatro celdas. Cumple el "mensaje multi-rubro" del alcance.
5. **How-it-works — etapas como una barra.** Una barra de 3 segmentos proporcional a la duración real: "Dos minutos" (crear la cuenta), "Una tarde" (cargar servicios, equipo y horarios) y "Desde ese día" (los clientes reservan solos). Sin números 01, 02 ni 03.
6. **Pricing — dos planes, dos campos.** Gratis en campo hueso (columnas 1–5) y Pro en campo dorado (6–12), a sangre. Precios y textos iguales a los actuales: $0 "para siempre" y $19.990 "/mes", con sus mismas características escritas como párrafo.
7. **FAQ — respuestas como texto corrido.** Nueva. De 8 a 10 preguntas reales sobre el producto (cómo reservan mis clientes, varias sucursales, qué pasa al vencer la prueba, qué incluye el plan Gratis, etc.).
8. **CTA — la idea invertida.** Un campo hueso con tinta negra y un titular que hace eco del hero, una frase y el botón dorado.
9. **Footer — el nombre primero.** "AgendaFlow" a todo el ancho, recortado por abajo (nunca por arriba). Luego los enlaces, la línea legal y "volver arriba".

### Cambios de contenido decididos en este paso

- **Sale `testimonials`.** Las tres citas son inventadas, y la regla de taste-skill prohíbe prueba social falsa.
- **Sale "500+ negocios ya registrados"** del hero y del CTA, por la misma razón.
- **Las funciones se reescriben.** Los textos actuales prometen IA, SMS, punto de venta, inventario y "80% menos inasistencias", que la app no tiene. La copia nueva solo describe lo que existe.
- **La navegación pasa a:** Cómo se ve, Funciones, Precios y Preguntas.

### Imágenes

- Fotos stock de Unsplash o Pexels (lo que dice el alcance), en gris: barbería y peluquería para el mosaico del hero, y tatuaje, uñas, cosmetología y spa para el muro de rubros. Son entre 6 y 8 fotos en total.
- Los fragmentos de interfaz del showcase son HTML real de la app (`data-ui`) y cuentan como imágenes para el inspector.
- No se usan las fotos de atmósfera ("Fog and quiet") que propuso la hoja: no aportan al tema.

### Panel admin, auth y reserva

En los pasos 9 a 15 se toma el estilo de app con `draw.mjs --app --keep palette,type`, para que comparta la paleta y el par tipográfico. Las reglas de app-screens (bordes suaves, labels pequeños y paneles repetidos permitidos) reemplazan ahí a las reglas de página.
